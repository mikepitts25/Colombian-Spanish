"""Passive archive checks; no native replay, compilation or network isolation proof."""
from pathlib import Path
import hashlib
import json
import struct

root = Path(__file__).resolve().parent
read = lambda p: json.loads(p.read_text())

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

meta = read(root / 'verification.json')
mini = read(root / 'native/mini-state-check.json')
release = read(root / 'native/release-state-check.json')
assert [r['phase'] for r in mini] == ['baseline', 'before-device-restart', 'after-device-restart',
    'restored', 'restored-cold', 'source-final']
assert [r['phase'] for r in release] == ['release-onboarded', 'release-home', 'release-cold',
    'release-recommended', 'release-final-cold', 'release-resumed', 'release-final-home']
assert mini[0]['keyHashes'] == read(root.parent / '2026-10-19-mini-voice/native/native-state-check.json')[-1]['keyHashes']
fields = {'plan': 'SRS_DAILY_PLAN_V1', 'missions': 'SRS_MISSIONS_V1', 'prefs': 'SRS_PREFS_V1',
    'daily': 'SRS_DAILY_PROGRESS_V1', 'streak': 'SRS_STUDY_STREAK_V1',
    'quizHistory': 'SRS_QUIZ_HISTORY_V1', 'session': 'SRS_LAST_STUDY_SESSION_V1',
    'notificationPrefs': 'SRS_NOTIFICATION_PREFS_V1', 'seenWords': 'SRS_SEEN_WORDS_V1'}
for rows, device, decks, cards, events in [
    (mini, 'DF3686C1-A2E7-4870-B127-A83A8B67541D', 48, 1402, 11),
    (release, 'D5502A06-4858-428C-901C-587B58280F64', 47, 1392, 0),
]:
    first = rows[0]
    for row in rows:
        assert row['device'] == device and row['pathMatchesRequestedDevice'] is True
        assert row['capturePath'] == first['capturePath']
        assert '/Devices/' + device + '/data/Containers/Data/Application/' in row['capturePath']
        assert row['deckCount'] == decks and row['cardCount'] == cards
        assert len(row['events']) == events and row['events'] == first['events']
        assert row['deckHash'] == first['deckHash'] and row['taskCards'] == first['taskCards']
        assert row['journal'] is None and len(row['keyHashes']) == 11
        for field, key in fields.items():
            assert digest(row[field]) == row['keyHashes'][key]
        expected = dict(first['keyHashes'])
        if rows is release:
            expected['SRS_LAST_STUDY_SESSION_V1'] = digest(row['session'])
            assert row['keyHashes']['SRS_LEARNING_EVENTS_V1'] == digest(None)
        else:
            assert digest({'schemaVersion': 1, 'events': row['events']}) == row['keyHashes']['SRS_LEARNING_EVENTS_V1']
        assert row['keyHashes'] == expected
assert meta['sourceRecovery']['keyHashes'] == mini[0]['keyHashes']
assert release[0]['daily'] == {'date': '2026-10-19', 'count': 0, 'target': 5, 'newCount': 0}
assert release[0]['plan'] is None and release[0]['missions'] is None
assert release[0]['prefs']['themeId'] == 'classic' and release[0]['prefs']['uiLanguage'] == 'es'
initial = release[0]['session']
assert initial['deckId'] == 'deck-slang' and initial['cardId'] == '0161'
assert initial['queue']['cardIds'] == [str(n).zfill(4) for n in range(161, 171)]
assert release[0]['keyHashes'] == release[1]['keyHashes'] == release[2]['keyHashes']
recommended = release[3]['session']
assert recommended['deckId'] == 'deck-greetings' and recommended['cardId'] == '0009'
assert recommended['queue']['cardIds'] == ['0009', '0010', '0011', '0012', '0013']
assert recommended['queue']['region'] == 'all'
assert recommended['queue']['limits'] == {'cardLimit': 6, 'newLimit': 5}
assert release[3]['keyHashes'] == release[4]['keyHashes']
assert release[5]['keyHashes'] == release[6]['keyHashes']
resumed = release[5]['session']
assert {k: v for k, v in recommended.items() if k != 'updatedAt'} == {k: v for k, v in resumed.items() if k != 'updatedAt'}
assert resumed['updatedAt'] > recommended['updatedAt']
preflights = list((root / 'native').glob('*preflight.json'))
assert len(preflights) == 9
for path in preflights:
    item = read(path)
    expected = mini[0] if path.name.startswith('mini-') else release[0]
    assert item['isolated'] is True and item['requestedDevice'] == expected['device']
    assert item['container'] == item['resolvedContainer'] == expected['capturePath']
    assert item['bundle'] == 'com.mikepitts.colombianspanish'
images = list((root / 'native').glob('*.png'))
assert len(images) == len(meta['imageSHA256']) == 6
for path in images:
    assert hashlib.sha256(path.read_bytes()).hexdigest() == meta['imageSHA256'][path.name]
    assert struct.unpack('>II', path.read_bytes()[16:24]) == (750, 1334)
build = read(root / 'native/build-metadata.json')
config = read(root / 'native/generated-config.json')
assert build['baseCommit'] == config['baseCommit'] == meta['baseCommit']
assert build['configuration'] == 'Release' and build['platform'] == 'iphonesimulator'
assert build['buildExitCode'] == 0 and build['buildResult'] == 'BUILD SUCCEEDED'
assert build['signingAllowed'] is False and build['sentryAutoUpload'] is False
assert build['hasMicrophoneUsageDescription'] is False
assert 'NSMicrophoneUsageDescription' not in config['infoPlist'] and config['hasBundledReleasePath'] is True
assert build['files']['main.jsbundle']['bytes'] > 100000
assert '** BUILD SUCCEEDED **' in (root / 'software/build-result.log').read_text()
assert meta['homeHasDraftTools'] is False and meta['homeHasReviewOnly'] is True
print('PASS: 6 mini + 7 Release checkpoints, 9 own-path preflights, 6 native image digests. Exact mini recovery, Release session-only transitions/cold preservation and build metadata consistency; UI/build/network observations are not replayed.')
