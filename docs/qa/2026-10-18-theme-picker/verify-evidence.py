"""Passive checks of recorded evidence. Does not access or mutate simulators."""
import hashlib
import json
from pathlib import Path
import struct

root = Path(__file__).resolve().parent
native = root / 'native'
rows = json.loads((native / 'native-state-check.json').read_text())
phases = {row['phase']: row for row in rows}
assert len(phases) == len(rows)
for row in rows:
    assert row['pathMatchesRequestedDevice'] and f"/{row['device']}/" in row['capturePath']
    assert len(row['keyHashes']) == 11 and row['journal'] is None
    baseline = phases['source-tablet-before' if 'tablet' in row['phase'] else 'source-phone-before']
    allowed = {'SRS_PREFS_V1'}
    if row['phase'] in {'phone-study-revealed-before-identity', 'phone-classic-retained-face',
                       'phone-rename-draft-cancelled', 'phone-system-keyboard-fixed-draft'}:
        allowed.add('SRS_LAST_STUDY_SESSION_V1')
        assert {k:v for k,v in row['session'].items() if k != 'updatedAt'} == {
            k:v for k,v in baseline['session'].items() if k != 'updatedAt'}
    assert all(v == baseline['keyHashes'][k] for k,v in row['keyHashes'].items() if k not in allowed), row['phase']
    prefs = {k:v for k,v in row['prefs'].items() if k not in {'themeId', 'appearanceMode', 'uiLanguage'}}
    original = {k:v for k,v in baseline['prefs'].items() if k not in {'themeId', 'appearanceMode', 'uiLanguage'}}
    assert prefs == original, row['phase']
    assert row['cardCount'] == 1402 and row['deckCount'] == 48 and len(row['flaggedCards']) == 20
for source, target in [('phone','source-phone-after'), ('tablet','source-tablet-after'),
                       ('phone','phone-final-restored-before-cold'), ('phone','phone-final-restored-after-cold'), ('phone','phone-final-review-restored-after-cold'),
                       ('tablet','tablet-import-original'), ('tablet','tablet-original-cold')]:
    assert phases[f'source-{source}-before']['keyHashes'] == phases[target]['keyHashes'], target
assert phases['phone-study-revealed-before-identity']['session'] == phases['phone-classic-retained-face']['session']
for phase, pair in {'phone-barrio-light':('barrio','light'), 'phone-barrio-dark':('barrio','dark'),
                    'phone-barrio-system-light':('barrio','system'), 'phone-classic-retained-face':('classic','system'),
                    'tablet-classic-remembers-dark':('classic','dark'), 'tablet-final-after-cold':('barrio','dark')}.items():
    prefs = phases[phase]['prefs']
    assert (prefs['themeId'],prefs['appearanceMode']) == pair, phase
assert phases['tablet-final-before-cold']['keyHashes'] == phases['tablet-final-after-cold']['keyHashes']
prefs = dict(phases['tablet-final-after-cold']['prefs'])
for key in ['themeId','appearanceMode']: prefs.pop(key)
assert prefs == phases['source-tablet-before']['prefs']
for preflight in native.glob('*preflight.json'):
    item = json.loads(preflight.read_text())
    assert item['isolated'] and item['requestedDevice'] in item['container']
assert set(json.loads((native/'quarantine-states-final.json').read_text()).values()) == {'Shutdown'}
assert json.loads((native/'build-summary.json').read_text())['exitCode'] == 0
manifest = json.loads((native/'screenshots.json').read_text())
assert len(manifest) >= 35
for item in manifest:
    path = native/item['file']; data = path.read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    assert list(struct.unpack('>II', data[16:24])) == item['dimensions']
    assert hashlib.sha256(data).hexdigest() == item['sha256']
checks=json.loads((root/'software-checks.json').read_text())
assert all(c['exitCode']==0 for c in checks['checks'])
for check in checks['checks']:
    assert hashlib.sha256((root/'software'/check['logFile']).read_bytes()).hexdigest() == check['logSHA256']
assert checks['checks'][0]['summary'] == ['Test Suites: 115 passed, 115 total','Tests:       1091 passed, 1091 total']
print(f'PASS: {len(rows)} state snapshots, source/final restoration, intentional preferences, exact Study queue, {len(manifest)} screenshots, preflights, build and software summaries.')
