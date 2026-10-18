"""Verify the recorded alias impact and recovery; never access a simulator."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
by = {row['phase']: row for row in rows}
assert len(by) == len(rows) == 10
initial = by['source-before']
assert len(initial['keyHashes']) == 11
assert by['clone-start']['keyHashes'] == initial['keyHashes']
for phase in ['draft-after-touch', 'clone-cold', 'source-after']:
    row = by[phase]
    assert {key for key in initial['keyHashes'] if initial['keyHashes'][key] != row['keyHashes'][key]} == {'SRS_MISSIONS_V1'}
    assert row['missions']['runs'][:-1] == initial['missions']['runs']
    run = row['missions']['runs'][-1]
    assert run['missionId'] == 'first-morning-medellin'
    assert run['nodeId'] == 'greeting' and run['revision'] == 1
    assert not run['completed'] and not run['assisted']
    assert run.get('feedback') is None
for phase in ['source-ui-restored', 'source-cold-restored', 'clone-own-offline-after', 'source-after-fresh-launch']:
    assert by[phase]['keyHashes'] == initial['keyHashes']
    assert by[phase]['journal'] is None
for phase in ['clone-start', 'draft-after-touch', 'clone-cold']:
    assert not by[phase]['pathMatchesRequestedDevice']
    assert by[phase]['capturePath'] == initial['capturePath']
for phase in ['source-before', 'source-after', 'source-ui-restored', 'source-cold-restored', 'source-after-fresh-launch']:
    assert by[phase]['pathMatchesRequestedDevice']
    assert by[phase]['device'] == initial['device']
fresh = by['fresh-onboarding']
assert fresh['pathMatchesRequestedDevice']
assert fresh['device'] == 'DABA2821-3619-4F4A-B0C3-54E70B31511F'
assert fresh['plan'] is None and fresh['missions'] is None and fresh['events'] == []
assert fresh['prefs'] is None or not fresh['prefs'].get('onboardingDone', False)
assert fresh['keyHashes']['SRS_DECKS_V3'] != initial['keyHashes']['SRS_DECKS_V3']
for filename in ['fresh-preflight.json', 'fresh-after-launch-preflight.json']:
    report = json.loads(Path(__file__).with_name(filename).read_text())
    assert report['isolated'] and report['requestedDevice'] == 'DABA2821-3619-4F4A-B0C3-54E70B31511F'
    assert report['requestedDevice'] in report['container']
print('PASS: alias impact confined to one ungraded run; all eleven source records restored through cold launch; fresh path checks pass')
