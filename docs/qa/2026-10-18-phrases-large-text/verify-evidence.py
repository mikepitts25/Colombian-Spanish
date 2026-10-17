"""Offline assertions over read-only simulator snapshots; never writes device storage."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
phases = [
    'before-actions', 'spanish-default-resized', 'spanish-max-saved',
    'favorites-search-default', 'english-default-topics', 'english-max-weather',
    'english-max-removed', 'english-max-study-handoff', 'spanish-restored',
    'before-cold-launch', 'cold-resumed-weather',
]
assert [row['phase'] for row in rows] == phases
base, last = rows[0], rows[-1]
assert last['deckVariants']['absent'] == base['keyHashes']['SRS_DECKS_V3']
saved = set(phases[2:6])
english = set(phases[4:8])
for index, row in enumerate(rows):
    phase = row['phase']
    assert row['device'] == 'E66076BE-D9F8-49FB-870F-F29B57C4CA40'
    assert row['cardCount'] == 1392 and row['journal'] is None
    assert row['daily'] == base['daily']
    assert row['daily']['count'] == 1 and row['daily']['newCount'] == 1
    assert row['daily']['target'] == 5
    assert row['events'] == base['events'] and len(row['events']) == 4
    assert row['quizHistory'] == base['quizHistory'] and len(row['quizHistory']) == 3
    assert row['plan'] is None and row['missions'] is None
    assert row['streak'] == base['streak']
    changed = {'SRS_DECKS_V3', 'SRS_PREFS_V1', 'SRS_LAST_STUDY_SESSION_V1'}
    for key, value in base['keyHashes'].items():
        if key not in changed:
            assert row['keyHashes'][key] == value, (phase, key)
    variant = 'absent' if index < 2 else 'true' if phase in saved else 'false'
    assert row['keyHashes']['SRS_DECKS_V3'] == last['deckVariants'][variant], phase
    prefs = dict(base['prefs'])
    if phase in english:
        prefs['uiLanguage'] = 'en'
    assert row['prefs'] == prefs, phase
    assert len(row['fixtureCards']) == 1
    card = row['fixtureCards'][0]
    original = dict(base['fixtureCards'][0])
    if index >= 2:
        original['favorite'] = phase in saved
    assert card == original, phase
    if index < 7:
        assert row['session'] == base['session'], phase
    else:
        stable = lambda session: {key: value for key, value in session.items() if key != 'updatedAt'}
        assert stable(row['session']) == stable(rows[7]['session'])
        assert row['session']['deckId'] == 'deck-weather'
        assert row['session']['cardId'] == '0114'
        assert row['session']['queue']['cardIds'] == [str(i).zfill(4) for i in range(114, 123)]
        assert row['session']['queue']['region'] == 'all'
        assert row['session']['queue'] == rows[7]['session']['queue']
assert last['prefs']['uiLanguage'] == 'es'
assert last['session']['updatedAt'] >= rows[-2]['session']['updatedAt']
print('Verified 11 snapshots: only the named favorite, temporary language and intentional Weather queue changed; no learning credit.')
