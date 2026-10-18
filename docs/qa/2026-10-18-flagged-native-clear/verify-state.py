"""Verify captured flag-clear storage invariants; does not access a simulator."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
phases = ['source-before-ui', 'clone-before-launch', 'clone-ready',
          'clone-before-clear', 'clone-clear-baseline', 'clone-cleared',
          'clone-cold-restored', 'source-after-ui']
assert [r['phase'] for r in rows] == phases
by_phase = {r['phase']: r for r in rows}
source = by_phase['source-before-ui']
base = by_phase['clone-clear-baseline']
expected_keys = {'SRS_DECKS_V3', 'SRS_DAILY_PLAN_V1', 'SRS_MISSIONS_V1',
                 'SRS_PREFS_V1', 'SRS_DAILY_PROGRESS_V1', 'SRS_STUDY_STREAK_V1',
                 'SRS_SEEN_WORDS_V1', 'SRS_QUIZ_HISTORY_V1',
                 'SRS_LAST_STUDY_SESSION_V1', 'SRS_NOTIFICATION_PREFS_V1',
                 'SRS_LEARNING_EVENTS_V1'}
for r in rows:
    assert set(r['keyHashes']) == expected_keys
    assert r['journal'] is None
    assert r['device'] == ('E66A88D6-CC87-4F46-A197-3F97EE9ED8CB'
                           if r['phase'].startswith('source-')
                           else 'F8D6111F-AD0F-413A-A6B5-86EEB4CB5EB6')
assert len(source['flaggedCards']) == len(base['flaggedCards']) == 20
assert source['flaggedCards'] == base['flaggedCards']
assert source['keyHashes'] == by_phase['source-after-ui']['keyHashes']
assert source['flaggedCards'] == by_phase['source-after-ui']['flaggedCards']
assert source['daily'] == {'date': '2026-10-17', 'count': 2, 'target': 5, 'newCount': 2}
for phase in ['clone-ready', 'clone-before-clear', 'clone-clear-baseline']:
    assert by_phase[phase]['keyHashes'] == base['keyHashes']
for phase in ['clone-cleared', 'clone-cold-restored']:
    r = by_phase[phase]
    assert r['flaggedCards'] == []
    assert r['cardCount'] == base['cardCount'] == 1392
    assert r['deckCount'] == base['deckCount'] == 47
    assert r['deckWithoutFlagsHash'] == base['deckWithoutFlagsHash']
    assert r['keyHashes']['SRS_DECKS_V3'] == base['expectedClearedDeckHash']
    assert r['daily'] == base['daily'] == {'date': '2026-10-18', 'count': 0, 'target': 5, 'newCount': 0}
    for key in expected_keys - {'SRS_DECKS_V3'}:
        assert r['keyHashes'][key] == base['keyHashes'][key], (phase, key)
print('PASS: 20 flags cleared only on clone; exact non-flag deck data and ten other keys unchanged through cold launch; source eleven hashes unchanged.')
