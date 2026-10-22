"""User-designated process equipment; never rewrite historical observations."""
from copy import deepcopy
from functools import lru_cache
import json
from pathlib import Path

@lru_cache(maxsize=1)
def _catalog():
    path=Path(__file__).resolve().parents[1]/'public/equipment-catalog.json'
    data=json.loads(path.read_text(encoding='utf-8'))
    if data.get('version')!=1 or set(data.get('equipment',{}))!={'MIXING','KNEADING'}:
        raise ValueError('Invalid designated equipment catalog')
    return data['equipment']

def equipment_for(process_type):
    """Return independent display metadata; original revision equipment stays raw."""
    return deepcopy(_catalog().get(process_type))
