"""Verify recorded native QA transitions; this never reads or writes simulator storage."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
by_phase = {row['phase']: row for row in rows}
base = rows[0]
for row in rows:
    assert row['cardCount'] == 1402
    assert row['journal'] is None
    assert row['plan'] == base['plan']
    assert row['missions'] == base['missions']
    assert row['prefs'] == base['prefs']
    assert row['daily']['newCount'] == 0
    assert row['session']['queue']['sessionId'] == base['session']['queue']['sessionId']
    assert row['events'][:len(base['events'])] == base['events']
    for key in ('SRS_DAILY_PLAN_V1', 'SRS_MISSIONS_V1', 'SRS_PREFS_V1',
                'SRS_QUIZ_HISTORY_V1', 'SRS_NOTIFICATION_PREFS_V1'):
        assert row['keyHashes'][key] == base['keyHashes'][key]

def grade(before_phase, after_phase, card_id, quality):
    before, after = by_phase[before_phase], by_phase[after_phase]
    assert after['daily']['count'] == before['daily']['count'] + 1
    assert after['events'][:-1] == before['events']
    event = after['events'][-1]
    assert event['cardId'] == card_id and event['quality'] == quality
    assert before['session']['queue']['cardIds'][0] == card_id
    assert after['session']['queue']['cardIds'] == before['session']['queue']['cardIds'][1:]
    old = {c['id']: c for c in before['fixtureCards']}
    new = {c['id']: c for c in after['fixtureCards']}
    assert old.keys() == new.keys()
    assert [k for k in old if old[k] != new[k]] == [card_id]

grade('resumed-default', 'after-short-drag-grade', 'catchup-3', 4)
grade('before-again', 'after-again', 'catchup-4', 1)
grade('cold-home', 'after-hard-accessibility-action', 'catchup-5', 2)
for before_phase, after_phase in (
    ('after-short-drag-grade', 'before-again'),
    ('after-again', 'cold-home'),
    ('after-hard-accessibility-action', 'final-cold-home'),
):
    assert by_phase[before_phase]['keyHashes'] == by_phase[after_phase]['keyHashes']
final = by_phase['final-cold-resumed']
assert final['events'] == by_phase['after-hard-accessibility-action']['events']
assert final['daily'] == by_phase['after-hard-accessibility-action']['daily']
assert final['session']['queue'] == by_phase['after-hard-accessibility-action']['session']['queue']
assert final['deckHash'] == by_phase['after-hard-accessibility-action']['deckHash']
assert final['session']['queue']['cardIds'] == ['catchup-6', 'catchup-7', 'catchup-8', 'catchup-9']
print('PASS: three exactly-once grades, intended fixture cards only, unchanged linked plan, exact cold resume')
