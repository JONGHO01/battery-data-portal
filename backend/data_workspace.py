"""Local-only, owner-scoped catalogue and reproducible preprocessing recipes.

No model calls, free-form code execution, implicit material assignments or raw writes.
"""
import copy
import math


def material_candidate(value):
    return {'lfp': 'LFP', 'lifepo4': 'LFP', 'ncm': 'NCM', 'nmc': 'NCM',
            'lco': 'LCO', 'licoo2': 'LCO', 'graphite': 'Graphite'}.get(str(value).strip().lower(), '')


def validate_profile(value):
    if not isinstance(value, dict) or set(value) - {'displayName', 'material', 'composition', 'conditions', 'tags'}:
        raise ValueError('허용된 분류 항목만 입력해주세요.')
    result = {}
    for key in ('displayName', 'material', 'composition', 'conditions'):
        text = value.get(key, '')
        if not isinstance(text, str) or len(text) > 300:
            raise ValueError('분류 항목은 300자 이하의 문자열이어야 합니다.')
        result[key] = text.strip()
    tags = value.get('tags', [])
    if not isinstance(tags, list) or len(tags) > 20 or any(not isinstance(t, str) or len(t) > 60 for t in tags):
        raise ValueError('태그는 60자 이하, 최대 20개입니다.')
    result['tags'] = list(dict.fromkeys(t.strip() for t in tags if t.strip()))
    return result


def transform(rows, recipe):
    if not isinstance(recipe, dict) or set(recipe) - {'dropEmpty', 'column', 'outputColumn', 'factor', 'unit'}:
        raise ValueError('지원하지 않는 전처리입니다.')
    if type(recipe.get('dropEmpty', False)) is not bool:
        raise ValueError('빈 행 제거 옵션을 확인해주세요.')
    column, output = recipe.get('column', ''), recipe.get('outputColumn', '')
    if not isinstance(column, str) or not isinstance(output, str):
        raise ValueError('열 이름을 확인해주세요.')
    keys = {k for row in rows for k in row}
    factor = recipe.get('factor', 1)
    unit = recipe.get('unit', '')
    if column and (column not in keys or not output.strip() or output in keys or len(output) > 80
                   or type(factor) not in (int, float) or not math.isfinite(factor) or not 0 < factor <= 1e9
                   or not isinstance(unit, str) or not unit.strip() or len(unit) > 40):
        raise ValueError('기존 열, 새 열 이름, 양의 환산계수와 결과 단위를 확인해주세요. 기존 열은 덮어쓸 수 없습니다.')
    result, invalid, removed = [], 0, 0
    for source in rows:
        if recipe.get('dropEmpty') and all(v is None or v == '' for v in source.values()):
            removed += 1
            continue
        row = copy.deepcopy(source)
        if column:
            value = row.get(column)
            converted = None
            if value is not None and value != '':
                try:
                    if isinstance(value, bool):
                        raise ValueError()
                    converted = float(value) * factor
                    if not math.isfinite(converted):
                        raise ValueError()
                except (ValueError, TypeError, OverflowError):
                    invalid += 1
                    converted = None
            row[output] = converted
        result.append(row)
    return {'rows': result, 'sourceRows': len(rows), 'resultRows': len(result),
            'removedRows': removed, 'invalidValues': invalid, 'recipe': copy.deepcopy(recipe)}
