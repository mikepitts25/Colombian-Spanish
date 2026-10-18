"""Verify saved clear/restore observations without simulator operations."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEVICE = 'DABA2821-3619-4F4A-B0C3-54E70B31511F'
rows = json.loads((HERE / 'native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['before', 'empty-default', 'empty-maximum', 'restored', 'cold']
b = rows[0]
assert len(b['keyHashes']) == 11 and len(b['flaggedCards']) == 20
for r in rows:
    assert r['device'] == DEVICE and r['pathMatchesRequestedDevice']
    assert Path(r['capturePath']).parts[-6] == DEVICE and r['capturePath'] == b['capturePath']
    assert set(r['keyHashes']) == set(b['keyHashes']) and r['journal'] is None
    assert r['deckCount'] == 48 and r['cardCount'] == 1402
    assert r['deckWithoutFlagsHash'] == b['deckWithoutFlagsHash']
    empty = r['phase'].startswith('empty-')
    assert r['prefs'] == (dict(b['prefs'], uiLanguage='en') if empty else b['prefs'])
    assert r['keyHashes']['SRS_PREFS_V1'] == hashlib.sha256(json.dumps(r['prefs'], sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    for k in b['keyHashes']:
        if k not in ['SRS_PREFS_V1', 'SRS_DECKS_V3']:
            assert r['keyHashes'][k] == b['keyHashes'][k]
    for field in ['plan', 'missions', 'daily', 'events', 'session', 'streak', 'quizHistory', 'notificationPrefs']:
        assert r[field] == b[field]
    if empty:
        assert r['flaggedCards'] == []
        assert r['keyHashes']['SRS_DECKS_V3'] == b['expectedClearedDeckHash']
    else:
        assert r['keyHashes'] == b['keyHashes']
        assert r['flaggedCards'] == b['flaggedCards']
assert rows[1]['keyHashes'] == rows[2]['keyHashes']
fixture = json.loads((HERE / 'fixture.json').read_text())
assert fixture['sourceContainer'] == b['capturePath']
assert fixture['sourceKeyHashes'] == b['keyHashes'] and fixture['normalizedFields'] == []
assert (fixture['deckCount'], fixture['cardCount'], fixture['eventCount']) == (48, 1402, 11)
assert len(fixture['applicationStateFields']) == 9
preflights = list(HERE.glob('*preflight.json'))
assert len(preflights) == 3
for path in preflights:
    p = json.loads(path.read_text())
    assert p['isolated'] and p['requestedDevice'] == DEVICE
    assert p['container'] == p['resolvedContainer'] == b['capturePath']
print('PASS: 5 own-path snapshots; exact flags-only clear plus English preference; full supported restore/cold eleven-key equality; original20 flags and all learning state recovered')
