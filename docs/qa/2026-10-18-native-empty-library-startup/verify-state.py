"""Validate recorded native startup/restore evidence, without runtime operations."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEVICE = 'DABA2821-3619-4F4A-B0C3-54E70B31511F'
rows = json.loads((HERE / 'native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['before', 'imported-empty', 'seeded-home', 'seeded-progress', 'restored', 'final-cold']
s = {r['phase']: r for r in rows}
b = rows[0]
assert len(b['keyHashes']) == 11
for r in rows:
    assert r['device'] == DEVICE and r['pathMatchesRequestedDevice']
    assert Path(r['capturePath']).parts[-6] == DEVICE and r['capturePath'] == b['capturePath']
    assert set(r['keyHashes']) == set(b['keyHashes']) and r['journal'] is None
    for key in b['keyHashes']:
        if key != 'SRS_DECKS_V3':
            assert r['keyHashes'][key] == b['keyHashes'][key]
    for field in ['prefs', 'plan', 'missions', 'daily', 'events', 'session', 'streak', 'quizHistory', 'notificationPrefs']:
        assert r[field] == b[field]
    assert len(r['events']) == 11
for phase in ['before', 'restored', 'final-cold']:
    r = s[phase]
    assert r['keyHashes'] == b['keyHashes'] and r['flaggedCards'] == b['flaggedCards']
    assert (r['deckCount'], r['cardCount'], len(r['flaggedCards'])) == (48, 1402, 20)
empty = s['imported-empty']
assert (empty['deckCount'], empty['cardCount']) == (0, 0)
assert empty['restoreCard'] is None and empty['flaggedCards'] == []
assert empty['keyHashes']['SRS_DECKS_V3'] == hashlib.sha256(b'[]').hexdigest()
for phase in ['seeded-home', 'seeded-progress']:
    r = s[phase]
    assert (r['deckCount'], r['cardCount']) == (47, 1392)
    assert r['keyHashes'] == s['seeded-home']['keyHashes']
    assert r['keyHashes']['SRS_DECKS_V3'] not in [b['keyHashes']['SRS_DECKS_V3'], empty['keyHashes']['SRS_DECKS_V3']]
fixture = json.loads((HERE / 'fixture.json').read_text())
assert fixture['sourceContainer'] == b['capturePath'] and fixture['sourceKeyHashes'] == b['keyHashes']
assert fixture['normalizedFields'] == []
e = json.loads((HERE / 'empty-fixture.json').read_text())
assert (e['deckCount'], e['cardCount'], e['eventCount']) == (0, 0, 11)
preflights = list(HERE.glob('*preflight.json'))
assert len(preflights) == 5
for path in preflights:
    p = json.loads(path.read_text())
    assert p['isolated'] and p['requestedDevice'] == DEVICE
    assert p['container'] == p['resolvedContainer'] == b['capturePath']
print('PASS: actual stored[] then47/1392 startup library; ten other records unchanged; exact eleven-key original restoration/cold persistence')
