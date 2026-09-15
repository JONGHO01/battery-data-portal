"""Authenticated local workspace. Contracts documented in docs/DATA_WORKSPACE.md."""
import hashlib
import json
from fastapi import Body, Depends, Header, HTTPException, Query
from fastapi.responses import Response
from .data_workspace import material_candidate, transform, validate_profile


def ensure_schema(conn, execute):
    execute(conn, '''CREATE TABLE IF NOT EXISTS workspace_profiles (
        dataset_id TEXT PRIMARY KEY REFERENCES datasets(id) ON DELETE CASCADE,
        profile_json TEXT NOT NULL, revision INTEGER NOT NULL, updated_at TEXT NOT NULL)''')
    execute(conn, '''CREATE TABLE IF NOT EXISTS workspace_versions (
        id TEXT PRIMARY KEY, dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
        actor_id TEXT NOT NULL, manifest_json TEXT NOT NULL, created_at TEXT NOT NULL)''')
    execute(conn, 'CREATE INDEX IF NOT EXISTS idx_workspace_versions_dataset ON workspace_versions(dataset_id, created_at)')


def install(app, p):
    def checked(conn, dataset_id, user):
        row = p.execute(conn, 'SELECT * FROM datasets WHERE id = ?', (dataset_id,)).fetchone()
        if not row or not p.can_view_row(conn, user, row):
            raise HTTPException(404, '데이터를 찾을 수 없습니다.')
        return row

    def profile(conn, dataset_id):
        record = p.execute(conn, 'SELECT * FROM workspace_profiles WHERE dataset_id = ?', (dataset_id,)).fetchone()
        return (json.loads(record['profile_json']), record['revision']) if record else ({}, 0)

    def entry(conn, row):
        info, revision = profile(conn, row['id'])
        cell = p.json_loads(row['cell_json'], {})
        material = info.get('material') or cell.get('material', '')
        return {'id': row['id'], 'sourceName': row['source_name'], 'ownerId': row['owner_id'],
                'ownerName': row['owner_name'], 'dataType': row['data_type'], 'rowCount': row['row_count'],
                'updatedAt': row['updated_at'], 'profile': info, 'revision': revision,
                'materialCandidate': material_candidate(material), 'trainingStatus': 'not_authorized'}

    @app.get('/api/data-workspace/files')
    def files(q: str = Query('', max_length=120), page: int = Query(1, ge=1), user=Depends(p.get_current_user)):
        with p.connect() as conn:
            # Restrict before matching or returning any filename/metadata.
            sql, params = 'SELECT * FROM datasets', ()
            if p.user_field(user, 'role') != 'admin':
                sql += ' WHERE owner_id = ?'
                params = (user['id'],)
            rows = p.execute(conn, sql + ' ORDER BY created_at DESC, id', params).fetchall()
            items = [entry(conn, r) for r in rows]
        terms = q.casefold().split()
        items = [x for x in items if all(t in json.dumps(x, ensure_ascii=False).casefold() for t in terms)]
        return {'items': items[(page-1)*20:page*20], 'total': len(items), 'page': page, 'pageSize': 20,
                'aiEnabled': False}

    @app.put('/api/data-workspace/files/{dataset_id}/profile')
    def save_profile(dataset_id: str, payload: dict = Body(...), user=Depends(p.get_current_user)):
        try:
            info = validate_profile(payload.get('profile'))
        except ValueError as exc:
            raise HTTPException(400, str(exc)) from exc
        expected = payload.get('revision')
        if type(expected) is not int or expected < 0:
            raise HTTPException(400, '분류 버전을 확인해주세요.')
        with p.connect() as conn:
            checked(conn, dataset_id, user)
            if profile(conn, dataset_id)[1] != expected:
                raise HTTPException(409, '분류 버전이 변경되었습니다. 새로고침해주세요.')
            # Atomic compare-and-set; concurrent edits must not silently overwrite.
            result = p.execute(conn, '''INSERT INTO workspace_profiles(dataset_id,profile_json,revision,updated_at)
                VALUES (?, ?, 1, ?) ON CONFLICT(dataset_id) DO UPDATE SET
                profile_json=excluded.profile_json, revision=workspace_profiles.revision+1,
                updated_at=excluded.updated_at WHERE workspace_profiles.revision = ?''',
                (dataset_id, p.json_dumps(info), p.now_iso(), expected))
            if result.rowcount != 1:
                raise HTTPException(409, '다른 변경이 있습니다. 목록을 새로고침해주세요.')
            return {'profile': info, 'revision': profile(conn, dataset_id)[1]}

    def prepared(conn, dataset_id, payload, user):
        row = checked(conn, dataset_id, user)
        # load_analysis_rows reads the complete retained artifact, not UI samples.
        item = p.dataset_from_row(row)
        rows, provenance = p.load_analysis_rows(item, include_review_rows=True)
        if len(rows) > 200000:
            raise HTTPException(413, '현재 전처리는 200,000행 이하를 지원합니다.')
        try:
            result = transform(rows, payload.get('recipe', {}))
        except ValueError as exc:
            raise HTTPException(400, str(exc)) from exc
        fingerprint = hashlib.sha256(p.json_dumps({'rows':rows, 'recipe':result['recipe']}).encode()).hexdigest()
        return item, result, fingerprint, provenance

    @app.post('/api/data-workspace/files/{dataset_id}/preview')
    def preview(dataset_id: str, payload: dict = Body(...), user=Depends(p.get_current_user)):
        with p.connect() as conn:
            _, result, fingerprint, provenance = prepared(conn, dataset_id, payload, user)
        return {**result, 'rows':result['rows'][:20], 'fingerprint':fingerprint, 'provenance':provenance}

    @app.post('/api/data-workspace/files/{dataset_id}/versions', status_code=201)
    def save_version(dataset_id: str, payload: dict = Body(...), user=Depends(p.get_current_user)):
        if payload.get('confirmed') is not True:
            raise HTTPException(400, '미리보기 확인 후 저장해주세요.')
        with p.connect() as conn:
            item, result, fingerprint, provenance = prepared(conn, dataset_id, payload, user)
            if payload.get('fingerprint') != fingerprint:
                raise HTTPException(409, '데이터 또는 설정이 바뀌었습니다. 다시 미리보기해주세요.')
            version_id, now = p.make_id('PREP'), p.now_iso()
            info, _ = profile(conn, dataset_id)
            # Recipe + content fingerprint are the immutable version. Recreate on
            # export only when source matches, never return a silently changed file.
            manifest = {k:v for k,v in result.items() if k != 'rows'}
            manifest.update({'id':version_id, 'datasetId':dataset_id, 'fingerprint':fingerprint,
                'profile':info, 'provenance':provenance, 'sourceName':item['sourceName'],
                'parser':item.get('parser', {}), 'createdAt':now, 'trainingStatus':'not_authorized'})
            p.execute(conn, 'INSERT INTO workspace_versions(id,dataset_id,actor_id,manifest_json,created_at) VALUES (?,?,?,?,?)',
                      (version_id,dataset_id,user['id'],p.json_dumps(manifest),now))
        return manifest

    @app.get('/api/data-workspace/files/{dataset_id}/versions')
    def versions(dataset_id: str, user=Depends(p.get_current_user)):
        with p.connect() as conn:
            checked(conn, dataset_id, user)
            rows = p.execute(conn, 'SELECT manifest_json FROM workspace_versions WHERE dataset_id=? ORDER BY created_at DESC LIMIT 100', (dataset_id,)).fetchall()
        return [json.loads(r['manifest_json']) for r in rows]

    @app.get('/api/data-workspace/files/{dataset_id}/versions/{version_id}/download')
    def download_version(dataset_id: str, version_id: str, user=Depends(p.get_current_user)):
        with p.connect() as conn:
            checked(conn,dataset_id,user)
            version = p.execute(conn, 'SELECT manifest_json FROM workspace_versions WHERE id=? AND dataset_id=?', (version_id,dataset_id)).fetchone()
            if not version:
                raise HTTPException(404, '처리 버전을 찾을 수 없습니다.')
            manifest = json.loads(version['manifest_json'])
            _, result, fingerprint, _ = prepared(conn,dataset_id,{'recipe':manifest['recipe']},user)
            if fingerprint != manifest['fingerprint']:
                raise HTTPException(409, '기준 데이터가 변경되어 이 버전을 재현할 수 없습니다. 원본과 이력을 확인해주세요.')
        return Response(p.json_dumps({'manifest':manifest,'rows':result['rows']}), media_type='application/json',
                        headers={'Content-Disposition':'attachment; filename="preprocessed.json"'})

    @app.get('/api/data-workspace/files/{dataset_id}/download')
    def download_source(dataset_id: str, x_admin_raw_access: str | None = Header(None), user=Depends(p.get_current_user)):
        with p.connect() as conn:
            row = checked(conn,dataset_id,user)
            if p.user_field(user,'role') == 'admin':
                p.require_admin_raw_access(x_admin_raw_access,user)
            return p.raw_artifact_download_response(row)
