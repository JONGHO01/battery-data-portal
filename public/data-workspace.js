/* Local catalogue, explicit preprocessing and an honestly labelled search chat. */
window.DataWorkspace = (() => {
  let generation = 0, selected = null, preview = null, page = 1, ctx, root;
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
  function button(text, action) { const b = el('button', text); b.type = 'button'; b.onclick = () => Promise.resolve().then(action).catch(error => status(error.message)); return b; }
  function status(message) { const n = root?.querySelector('[data-status]'); if (n) n.textContent = message; }
  function reset() { generation++; selected = preview = null; root?.replaceChildren(); }
  async function request(path, method='GET', body) {
    const ticket = generation;
    const response = await fetch('/api/data-workspace/' + path, {method, headers:ctx.headers({'Content-Type':'application/json'}), body:body ? JSON.stringify(body) : undefined});
    if (!response.headers.get('content-type')?.includes('application/json')) throw Error('새 데이터 관리 API가 아직 실행되지 않았습니다. 서버 재시작이 필요합니다.');
    const data = await response.json();
    if (ticket !== generation) throw Error('사용자가 변경되었습니다.');
    if (!response.ok) throw Error(typeof data.detail === 'string' ? data.detail : '요청에 실패했습니다.');
    return data;
  }
  function field(label, value='', type='text') {
    const wrap = el('label', label), input = el('input'); input.type=type; input.value=value;
    wrap.append(input); return {wrap,input};
  }
  async function download(path, filename) {
    const ticket = generation;
    const response = await fetch('/api/data-workspace/'+path, {headers:ctx.rawHeaders()});
    if (!response.ok) { const body=await response.json(); throw Error(body.detail || '다운로드 실패'); }
    const blob=await response.blob(); if(ticket!==generation)return;
    const url=URL.createObjectURL(blob), a=el('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function open(context) {
    reset(); ctx=context; page=1; root=document.getElementById('filesView');
    root.replaceChildren(); root.classList.add('dw');
    root.append(el('h2','데이터 관리 · 전처리'),el('p','본인 데이터만 표시합니다. 관리자는 전체 사용자를 조회할 수 있습니다. 원본은 보존하며 외부 AI로 전송하지 않습니다.'));
    const statusNode=el('p','', 'dw-status'); statusNode.dataset.status=''; statusNode.setAttribute('role','status'); root.append(statusNode);
    const bar=el('div','', 'dw-bar'), search=field('파일명 · 물질 · 소유자 · 태그 검색'); search.input.maxLength=120;
    bar.append(search.wrap,button('검색',()=>{page=1;return list();}),button('새로고침',()=>list())); root.append(bar);
    const columns=el('div','', 'dw-columns'), catalogue=el('div'), detail=el('div'); columns.append(catalogue,detail); root.append(columns);
    async function list() {
      const data=await request(`files?q=${encodeURIComponent(search.input.value)}&page=${page}`);
      catalogue.replaceChildren(el('h3',`저장 파일 ${data.total}개`));
      for (const item of data.items) {
        const card=el('article','', 'dw-card'); card.append(el('strong',item.profile.displayName || item.sourceName),
          el('p',`${item.ownerName} · ${item.dataType.toUpperCase()} · ${item.rowCount.toLocaleString()}행`),
          el('small',`원본: ${item.sourceName}`),el('p',`물질: ${item.profile.material || '미분류'} · ${(item.profile.tags||[]).join(', ')}`));
        card.append(button('선택 · 정리',()=>choose(item))); catalogue.append(card);
      }
      const paging=el('div','', 'dw-bar');
      const previous=button('이전',()=>{page--;return list();}), next=button('다음',()=>{page++;return list();});
      previous.disabled=page===1; next.disabled=page*20>=data.total;
      paging.append(previous,el('span',`${page}페이지`),next); catalogue.append(paging);
    }
    async function choose(item) {
      selected=item; preview=null; detail.replaceChildren(el('h3',item.sourceName));
      const actions=el('div','', 'dw-bar'); actions.append(button('Fig 열기',()=>ctx.openFigure(item.id)),
        button('원본 다운로드',()=>download(`files/${encodeURIComponent(item.id)}/download`, item.sourceName)));
      if(ctx.user().role==='admin') actions.append(button('관리자 원본 접근 확인',ctx.openRawAccess));
      detail.append(actions);
      const form=el('div','', 'dw-form'), fields={};
      for(const [key,label] of [['displayName','표시 이름'],['material','표준 물질명'],['composition','조성'],['conditions','실험 조건'],['tags','태그 (쉼표 구분)']]) {
        fields[key]=field(label,key==='tags'?(item.profile.tags||[]).join(', '):(item.profile[key]||'')); form.append(fields[key].wrap);
      }
      detail.append(form);
      if(item.materialCandidate) detail.append(button(`물질명 후보: ${item.materialCandidate} (검토 후 적용)`,()=>{fields.material.input.value=item.materialCandidate;}));
      detail.append(button('분류 저장',async()=>{
        const profile={}; for(const [key,f] of Object.entries(fields))profile[key]=key==='tags'?f.input.value.split(',').map(x=>x.trim()).filter(Boolean):f.input.value;
        const result=await request(`files/${encodeURIComponent(item.id)}/profile`,'PUT',{profile,revision:item.revision});
        item.profile=result.profile; item.revision=result.revision; status('분류를 저장했습니다. 원본 이름은 변경하지 않았습니다.'); await list();
      }));
      detail.append(el('p','모델 학습 활용: 미승인. 분류 저장은 학습 동의가 아닙니다.'));
      const prep=el('section','', 'dw-card'); prep.append(el('h3','전처리 — 원본 유지'));
      const empty=field('완전히 빈 행 제거','','checkbox'); empty.input.checked=false;
      const column=field('환산할 기존 열 (선택)'), output=field('추가할 새 열 이름'), factor=field('환산계수','1','number'), unit=field('새 열 단위');
      const prepform=el('div','', 'dw-form'); prepform.append(empty.wrap,column.wrap,output.wrap,factor.wrap,unit.wrap); prep.append(prepform);
      prep.append(el('small','단위를 자동 추측하지 않습니다. 질량 기준 환산은 검증된 질량을 반영한 계수를 직접 입력하세요.'));
      const resultBox=el('pre'), save=button('미리보기 승인 · 처리 버전 저장',async()=>{
        const saved=await request(`files/${encodeURIComponent(item.id)}/versions`,'POST',{...preview,confirmed:true});
        status('처리 레시피 버전을 저장했습니다. 결과 JSON을 다운로드할 수 있습니다.'); preview=null; save.disabled=true; await history();
      }); save.disabled=true;
      let recipeRevision=0;
      prepform.addEventListener('input',()=>{recipeRevision++;preview=null;save.disabled=true;});
      prep.append(button('전처리 미리보기',async()=>{
        save.disabled=true; preview=null;
        const recipe={dropEmpty:empty.input.checked,column:column.input.value,outputColumn:output.input.value,factor:Number(factor.input.value),unit:unit.input.value};
        const revision=recipeRevision;
        const result=await request(`files/${encodeURIComponent(item.id)}/preview`,'POST',{recipe});
        if(selected!==item || recipeRevision!==revision)return;
        preview={recipe,fingerprint:result.fingerprint};
        resultBox.textContent=`${result.sourceRows} → ${result.resultRows}행 · 빈 행 제거 ${result.removedRows} · 변환 불가 ${result.invalidValues}\n`+JSON.stringify(result.rows,null,2);
        save.disabled=false;
      }),save,resultBox); detail.append(prep);
      const historyBox=el('section','', 'dw-card'); detail.append(historyBox);
      async function history(){const versions=await request(`files/${encodeURIComponent(item.id)}/versions`); if(selected?.id!==item.id)return;
        historyBox.replaceChildren(el('h3','처리 버전 (최근 100개)'));
        historyBox.append(el('small','레시피와 기준 데이터 지문을 보존합니다. 기준 데이터가 수정되면 과거 결과 재현 다운로드는 차단됩니다.'));
        for(const version of versions)historyBox.append(button(`${version.createdAt} · ${version.resultRows}행 · JSON 다운로드`,()=>download(`files/${encodeURIComponent(item.id)}/versions/${encodeURIComponent(version.id)}/download`,'preprocessed.json')));
      } await history();
    }
    const chat=el('section','', 'dw-card'); chat.append(el('h3','로컬 파일 검색 도우미 · AI 미연결'),el('p','파일명·물질 키워드로 검색합니다. 일반 대화·자동 전처리는 OpenAI 연결 전에는 지원하지 않습니다. 대화는 저장하지 않습니다.'));
    const question=field('메시지 (예: LFP 파일 찾아줘)'), messages=el('div'); question.input.maxLength=120;
    chat.append(question.wrap,button('보내기',async()=>{
      const text=question.input.value.trim(); if(!text)return;
      messages.replaceChildren(el('p',`나: ${text}`));
      if(/삭제|전처리|변경|수정/.test(text)){messages.append(el('p','파일을 선택한 뒤 분류·전처리 미리보기 버튼을 이용해주세요. 채팅에서는 데이터를 변경하지 않습니다.'));return;}
      const query=text.replace(/찾아줘|보여줘|검색해줘|파일|데이터|내가|올린|내/g,' ').trim();
      const data=await request(`files?q=${encodeURIComponent(query)}`);
      messages.append(el('p',`접근 가능한 검색 결과 ${data.total}개 (최대 20개 표시)`));
      for(const item of data.items)messages.append(button(item.profile.displayName||item.sourceName,()=>choose(item)));
    }),messages); root.append(chat); await list();
  }
  return {open,reset};
})();
