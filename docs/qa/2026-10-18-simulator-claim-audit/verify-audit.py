"""Validate saved provenance observations only; never call a simulator."""
import collections
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
def read(name):
    return json.loads((HERE / name).read_text())

before = {r['device']: r for r in read('before.json')['devices']}
after = {r['device']: r for r in read('after.json')['devices']}
assert len(before) == len(after) == 19 and before.keys() == after.keys()
for device in before:
    assert before[device]['state'] == after[device]['state']
    assert before[device]['ownState'] == after[device]['ownState']
    state = before[device]['ownState']
    if state['status'] == 'captured':
        assert len(state['keyHashes']) == 11
        assert Path(state['container']).parts[-6] == device
assert sum(r['ownState']['status'] == 'captured' for r in before.values()) == 16
probes = [json.loads(p.read_text()) for p in (HERE / 'probes').glob('*.json')]
known = read('known-aliases.json')
assert len(probes) == 16 and len(known) == 3
assert {r['device'] for r in probes}.isdisjoint(r['device'] for r in known)
assert {r['device'] for r in probes + known} == before.keys()
for probe in probes:
    assert not probe['appLaunchedByCollector']
    assert probe['originalState'] == probe['finalState'] == before[probe['device']]['state']
    assert probe.get('shutdownExitCode', 0) == 0
    if probe['status'] == 'lookup-unverified':
        assert probe['lookupExitCode'] != 0 and probe['error']
    else:
        assert probe['lookupExitCode'] == 0
    if probe.get('bootStatusWaitTimedOut'):
        assert probe['stateAfterWait'] == 'Booted'
rows = read('mapping-summary.json')
assert len(rows) == len({r['device'] for r in rows}) == 19
assert collections.Counter(r['status'] for r in rows) == {'own-path': 10, 'foreign-or-invalid-path': 6, 'lookup-unverified': 3}
observations = {r['device']: r for r in probes + known}
for row in rows:
    observation = observations[row['device']]
    assert row['status'] == observation['status']
    assert row.get('reportedContainer') == observation.get('reportedContainer')
    assert (ROOT / row['evidence']).is_file()
    if row.get('reportedContainer'):
        target = Path(row['reportedContainer']).parts[-6]
        assert target == row['reportedDataDevice'] and target in before
        assert row['reportedContainer'] == before[target]['ownState']['container']
        assert (target == row['device']) == (row['status'] == 'own-path')
    else:
        assert row['status'] == 'lookup-unverified'
        assert before[row['device']]['ownState']['containerCount'] == 0
history = json.loads((ROOT / 'docs/qa/2026-10-18-flagged-native-clear/native-state-check.json').read_text())
for comparison in read('flag-clear-crosscheck.json')['comparisons']:
    prior = next(r for r in history if r['phase'] == comparison['historicalPhase'])
    assert prior['device'] == comparison['device']
    assert prior['keyHashes'] == before[comparison['device']]['ownState']['keyHashes']
actions = read('report-actions.json')
assert len(actions) == 18
assert sum(a['action'] == 'provenance notice added' for a in actions) == 16
for action in actions:
    if action['action'] == 'provenance notice added':
        content = (ROOT / action['report']).read_text()
        assert '**Storage provenance update — 2026-10-18:**' in content
        assert '../2026-10-18-simulator-claim-audit/REPORT.md' in content
        assert all(device in content for device in action['aliases'])
print('PASS: 19 preserved boot/direct-store dispositions; 10 own paths/6 aliases/3 unverified; historical direct-file comparisons and 16 provenance notices checked')
