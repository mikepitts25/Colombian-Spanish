"""Check captured values and logical-key hashes; does not access or edit a device."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
phases = ['before-actions', 'draft-max20-cap15', 'spanish-saved20-cap15',
          'english-reopened20-cap15', 'english-draft5-cap10',
          'english-restored5-cap10', 'spanish-restored5-cap10', 'cold-settings-restored']
assert [row['phase'] for row in rows] == phases
base = rows[0]
for index, row in enumerate(rows):
    assert row['device'] == 'E66076BE-D9F8-49FB-870F-F29B57C4CA40'
    assert row['cardCount'] == 1392 and row['journal'] is None
    daily = dict(base['daily'])
    prefs = dict(base['prefs'])
    if 2 <= index <= 4:
        daily['target'] = 20
        prefs['newCardsPerDay'] = 15
    if 3 <= index <= 5:
        prefs['uiLanguage'] = 'en'
    assert row['daily'] == daily and row['prefs'] == prefs, row['phase']
    assert row['daily']['count'] == 1 and row['daily']['newCount'] == 1
    assert row['events'] == base['events'] and len(row['events']) == 4
    assert row['quizHistory'] == base['quizHistory'] and len(row['quizHistory']) == 3
    assert row['session'] == base['session']
    assert row['session']['deckId'] == 'deck-weather'
    assert row['session']['queue']['cardIds'] == [str(i).zfill(4) for i in range(114, 123)]
    assert row['streak'] == base['streak']
    assert row['plan'] is None and row['missions'] is None
    for key, value in base['keyHashes'].items():
        if key not in {'SRS_PREFS_V1', 'SRS_DAILY_PROGRESS_V1'}:
            assert row['keyHashes'][key] == value, (row['phase'], key)
for index in [1, 6, 7]:
    assert rows[index]['keyHashes'] == base['keyHashes']
print('Verified 8 snapshots: only intentional target/cap/language changes, exact restoration and no learning credit.')
