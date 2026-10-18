"""Passive snapshot/image checks; never reads or writes simulator storage."""
import json
from pathlib import Path
import hashlib
import struct

root = Path(__file__).resolve().parent
native = root / 'native'
rows = json.loads((native/'native-state-check.json').read_text())
assert len(rows) == 6
base = rows[0]
assert base['phase'] == 'phone-before' and len(base['events']) == 10
for row in rows:
    assert row['pathMatchesRequestedDevice'] and row['device'] in row['capturePath']
    assert len(row['keyHashes']) == 11 and row['journal'] is None
    assert row['deckCount'] == 48 and row['cardCount'] == 1402
    allowed = {'SRS_PREFS_V1'}
    if row['phase'] in {'phone-one-recognition', 'phone-after-next', 'phone-restore-merges-events-cold'}:
        allowed |= {'SRS_STUDY_STREAK_V1','SRS_LEARNING_EVENTS_V1'}
        assert len(row['events']) == 11
        assert row['events'][:-1] == base['events']
        assert row['events'][-1]['modality'] == 'recognition'
        assert row['events'][-1]['evidence'] == 'answer-checked'
    for key, value in row['keyHashes'].items():
        if key not in allowed: assert value == base['keyHashes'][key], (row['phase'],key)
assert rows[2]['keyHashes'] == rows[3]['keyHashes']
assert rows[4]['phase'] == 'phone-restore-merges-events-cold'
assert all(rows[4]['keyHashes'][key] == value for key,value in base['keyHashes'].items() if key != 'SRS_LEARNING_EVENTS_V1')
assert rows[-1]['phase'] == 'phone-final-clean-cold' and rows[-1]['keyHashes'] == base['keyHashes']
for path in native.glob('*preflight.json'):
    item=json.loads(path.read_text());assert item['isolated'] and item['requestedDevice'] in item['container']
images=json.loads((native/'screenshots.json').read_text())
assert len(images)==5
for item in images:
    data=(native/item['file']).read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    assert list(struct.unpack('>II',data[16:24])) == item['dimensions']
    assert hashlib.sha256(data).hexdigest() == item['sha256']
assert 'Tests:       1095 passed, 1095 total' in (root/'software'/'barrio-controls-full.log').read_text()
print('PASS: six state snapshots, one backed-up QA recognition answer, exact11-record cold restore, five image digests and own-container preflights.')
