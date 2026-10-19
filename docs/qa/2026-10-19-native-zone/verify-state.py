"""Passive native timezone/theme evidence checks, not UI/clock/PID replay."""
from pathlib import Path
from datetime import datetime
import hashlib
import json
import struct

root = Path(__file__).resolve().parent
read = lambda path: json.loads(path.read_text())

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

rows = read(root / 'native/native-state-check.json')
timeline = read(root / 'native/midnight-timeline.json')
meta = read(root / 'verification.json')
phases = ['baseline', 'honolulu-cold', 'anchorage-cold', 'barrio-unsaved',
    'barrio-system-light', 'barrio-system-dark', 'barrio-es-max', 'barrio-en-max',
    'classic-restored-before-midnight', 'barrio-before-midnight', 'barrio-after-midnight',
    'progress-after-midnight', 'home-after-progress', 'classic-restored-after-midnight', 'final-plain-cold']
assert [r['phase'] for r in rows] == phases
baseline = rows[0]
previous = read(root.parent / '2026-10-19-release-bundle/native/release-state-check.json')[-1]
assert baseline['keyHashes'] == previous['keyHashes']
assert baseline['session'] == previous['session']
assert baseline['daily'] == {'date': '2026-10-19', 'count': 0, 'target': 5, 'newCount': 0}
barrio = {'barrio-system-light', 'barrio-system-dark', 'barrio-es-max', 'barrio-en-max',
    'barrio-before-midnight', 'barrio-after-midnight', 'progress-after-midnight', 'home-after-progress'}
fields = {'plan': 'SRS_DAILY_PLAN_V1', 'missions': 'SRS_MISSIONS_V1', 'prefs': 'SRS_PREFS_V1',
    'daily': 'SRS_DAILY_PROGRESS_V1', 'streak': 'SRS_STUDY_STREAK_V1',
    'quizHistory': 'SRS_QUIZ_HISTORY_V1', 'session': 'SRS_LAST_STUDY_SESSION_V1',
    'notificationPrefs': 'SRS_NOTIFICATION_PREFS_V1', 'seenWords': 'SRS_SEEN_WORDS_V1'}
for i, row in enumerate(rows):
    assert row['device'] == meta['device'] == 'D5502A06-4858-428C-901C-587B58280F64'
    assert row['capturePath'] == baseline['capturePath'] and row['pathMatchesRequestedDevice'] is True
    assert '/Devices/' + meta['device'] + '/data/Containers/Data/Application/' in row['capturePath']
    assert row['deckCount'] == 47 and row['cardCount'] == 1392 and row['events'] == []
    assert row['deckHash'] == baseline['deckHash'] and row['taskCards'] == baseline['taskCards']
    assert row['journal'] is None and len(row['keyHashes']) == 11
    prefs = dict(baseline['prefs'], themeId='barrio' if row['phase'] in barrio else 'classic',
        uiLanguage='en' if row['phase'] == 'barrio-en-max' else 'es')
    daily = dict(baseline['daily'], date='2026-10-18' if 1 <= i <= 9 else '2026-10-19')
    assert row['prefs'] == prefs and row['daily'] == daily
    expected = dict(baseline['keyHashes'], SRS_PREFS_V1=digest(prefs), SRS_DAILY_PROGRESS_V1=digest(daily))
    assert row['keyHashes'] == expected
    for field, key in fields.items():
        assert digest(row[field]) == row['keyHashes'][key]
        if field not in ['daily', 'prefs']:
            assert row[field] == baseline[field]
    assert row['keyHashes']['SRS_LEARNING_EVENTS_V1'] == digest(None)
assert rows[2]['keyHashes'] == rows[3]['keyHashes'] == rows[8]['keyHashes']
assert rows[4]['keyHashes'] == rows[5]['keyHashes'] == rows[6]['keyHashes'] == rows[9]['keyHashes']
assert rows[10]['keyHashes'] == rows[11]['keyHashes'] == rows[12]['keyHashes']
assert rows[-1]['keyHashes'] == rows[-2]['keyHashes'] == baseline['keyHashes']
assert len(timeline) == 3
for item, index in zip(timeline, [8, 9, 10]):
    assert item['device'] == meta['device'] and item['capturePath'] == baseline['capturePath']
    assert item['keyHashes'] == rows[index]['keyHashes'] and item['daily'] == rows[index]['daily']
    assert item['expectedAnchorageDay'] == item['daily']['date'] and item['journal'] is None
assert datetime.fromisoformat(timeline[0]['utc']) < datetime.fromisoformat(timeline[1]['utc']) < datetime.fromisoformat(meta['midnightUTC'])
delay = (datetime.fromisoformat(timeline[-1]['utc']) - datetime.fromisoformat(meta['midnightUTC'])).total_seconds()
assert delay == meta['firstObservedDelaySeconds'] and 0 < delay < 62
assert meta['launchPIDs'] == {'honolulu': 99362, 'anchorageMidnight': 195, 'finalPlain': 6384}
preflights = list((root / 'native').glob('*preflight.json'))
assert len(preflights) == 6
for path in preflights:
    item = read(path)
    assert item['isolated'] is True and item['requestedDevice'] == meta['device']
    assert item['container'] == item['resolvedContainer'] == baseline['capturePath']
    assert item['bundle'] == 'com.mikepitts.colombianspanish'
images = list((root / 'native').glob('*.png'))
assert len(images) == len(meta['imageSHA256']) == 9
for path in images:
    assert hashlib.sha256(path.read_bytes()).hexdigest() == meta['imageSHA256'][path.name]
    assert struct.unpack('>II', path.read_bytes()[16:24]) == (750, 1334)
binary = read(root / 'native/installed-binary.json')
build = read(root.parent / '2026-10-19-release-bundle/native/build-metadata.json')
assert '/Devices/' + meta['device'] + '/' in binary['path'] and binary['matchesPreviousRelease'] is True
assert binary['fileSHA256'] == {k: v['sha256'] for k, v in build['files'].items()}
print('PASS: 15 full snapshots, 3 change-point samples, 6 preflights, 9 image digests. Date/prefs-only transitions, real-boundary timing consistency, exact queue and all11 restoration. UI/PID/timezone setup observations are not replayed.')
