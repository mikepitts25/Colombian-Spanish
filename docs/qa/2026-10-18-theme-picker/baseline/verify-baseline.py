"""Passive baseline verification; no simulator interaction or storage write."""
import hashlib
import json
from pathlib import Path
import struct

HERE = Path(__file__).resolve().parent
rows = {row['phase']: row for row in json.loads((HERE / 'native-state-check.json').read_text())}
metadata = json.loads((HERE / 'metadata.json').read_text())
assert len(rows) == 4 and len(metadata['screenshots']) == 8
for kind in ['phone', 'tablet']:
    before, after = rows[kind + '-before'], rows[kind + '-after']
    assert len(before['keyHashes']) == 11
    assert before['keyHashes'] == after['keyHashes']
    assert before['events'] == after['events']
    assert before['journal'] is None and after['journal'] is None
    assert before['device'] in before['capturePath'] and after['device'] in after['capturePath']
for screenshot in metadata['screenshots']:
    raw = (HERE / screenshot['path']).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == screenshot['sha256']
    assert struct.unpack('>II', raw[16:24]) == (screenshot['width'], screenshot['height'])
for file in HERE.glob('*preflight.json'):
    check = json.loads(file.read_text())
    assert check['isolated'] and check['requestedDevice'] in check['container']
assert len(list(HERE.glob('*preflight.json'))) == 3
print('PASS: two unchanged eleven-record stores, eight native baseline images, three own-path preflights.')
