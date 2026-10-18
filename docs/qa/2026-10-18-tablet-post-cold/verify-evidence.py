"""Passive evidence checks. Does not access simulator storage."""
import hashlib
import json
import struct
from pathlib import Path

native = Path(__file__).resolve().parent / 'native'
rows = json.loads((native / 'native-state-check.json').read_text())
assert [row['phase'] for row in rows] == ['tablet-followup-before', 'tablet-fixed-cold', 'tablet-final-default-home']
base = rows[0]
assert base['prefs']['themeId'] == 'barrio' and base['prefs']['appearanceMode'] == 'dark'
for row in rows:
    assert row['pathMatchesRequestedDevice'] and row['device'] == 'F9BC32B5-9591-4CEA-9363-707D3A7E204D'
    assert row['device'] in row['capturePath'] and row['journal'] is None
    assert len(row['keyHashes']) == 11 and row['keyHashes'] == base['keyHashes']
    assert row['deckCount'] == 48 and row['cardCount'] == 1402 and len(row['events']) == 11
for path in native.glob('*preflight.json'):
    item = json.loads(path.read_text())
    assert item['isolated'] and item['requestedDevice'] == base['device']
    assert base['device'] in item['container']
images = json.loads((native / 'screenshots.json').read_text())
assert len(images) == 3
for item in images:
    data = (native / item['file']).read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    assert list(struct.unpack('>II', data[16:24])) == item['dimensions']
    assert hashlib.sha256(data).hexdigest() == item['sha256']
print('PASS: three snapshots retain all11 records; three screenshot digests and own-container launch checks.')
