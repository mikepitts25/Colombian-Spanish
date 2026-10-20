"""Passive consistency check for captured native QA evidence; not a UI driver."""
import hashlib
import json
from pathlib import Path

p = Path(__file__).resolve().parent
s = json.loads((p / 'state-summary.json').read_text())
b = s['baseline']
assert b['recordCount'] == 11
assert (b['decks'], b['cards'], b['eventCount']) == (48, 1402, 10)
for label in ['before-launch', 'restored', 'final-cold']:
    assert s[label]['hashes'] == b['hashes'], label
es, en = s['spanish-checked'], s['english-checked']
assert {k for k in b['hashes'] if es['hashes'][k] != b['hashes'][k]} == {'SRS_MISSIONS_V1'}
assert {k for k in b['hashes'] if en['hashes'][k] != es['hashes'][k]} == {'SRS_PREFS_V1'}
assert s['before-restore']['hashes'] == en['hashes']
assert b['mission'] == {'schemaVersion': 1, 'runs': []}
assert es['mission'] == en['mission']
run = es['mission']['runs'][0]
assert len(es['mission']['runs']) == 1
assert run['id'] == b['plan']['current']['applied']['runId']
assert run['revision'] == run['hintsUsed'] == run['activeTiming']['durationMs'] == 0
assert not any(run[k] for k in ['assisted', 'modelAnswerRevealed', 'completed'])
assert run['reviewCardIds'] == []
assert es['prefs'] == b['prefs']
assert en['prefs'] == {**b['prefs'], 'uiLanguage': 'en', 'themeId': 'classic', 'appearanceMode': 'system'}
for d in s.values():
    assert d['daily'] == b['daily'] and d['session'] == b['session']
    assert d['eventCount'] == 10 and d['journal'] is None
    assert d['plan'] == b['plan']
for language in ['spanish', 'english']:
    assert 'Buenos dias' in (p / f'{language}-max-draft.txt').read_text()
c = json.loads((p / 'cleanup.json').read_text())
assert c['samples'] == 589 and c['collisions'] == 0
assert not any(json.loads(c['ios']['output'])['devices'].values())
assert c['android']['output'] == 'List of devices attached'
assert c['processes'] == {'exit': 1, 'output': ''}
for filename, digest in json.loads((p / 'sha256.json').read_text()).items():
    assert hashlib.sha256((p / filename).read_bytes()).hexdigest() == digest, filename
assert len(list(p.glob('*.png'))) == 9
print('PASS: seven checkpoints, eleven exact recovered records, intended draft/language deltas, nine captures and clean runtime inventory')
