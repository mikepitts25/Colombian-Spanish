"""Validate recorded Home evidence only; no simulator access or writes."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
native = root / 'native'
states = json.loads((native / 'native-state-check.json').read_text())
by_phase = {row['phase']: row for row in states}
assert len(by_phase) == len(states), 'Duplicate phase'
phone = '2EDF21F0-7DBD-4B09-8D5F-85560FD0E730'
mini = 'DF3686C1-A2E7-4870-B127-A83A8B67541D'
for prefix, device, event_count in [('phone', phone, 10), ('mini', mini, 11)]:
    baseline = by_phase[prefix + '-baseline']
    final = by_phase[prefix + '-final-smoke']
    assert by_phase[prefix + '-restored-loaded']['keyHashes'] == final['keyHashes']
    assert final['device'] == baseline['device'] == device
    assert len(baseline['keyHashes']) == 11
    assert final['keyHashes'] == baseline['keyHashes'], prefix + ' not restored'
    for state in (s for s in states if s['device'] == device):
        assert state['pathMatchesRequestedDevice']
        assert f'/Devices/{device}/data/Containers/Data/Application/' in state['capturePath']
        assert state['deckCount'] == 48 and state['cardCount'] == 1402
        assert len(state['events']) == event_count
        changes = {k for k, v in baseline['keyHashes'].items() if state['keyHashes'][k] != v}
        allowed = {'SRS_PREFS_V1', 'SRS_MISSIONS_V1'} if prefix == 'phone' else {'SRS_PREFS_V1'}
        assert changes <= allowed, (state['phase'], changes)
        assert all(entry['matchesStored'] for entry in (state.get('journal') or {}).get('entries', []))
a, b = (by_phase['phone-' + suffix] for suffix in ['before-retained-cold', 'after-retained-cold'])
assert a['keyHashes'] == b['keyHashes'], 'Retained cold state changed'
for file in native.glob('*-preflight.json'):
    p = json.loads(file.read_text())
    assert p['isolated'] and p['requestedDevice'] in {phone, mini}
    assert f"/Devices/{p['requestedDevice']}/data/" in p['resolvedContainer']
provenance = json.loads((native / 'provenance.json').read_text())
assert provenance['runtimeHead'] == provenance['matrixRuntimeHead'] == '9bd079b'
assert provenance['finalRuntimeHead'] == 'ecf1a2e'
assert not provenance['nativeChanges'] and provenance['metro']['actualDependencies']
assert provenance['metro']['launchArguments'] == ['-RCT_jsLocation', 'localhost:8099']
for device in provenance['devices']:
    assert device['sameFoundationBinary']
    assert device['installedBinarySha256'] == provenance['binarySha256']
assert {d['deviceType'] for d in provenance['devices']} == {
    'com.apple.CoreSimulator.SimDeviceType.iPhone-SE-3rd-generation',
    'com.apple.CoreSimulator.SimDeviceType.iPad-mini-A17-Pro',
}
images = json.loads((root / 'images.json').read_text())
assert {r['file'] for r in images} == {str(p.relative_to(root)) for p in native.glob('*.png')}
for row in images:
    assert hashlib.sha256((root / row['file']).read_bytes()).hexdigest() == row['sha256']
print(f'PASS: {len(states)} snapshots, 11 restored keys per device, unchanged 10/11 events, {len(images)} image digests; native gaps remain open')
