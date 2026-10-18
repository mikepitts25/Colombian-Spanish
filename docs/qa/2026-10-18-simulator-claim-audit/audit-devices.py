"""Explicit evidence collector: snapshot own app dirs or probe one saved QA UUID.
No app launch or storage writes. Probe may temporarily boot a shutdown QA device.
"""
import hashlib
import json
import pathlib
import plistlib
import subprocess
import sys
import time

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[2]))
from scripts.simulator_isolation import validate_container

ROOT = pathlib.Path.home() / 'Library/Developer/CoreSimulator/Devices'
BUNDLE = 'com.mikepitts.colombianspanish'
KEYS = ['SRS_DECKS_V3', 'SRS_DAILY_PLAN_V1', 'SRS_MISSIONS_V1', 'SRS_PREFS_V1',
        'SRS_DAILY_PROGRESS_V1', 'SRS_STUDY_STREAK_V1', 'SRS_SEEN_WORDS_V1',
        'SRS_QUIZ_HISTORY_V1', 'SRS_LAST_STUDY_SESSION_V1', 'SRS_NOTIFICATION_PREFS_V1',
        'SRS_LEARNING_EVENTS_V1']


def run(*args, timeout=60):
    return subprocess.run(['xcrun', 'simctl', *args], capture_output=True, text=True, timeout=timeout)


def inventory():
    result = run('list', 'devices', '--json')
    result.check_returncode()
    return [dict(d, runtime=runtime) for runtime, devices in json.loads(result.stdout)['devices'].items()
            for d in devices if d['name'].startswith('Colombian Spanish') or
            d['name'] == 'QUARANTINED - Mission Keyboard Alias']


def own_state(device):
    matches = []
    for meta in (ROOT / device / 'data/Containers/Data/Application').glob('*/.com.apple.mobile_container_manager.metadata.plist'):
        if plistlib.loads(meta.read_bytes()).get('MCMMetadataIdentifier') == BUNDLE:
            matches.append(meta.parent)
    if len(matches) != 1:
        return {'status': 'missing-or-ambiguous-container', 'containerCount': len(matches)}
    root = matches[0]
    validate_container(device, root, ROOT)
    manifests = list(root.rglob('RCTAsyncLocalStorage_V1/manifest.json'))
    if len(manifests) != 1:
        return {'status': 'missing-or-ambiguous-manifest', 'container': str(root), 'manifestCount': len(manifests)}
    manifest = manifests[0]
    mapping = json.loads(manifest.read_text())
    def read(key):
        raw = mapping.get(key)
        if raw is None:
            file = manifest.parent / hashlib.md5(key.encode()).hexdigest()
            raw = file.read_text() if file.exists() else 'null'
        return json.loads(raw)
    def digest(value):
        return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    return {'status': 'captured', 'container': str(root), 'manifest': str(manifest),
            'keyHashes': {key: digest(read(key)) for key in KEYS},
            'journalHash': digest(read('SRS_WRITE_JOURNAL_V1'))}


def snapshot(phase):
    devices = inventory()
    result = {'phase': phase, 'capturedAt': time.time(), 'devices': [
        {'device': d['udid'], 'name': d['name'], 'state': d['state'],
         'runtime': d['runtime'], 'ownState': own_state(d['udid'])} for d in devices]}
    (HERE / f'{phase}.json').write_text(json.dumps(result, indent=2) + '\n')
    print(phase, len(devices), 'project QA devices', flush=True)


def probe(device):
    before = json.loads((HERE / 'before.json').read_text())
    saved = next(d for d in before['devices'] if d['device'] == device)
    current = next(d for d in inventory() if d['udid'] == device)
    if saved['state'] != current['state']:
        raise RuntimeError('Boot state changed since snapshot; inspect before probing')
    if current['name'].startswith('QUARANTINED'):
        raise RuntimeError('Do not boot the quarantined alias; use its recorded evidence')
    result = {'device': device, 'name': saved['name'], 'originalState': saved['state'],
              'startedAt': time.time(), 'appLaunchedByCollector': False}
    try:
        if saved['state'] == 'Shutdown':
            boot = run('boot', device)
            boot.check_returncode()
            try:
                wait = run('bootstatus', device, '-b')
                wait.check_returncode()
            except subprocess.TimeoutExpired as error:
                result['bootStatusWaitTimedOut'] = True
                result['stateAfterWait'] = next(d for d in inventory() if d['udid'] == device)['state']
                if result['stateAfterWait'] != 'Booted':
                    raise RuntimeError('UI-ready wait timed out and device is not Booted') from error
                # App-container registry lookup is read-only and does not require
                # claiming a successful UI-ready boot. Record the actual API result.
        elif saved['state'] != 'Booted':
            raise RuntimeError('Only stable Shutdown or Booted states are supported')
        query = run('get_app_container', device, BUNDLE, 'data', timeout=15)
        result['lookupExitCode'] = query.returncode
        if query.returncode:
            result.update(status='lookup-unverified', error=query.stderr.strip())
        else:
            path = pathlib.Path(query.stdout.strip())
            result['reportedContainer'] = str(path)
            try:
                result['preflight'] = validate_container(device, path, ROOT)
                result['status'] = 'own-path'
            except ValueError as error:
                result.update(status='foreign-or-invalid-path', error=str(error))
    except Exception as error:
        result.update(status='probe-unverified', error=str(error))
    finally:
        if saved['state'] == 'Shutdown':
            state = next(d for d in inventory() if d['udid'] == device)['state']
            if state != 'Shutdown':
                stopped = run('shutdown', device)
                result['shutdownExitCode'] = stopped.returncode
        result['finalState'] = next(d for d in inventory() if d['udid'] == device)['state']
        result['finishedAt'] = time.time()
        (HERE / 'probes' / f'{device}.json').write_text(json.dumps(result, indent=2) + '\n')
        print(device, result['status'], 'final', result['finalState'], flush=True)


if __name__ == '__main__':
    if sys.argv[1] == 'snapshot' and sys.argv[2] in ['before', 'after']:
        snapshot(sys.argv[2])
    elif sys.argv[1] == 'probe':
        probe(sys.argv[2])
    else:
        raise SystemExit('Use snapshot before|after or probe EXPLICIT-SAVED-QA-UUID')
