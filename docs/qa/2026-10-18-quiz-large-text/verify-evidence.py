"""Check recorded simulator observations, without accessing or mutating a device."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
rows = json.loads((root / 'native-state-check.json').read_text())
assert len(rows) == 15
by_phase = {row['phase']: row for row in rows}
assert len(by_phase) == len(rows)
base = by_phase['quiz-baseline']
final = by_phase['cold-history']
history = final['quizHistory']
assert [(x['score'], x['total'], x['missedCardIds']) for x in history] == [
    (1, 1, []), (1, 1, []), (0, 1, ['0038'])
]
assert len({x['id'] for x in history}) == 3

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

expectations = {
    'quiz-baseline': (1, 0), 'empty-region-fixed': (1, 0), 'question-largest': (1, 0),
    'wrong-feedback': (2, 0), 'wrong-live-largest': (2, 0),
    'wrong-complete': (2, 1), 'complete-reflow-fixed': (2, 1),
    'correct-followup': (3, 1), 'followup-complete': (3, 2), 'english-history': (3, 2),
    'english-feedback': (4, 2), 'english-complete': (4, 3), 'restored': (4, 3), 'cold-history': (4, 3)
}
for phase, (event_count, history_count) in expectations.items():
    row = by_phase[phase]
    assert row['device'] == 'E66076BE-D9F8-49FB-870F-F29B57C4CA40'
    assert row['cardCount'] == 1392
    assert row['daily'] == {'date': '2026-10-18', 'count': 1, 'target': 5, 'newCount': 1}
    assert row['journal'] is None and row['plan'] is None and row['missions'] is None
    assert row['session'] == base['session']
    assert row['events'] == final['events'][:event_count]
    assert row['keyHashes']['SRS_QUIZ_HISTORY_V1'] == digest(history[-history_count:] if history_count else None)
    for key, value in row['keyHashes'].items():
        if key not in {'SRS_LEARNING_EVENTS_V1', 'SRS_QUIZ_HISTORY_V1', 'SRS_PREFS_V1'}:
            assert value == base['keyHashes'][key], (phase, key)
    assert row['prefs'] == {**base['prefs'], 'uiLanguage': 'en' if phase.startswith('english-') else 'es'}
assert final['events'][0]['cardId'] == '0038'
assert final['events'][0]['evidence'] == 'self-rated' and final['events'][0]['quality'] == 4
for event, result in zip(final['events'][1:], reversed(history)):
    assert event['sessionId'] == result['id']
    assert event['cardId'] == '0038' and event['deckId'] == 'deck-travel'
    assert event['modality'] == 'recognition' and event['evidence'] == 'answer-checked'
    assert event['outcome'] == ('correct' if result['score'] == 1 else 'incorrect')
assert len({e['id'] for e in final['events']}) == 4
assert by_phase['restored']['keyHashes'] == final['keyHashes']
empty = by_phase['empty']
assert empty['events'] == []
assert empty['daily'] == {'date': '2026-10-18', 'count': 0, 'target': 5, 'newCount': 0}
assert len(base['session']['queue']['cardIds']) == 9
assert base['session']['cardId'] == '0039'
assert '0038' not in base['session']['queue']['cardIds']
assert len(list(root.glob('*.png'))) == 15
print('PASS: 15 snapshots/screenshots, one Study grade, three distinct recognition attempts/results, unchanged SRS/counters/queue and exact cold-history preservation.')
