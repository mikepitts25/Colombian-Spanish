"""Passively check archived data/image consistency; never replay native UI."""
from pathlib import Path
import hashlib
import json
import struct

root = Path(__file__).resolve().parent
rows = json.loads((root / 'state.json').read_text())
meta = json.loads((root / 'verification.json').read_text())
preflight = json.loads((root / 'preflight.json').read_text())
assert [r['phase'] for r in rows] == [
    'baseline', 'after-voice', 'restored-cold', 'restored-visible',
]
baseline, voice, *restored = rows
assert preflight['isolated'] is True
assert preflight['requestedDevice'] == meta['device']
for row in rows:
    assert row['device'] == meta['device']
    assert row['pathMatchesRequestedDevice'] is True
    assert row['capturePath'] == preflight['resolvedContainer']
    assert row['journal'] is None
    assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 10)
    assert len(row['keyHashes']) == 11
assert {key for key in baseline['keyHashes']
        if baseline['keyHashes'][key] != voice['keyHashes'][key]} == {
            'SRS_DECKS_V3', 'SRS_PREFS_V1',
        }
for row in restored:
    assert row['keyHashes'] == baseline['keyHashes']
assert meta['processBeforeBackground'] == meta['processAfterForeground']
assert meta['restoredColdProcess'] != meta['processAfterForeground']
assert meta['recordingFileBytesBeforeDelete'] > 0
for key in ['recordingFilesAfterDelete', 'recordingFilesWhileBackgrounded',
            'recordingFilesAtRecovery']:
    assert meta[key] == 0
assert meta['microphoneRowsAfterReset'] == []
assert not list(root.glob('*.m4a'))
for name, digest in meta['images'].items():
    data = (root / name).read_bytes()
    assert hashlib.sha256(data).hexdigest() == digest
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    assert struct.unpack('>II', data[16:24]) == (750, 1334)
print('PASS: four own-path checkpoints; nine non-fixture records unchanged; '
      'all eleven baseline hashes restored twice; three image hashes/dimensions. '
      'Observed metadata is not an independent replay of native events.')
