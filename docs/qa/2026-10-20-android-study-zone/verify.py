"""Bounded evidence/state checks; screenshots and action provenance require review."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
rows = {r['label']: r for r in json.loads((root / 'state-summary.json').read_text())}
previous = json.loads((root.parent / '2026-10-20-android-keyboard/state-summary.json').read_text())[-1]
assert rows['start']['hashes'] == previous['hashes']
assert len(rows['start']['hashes']) == 8
start_events = rows['start']['values']['SRS_LEARNING_EVENTS_V1']['events']
for row in rows.values():
    assert row['libraryCounts'] == rows['start']['libraryCounts']
    assert row['ungradedLibraryHash'] == rows['start']['ungradedLibraryHash']
    for key in ['SRS_PREFS_V1', 'SRS_STUDY_STREAK_V1', 'SRS_MISSIONS_V1']:
        assert row['hashes'][key] == rows['start']['hashes'][key]
    assert row['values']['SRS_LEARNING_EVENTS_V1']['events'][:2] == start_events
assert rows['graded']['values']['SRS_DAILY_PROGRESS_V1'] == {
    'date': '2026-10-20', 'count': 3, 'target': 5, 'newCount': 3}
assert rows['graded']['hashes'] == rows['anchorage']['hashes']
for before, after, day in [('anchorage', 'fixed-live', '2026-10-19'),
                           ('positive', 'fixed-boundary', '2026-10-19'),
                           ('fixed-boundary', 'restored', '2026-10-20')]:
    a, b = rows[before], rows[after]
    assert len(b['hashes']) == 9
    assert [k for k in b['hashes'] if a['hashes'][k] != b['hashes'][k]] == ['SRS_DAILY_PROGRESS_V1']
    assert b['values']['SRS_DAILY_PROGRESS_V1'] == {
        'date': day, 'count': 0, 'target': 5, 'newCount': 0}
assert rows['positive']['values']['SRS_DAILY_PROGRESS_V1'] == {
    'date': '2026-10-20', 'count': 1, 'target': 5, 'newCount': 1}
assert rows['restored']['hashes'] == rows['cold']['hashes']
final = rows['cold']
events = final['values']['SRS_LEARNING_EVENTS_V1']['events']
assert len(events) == 5
for event, card_id, quality, interval in zip(events[2:], ['0039', '0045', '0046'], [1, 2, 4], [900000, 43200000, 86400000]):
    assert event['cardId'] == card_id and event['quality'] == quality
    assert event['evidence'] == 'self-rated'
    delta = final['selectedCards'][card_id]['due'] - event['occurredAt']
    assert abs(delta - interval) < 1000
assert set(final['changedCardIdsFromStart']) == {'0039', '0045', '0046'}
review = final['values']['SRS_DAILY_PLAN_V1']['current']['review']
assert review['initialCardIds'] == ['0039', '0045', '0046', '0057', '0242']
assert review['session']['queue']['cardIds'] == ['0057', '0242']
for key in ['deckId', 'cardId', 'queue']:
    assert final['values']['SRS_LAST_STUDY_SESSION_V1'][key] == review['session'][key]
clock = json.loads((root / 'native-clock-diagnostic.json').read_text())
assert clock['zone'] == 'America/Anchorage' and clock['offset'] == -120
assert 'GMT+0200' in clock['local']
timeline = {r['label']: r for r in map(json.loads, (root / 'os-timeline.jsonl').read_text().splitlines())}
for label in ['positive-berlin', 'fixed-positive-anchorage-before-foreground', 'fixed-positive-anchorage-after-foreground']:
    assert timeline[label]['pid'] == '1662' and timeline[label]['automaticTime'] == '1'
assert timeline['positive-berlin']['zone'] == 'Europe/Berlin'
assert timeline['fixed-positive-anchorage-after-foreground']['zone'] == 'America/Anchorage'
for label in ['final-restored-berlin', 'final-cold']:
    r = timeline[label]
    assert (r['zone'], r['automaticTime'], r['automaticTimeZone'], r['fontScale']) == ('Europe/Berlin', '1', '1', '1.0')
assert timeline['final-cold']['pid'] != '1662'
for r in map(json.loads, (root / 'runtime-inventory.jsonl').read_text().splitlines()):
    assert not r['collision'] and not r['ios'] and r['android'] in [[], ['emulator-5554']]
for name, digest in json.loads((root / 'sha256.json').read_text()).items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == digest, name
assert 'Tests:       68 passed, 68 total' in (root / 'focused-green.txt').read_text()
print('PASS: baseline, three intended grades, live-zone daily-only resets, exact cold recovery, resource samples and evidence digests.')
