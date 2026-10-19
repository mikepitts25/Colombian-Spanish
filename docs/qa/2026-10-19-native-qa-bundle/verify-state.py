"""Check saved QA consistency, not a replay of native events or screenshot semantics."""
from datetime import datetime
from pathlib import Path
import hashlib
import json
import struct

root = Path(__file__).resolve().parent
rows = json.loads((root / 'state.json').read_text())
by = {row['phase']: row for row in rows}
assert len(rows) == len(by) == 17
meta = json.loads((root / 'verification.json').read_text())
release = 'D5502A06-4858-428C-901C-587B58280F64'
editor = 'BF511B0E-479F-429E-83B7-4134E910847F'
preflights = {
    release: json.loads((root / 'release-final-preflight.json').read_text()),
    editor: json.loads((root / 'editor-preflight.json').read_text()),
}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def changed(before, after):
    return {key for key in by[before]['keyHashes']
            if by[before]['keyHashes'][key] != by[after]['keyHashes'][key]}


for row in rows:
    preflight = preflights[row['device']]
    assert preflight['isolated'] is True
    assert preflight['requestedDevice'] == row['device']
    assert row['capturePath'] == preflight['resolvedContainer']
    assert f"/Devices/{row['device']}/data/Containers/Data/Application/" in row['capturePath']
    assert row['pathMatchesRequestedDevice'] is True and row['journal'] is None
    assert len(row['keyHashes']) == 11
    assert (row['deckCount'], row['cardCount']) == ((47, 1392) if row['device'] == release else (48, 1402))
    for field, key in [('prefs', 'SRS_PREFS_V1'), ('daily', 'SRS_DAILY_PROGRESS_V1'),
                       ('session', 'SRS_LAST_STUDY_SESSION_V1'), ('plan', 'SRS_DAILY_PLAN_V1'),
                       ('streak', 'SRS_STUDY_STREAK_V1')]:
        assert digest(row[field]) == row['keyHashes'][key]
    assert digest({'schemaVersion': 1, 'events': row['events']}) == row['keyHashes']['SRS_LEARNING_EVENTS_V1']

baseline, earned = by['baseline'], by['earned']
assert len(baseline['events']) == 1
assert earned['events'][:-1] == baseline['events'] and len(earned['events']) == 2
event = earned['events'][-1]
assert (event['cardId'], event['quality'], event['evidence']) == ('0009', 4, 'self-rated')
assert earned['daily'] == {'date': '2026-10-19', 'count': 1, 'target': 5, 'newCount': 1}
assert earned['session']['queue']['cardIds'] == ['0010', '0011', '0012', '0013']
assert changed('earned', 'focused-before-boundary') == {'SRS_PREFS_V1'}
assert changed('focused-before-boundary', 'focused-after-boundary') == {'SRS_DAILY_PROGRESS_V1'}
after = by['focused-after-boundary']
assert after['daily'] == {'date': '2026-10-20', 'count': 0, 'target': 5, 'newCount': 0}
assert after['session'] == earned['session'] and after['events'] == earned['events']
assert not changed('focused-after-boundary', 'progress-after-boundary')
assert changed('progress-after-boundary', 'resumed-after-boundary') == {'SRS_LAST_STUDY_SESSION_V1'}
resumed = by['resumed-after-boundary']['session'].copy()
resumed.pop('updatedAt')
old = earned['session'].copy()
old.pop('updatedAt')
assert resumed == old
for phase in ['file-exported', 'file-preview-cancelled']:
    assert not changed('resumed-after-boundary', phase)
file = json.loads((root / 'file-provider.json').read_text())
assert file['recordHashes'] == by['file-exported']['keyHashes']
assert (file['version'], file['decks'], file['cards'], file['events']) == (3, 47, 1392, 2)
assert file['eventEnvelopeReconstructed'] is True and file['bytes'] > 0
assert '/File Provider Storage/' in file['filePath'] and file['filePath'].endswith(file['fileName'])
assert changed('file-preview-cancelled', 'preferences-restored') == {'SRS_PREFS_V1'}
assert changed('preferences-restored', 'plain-cold-visible') == {'SRS_DAILY_PROGRESS_V1'}
assert by['plain-cold-visible']['prefs'] == baseline['prefs']
assert by['plain-cold-visible']['events'] == earned['events']
assert by['plain-cold-visible']['daily'] == {'date': '2026-10-19', 'count': 0, 'target': 5, 'newCount': 0}
grade = json.loads((root / 'graded-card.json').read_text())
assert grade['beforeDeckHash'] == baseline['keyHashes']['SRS_DECKS_V3'] == grade['afterNormalizedCardHash']
assert grade['afterDeckHash'] == earned['keyHashes']['SRS_DECKS_V3']
assert (grade['before']['reps'], grade['after']['reps'], grade['after']['interval']) == (0, 1, 1)
assert abs(grade['after']['due'] - event['occurredAt'] - 86400000) < 1000

timeline = json.loads((root / 'timeline.json').read_text())
assert len(timeline) == 2
for point, phase in zip(timeline, ['focused-before-boundary', 'focused-after-boundary']):
    assert point['device'] == release and point['capturePath'] == after['capturePath']
    assert point['keyHashes'] == by[phase]['keyHashes'] and point['journal'] is None
assert timeline[-1]['utc'] == meta['firstObservedResetUtc']
elapsed = (datetime.fromisoformat(timeline[-1]['utc']) - datetime.fromisoformat(meta['boundaryUtc'])).total_seconds()
assert 0 <= elapsed <= 62
assert meta['releaseProcessBeforeBoundary'] == meta['releaseProcessAfterBoundary']
assert meta['releasePlainColdProcess'] != meta['releaseProcessAfterBoundary']

for phase in ['editor-before-fix', 'editor-es-fixed', 'editor-restored', 'editor-restored-cold']:
    assert not changed('editor-baseline', phase)
assert changed('editor-baseline', 'editor-en-fixed') == {'SRS_PREFS_V1'}
assert len(by['editor-restored-cold']['events']) == 12
final_preflight = json.loads((root / 'editor-final-preflight.json').read_text())
assert final_preflight == preflights[editor]
assert 'Expected: 313' in (root / 'editor-red.log').read_text()
assert 'Received: 387' in (root / 'editor-red.log').read_text()
assert '19 passed, 19 total' in (root / 'editor-green.log').read_text()
for name, expected in meta['images'].items():
    data = (root / name).read_bytes()
    assert hashlib.sha256(data).hexdigest() == expected
    assert data[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', data[16:24]) == (750, 1334)
assert len(meta['images']) == 15
print('PASS: 17 own-path checkpoints; earned daily-only midnight reset; retained event/queue; '
      'Release file/cancel equality; exact editor baseline recovery; 15 image hashes/dimensions. '
      'Historical process/file/UI events and image semantics require separate observation.')
