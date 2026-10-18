"""Validate recorded observations only; does not control or read a simulator."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['initial', 'after-scroll', 'cold-restored']
initial, after, cold = rows
session_key = 'SRS_LAST_STUDY_SESSION_V1'
assert len(initial['keyHashes']) == 11
for row in [after, cold]:
    assert row['device'] == initial['device']
    assert set(row['keyHashes']) == set(initial['keyHashes'])
    assert {k for k in initial['keyHashes'] if row['keyHashes'][k] != initial['keyHashes'][k]} == {session_key}
    assert {k: v for k, v in row['session'].items() if k != 'updatedAt'} == {k: v for k, v in initial['session'].items() if k != 'updatedAt'}
    assert row['session']['updatedAt'] > initial['session']['updatedAt']
assert after['keyHashes'] == cold['keyHashes']
assert initial['session']['queue']['cardIds'] == ['catchup-7', 'catchup-8', 'catchup-9']
print('PASS: ten unchanged records, exact session/queue except resume timestamp, cold persistence; no grade')
