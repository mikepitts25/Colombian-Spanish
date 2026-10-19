"""Passively check archived data; never replay or certify native UI/audio."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
rows = json.loads((root / 'state.json').read_text())
meta = json.loads((root / 'verification.json').read_text())
os_rows = json.loads((root / 'os.json').read_text())
pre = json.loads((root / 'preflight.json').read_text())
assert [r['phase'] for r in rows] == [
    'baseline', 'fixture-cold', 'restored-cold', 'max-resize-take', 'final-cleanup',
]
assert pre['isolated'] is True
assert pre['requestedDevice'] == meta['device']
for row in rows:
    assert row['device'] == meta['device']
    assert row['capturePath'] == pre['resolvedContainer']
    assert row['pathMatchesRequestedDevice'] is True
    assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 10)
    assert row['journal'] is None
    assert len(row['keyHashes']) == 11
baseline, fixture, *restored = rows
assert {k for k in baseline['keyHashes']
        if baseline['keyHashes'][k] != fixture['keyHashes'][k]} == {
            'SRS_DECKS_V3', 'SRS_PREFS_V1',
        }
assert all(r['keyHashes'] == baseline['keyHashes'] for r in restored)
assert meta['restoredColdPID'] == meta['pidAliveAfterResizedTake']
assert meta['fixtureColdPID'] != meta['restoredColdPID']
assert meta['nativeTextSizes'] == [3, 11, 3]
assert meta['recordingElapsedSecondsAfterResize'] == 10
assert meta['takeDurationSecondsDisplayed'] == 18.7
assert [(r['phase'], r['microphoneAuthValues'], r['recordingFileCount'])
        for r in os_rows] == [
    ('max-resize-take', [2], 1), ('final-cleanup', [], 0),
]
assert meta['audioCommitted'] is False
assert not list(root.glob('*.m4a'))
assert len(meta['images']) == 6
for name, digest in meta['images'].items():
    data = (root / name).read_bytes()
    assert data.startswith(b'\xff\xd8\xff')
    assert hashlib.sha256(data).hexdigest() == digest
    assert (root / Path(name).with_suffix('.txt')).is_file()
print('PASS: five own-path checkpoints; fixture-only deck/prefs deltas; '
      'all eleven baseline hashes recovered before/during/after voice; '
      'two OS/file observations and six JPEG hashes agree. '
      'Passive checks do not independently prove native actions or sound.')
