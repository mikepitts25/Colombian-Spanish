"""Verify recorded evidence without accessing a simulator or temporary backup."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
rows = json.loads((root / 'native/native-state-check.json').read_text())
states = {row['phase']: row for row in rows}
assert len(rows) == len(states) == 19
metadata = json.loads((root / 'fixture-metadata.json').read_text())
fixtures = {row['kind']: row for row in metadata['fixtures']}
phone = '2EDF21F0-7DBD-4B09-8D5F-85560FD0E730'
mini = 'DF3686C1-A2E7-4870-B127-A83A8B67541D'
for row in rows:
    assert row['device'] in {phone, mini} and row['pathMatchesRequestedDevice']
    assert f"/Devices/{row['device']}/data/Containers/Data/Application/" in row['capturePath']
    assert len(row['events']) == (10 if row['device'] == phone else 11)
    assert len(row['keyHashes']) == 11
    assert all(e['matchesStored'] for e in (row.get('journal') or {}).get('entries', []))
for baseline, final in [('phone-baseline', 'phone-restored'), ('mini-baseline', 'mini-untouched-final')]:
    assert states[baseline]['keyHashes'] == states[final]['keyHashes']
    assert states[final]['deckCount'] == 48 and states[final]['cardCount'] == 1402
for kind, phase in [('unavailable', 'phone-unavailable-home'), ('cap', 'phone-cap-home'), ('long-review', 'phone-review-home')]:
    assert fixtures[kind]['expectedKeyHashes'] == states[phase]['keyHashes'], kind
assert states['phone-unavailable-home']['keyHashes'] == states['phone-unavailable-opened']['keyHashes']
assert states['phone-unavailable-home']['plan']['current']['applied']['contentVersion'] == 99
for phase in ['phone-empty-import-cold-seeded', 'phone-production-js-review-only-home', 'phone-production-js-study']:
    assert states[phase]['deckCount'] == 47 and states[phase]['cardCount'] == 1392
    assert states[phase]['plan']['current'] is None and not states[phase]['missions']['runs']
q = states['phone-production-js-study']['session']['queue']
assert q['cardIds'] == ['0009', '0010', '0011'] and q['limits'] == {'cardLimit': 3, 'newLimit': 3}
cap = states['phone-cap-home']
assert cap['prefs']['newCardsPerDay'] == cap['daily']['newCount'] == 1
assert cap['plan']['current'] is None and cap['session'] == {}
assert cap['keyHashes'] == states['phone-cap-browse']['keyHashes'] == states['phone-rejected-review-fixture']['keyHashes']
review = states['phone-review-home']
resumed = states['phone-review-resumed']
assert review['plan'] == resumed['plan']
assert review['plan']['current']['review']['session']['queue']['cardIds'] == ['catchup-5', 'catchup-6']
assert resumed['session']['cardId'] == 'catchup-5'
# A resume may refresh its checkpoint time, but must retain the complete
# intended deck/card/queue/session/region/limits contract without extra fields.
expected_session = review['plan']['current']['review']['session']
assert {k: v for k, v in resumed['session'].items() if k != 'updatedAt'} == {
    k: v for k, v in expected_session.items() if k != 'updatedAt'
}, 'Resumed ordinary session diverges from the retained review session'
assert {k for k, v in review['keyHashes'].items() if resumed['keyHashes'][k] != v} == {'SRS_LAST_STUDY_SESSION_V1'}
assert states['phone-system-light']['keyHashes'] == states['phone-system-dark']['keyHashes']
assert states['phone-system-dark']['keyHashes'] == states['phone-barrio-return']['keyHashes'] == states['phone-system-cold']['keyHashes']
assert states['phone-system-cold']['prefs']['appearanceMode'] == 'system'
assert states['phone-classic-roundtrip']['prefs']['themeId'] == 'classic'
for phase in ['phone-system-light', 'phone-system-dark', 'phone-classic-roundtrip', 'phone-barrio-return', 'phone-system-cold']:
    assert states[phase]['plan'] == review['plan']
for file in (root / 'native').glob('*-preflight.json'):
    report = json.loads(file.read_text())
    assert report['isolated'] and report['requestedDevice'] in {phone, mini}
    assert f"/Devices/{report['requestedDevice']}/data/" in report['resolvedContainer']
assert metadata['launchModes']['productionJS'][-2:] == ['-RCT_enableDev', 'NO']
assert metadata['nativeChanges'] is False
assert {d['deviceType'] for d in metadata['devices']} == {
    'com.apple.CoreSimulator.SimDeviceType.iPhone-SE-3rd-generation',
    'com.apple.CoreSimulator.SimDeviceType.iPad-mini-A17-Pro',
}
for d in metadata['devices']:
    assert d['binarySha256'] == '40aa16f2b08aec4eb47a4e2087427184bf386dbb8b7e7421e42d368bc103bbcb'
images = json.loads((root / 'images.json').read_text())
assert {i['file'] for i in images} == {str(p.relative_to(root)) for p in (root / 'native').glob('*.png')}
for item in images:
    assert hashlib.sha256((root / item['file']).read_bytes()).hexdigest() == item['sha256']
print(f'PASS: {len(rows)} snapshots, {len(images)} images; exact fixture/resume/System hashes; original11-key baselines and10/11 events preserved. Remaining acceptance is separate.')
