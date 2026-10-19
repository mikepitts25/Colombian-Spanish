"""Passively check saved QA artifacts; never replay or certify native actions."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
rows = json.loads((root / 'state.json').read_text())
os_rows = json.loads((root / 'os.json').read_text())
meta = json.loads((root / 'verification.json').read_text())
preflight = json.loads((root / 'preflight.json').read_text())
assert [r['phase'] for r in rows] == [
    'recovered-control-baseline', 'revoked-relaunch',
    'recovered-take-ready', 'cleaned-original-records',
]
assert preflight['isolated'] is True
assert preflight['requestedDevice'] == meta['device']
for row in rows:
    assert row['device'] == meta['device']
    assert row['capturePath'] == preflight['resolvedContainer']
    assert row['pathMatchesRequestedDevice'] is True
    assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 10)
    assert len(row['keyHashes']) == 11
    assert row['keyHashes'] == rows[0]['keyHashes']
    assert row['journal'] is None
assert [(r['phase'], r['microphoneAuthValues'], r['recordingFileCount'])
        for r in os_rows] == [
    ('recovered-control-baseline', [], 0),
    ('granted', [2], 0),
    ('revoked-in-settings', [0], 0),
    ('reenabled-in-settings', [2], 0),
    ('recovered-take-ready', [2], 1),
    ('cleaned-original-unasked', [], 0),
]
assert len({meta[k] for k in ['processBeforeRevocation',
                            'processAfterRevocation', 'processAfterReenable']}) == 3
assert meta['recordingsCommitted'] is False
assert not list(root.glob('*.m4a'))
assert len(meta['images']) == 7
for name, digest in meta['images'].items():
    data = (root / name).read_bytes()
    assert data.startswith(b'\xff\xd8\xff')
    assert hashlib.sha256(data).hexdigest() == digest
    assert (root / Path(name).with_suffix('.txt')).is_file()
print('PASS: four own-path snapshots preserve all eleven records; six OS/file '
      'checkpoints, distinct observed PIDs and seven JPEG hashes agree. '
      'Passive consistency is not independent native-event or audio proof.')
