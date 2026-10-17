"""Validate recorded tablet checkpoints; never read or modify simulator storage."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
phases = {row['phase']: row for row in rows}
assert len(phases) == len(rows)
baseline = phases['baseline']
review = phases['review-start']
applied = phases['applied-keyboard-open']
feedback = phases['correct-feedback']
complete = phases['complete-largest-en']
final = phases['final-restored-es']
plan_id = 'mvcy9qb0-6-b808smn91eq'
run_id = 'mvcy9qb0-8-yqltjkbxxb'

def run(row):
    return next(item for item in row['missions']['runs'] if item['id'] == run_id)

assert baseline['daily'] == {'date': '2026-10-18', 'count': 0, 'target': 5, 'newCount': 0}
assert len(baseline['events']) == 6
assert review['plan']['current']['review']['initialCardIds'] == ['1804', '1805']
assert review['session']['queue']['cardIds'] == ['1804', '1805']
assert review['plan']['current']['phase'] == 'review'
assert applied['daily'] == {'date': '2026-10-18', 'count': 2, 'target': 5, 'newCount': 2}
assert len(applied['events']) == 8
assert applied['events'][:6] == baseline['events']
assert [event['cardId'] for event in applied['events'][6:]] == ['1804', '1805']
assert all(event['quality'] == 4 and event['planId'] == plan_id for event in applied['events'][6:])
assert applied['plan']['current']['phase'] == 'applied'
assert applied['plan']['current']['review']['session']['queue']['cardIds'] == []
assert run(applied)['revision'] == 0
for phase in ['largest-draft', 'draft-background', 'draft-foreground', 'before-correct-check']:
    assert phases[phase]['keyHashes'] == applied['keyHashes'], phase
assert len(feedback['events']) == 9
assert feedback['events'][:8] == applied['events']
event = feedback['events'][-1]
assert event['sessionId'] == run_id and event['missionId'] == 'daily-morning-greeting'
assert event['evidence'] == 'answer-checked' and event['outcome'] == 'correct'
assert event['exercise'] == {'id': 'morning-greeting', 'contentVersion': 1, 'kind': 'typed-recall'}
assert event['hintsUsed'] == 0
assert run(feedback)['feedback'] == {'status': 'correct', 'answerIndex': 0}
assert run(feedback)['revision'] == 1 and not run(feedback)['completed']
assert not run(feedback)['assisted'] and not run(feedback)['modelAnswerRevealed']
assert 0 <= run(feedback)['activeTiming']['durationMs'] <= event['durationMs']
assert phases['cold-home']['keyHashes'] == feedback['keyHashes']
for key, value in feedback['keyHashes'].items():
    if key != 'SRS_PREFS_V1':
        assert phases['resumed-feedback-en']['keyHashes'][key] == value, key
assert phases['resumed-feedback-en']['prefs'] == {**feedback['prefs'], 'uiLanguage': 'en'}
assert complete['plan']['current']['phase'] == 'complete'
assert run(complete)['nodeId'] == 'complete' and run(complete)['completed']
assert run(complete)['revision'] == 2
assert run(complete)['activeTiming'] == run(feedback)['activeTiming']
assert run(complete)['reviewCardIds'] == []
assert phases['home-complete-largest-en']['keyHashes'] == complete['keyHashes']
assert final['prefs'] == baseline['prefs']
for row in rows[2:]:
    assert row['daily'] == applied['daily'], row['phase']
    assert row['deckHash'] == applied['deckHash'], row['phase']
    assert row['session'] == applied['session'], row['phase']
    assert row['streak'] == applied['streak'], row['phase']
    assert row['plan']['current']['id'] == plan_id
    assert row['plan']['current']['applied']['runId'] == run_id
for row in rows[7:]:
    assert row['events'] == feedback['events'], row['phase']
for key, value in complete['keyHashes'].items():
    if key != 'SRS_PREFS_V1':
        assert final['keyHashes'][key] == value, key
for row in rows:
    assert row['journal'] is None and row['cardCount'] == 1392
print('PASS: exact two-card handoff; draft/background/focus changed no durable keys; one checked answer; cold/language/completion retained events, counts, scheduling and run identity')
