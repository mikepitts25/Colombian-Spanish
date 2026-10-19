"""Passively check saved mini artifacts; never replay or certify UI/audio."""
from pathlib import Path
import hashlib
import json
import re

root = Path(__file__).resolve().parent
rows = json.loads((root / 'state.json').read_text())
meta = json.loads((root / 'verification.json').read_text())
preflights = json.loads((root / 'preflights.json').read_text())
os_rows = json.loads((root / 'os.json').read_text())
assert [r['phase'] for r in rows] == [
    'baseline', 'before-voice', 'rotated-take', 'after-voice',
    'editor-es-complete', 'editor-en-attempt', 'restored-before-cold',
    'restored-cold', 'restored-visible',
]
assert len(preflights) == 4
for pre in preflights.values():
    assert pre['isolated'] is True
    assert pre['requestedDevice'] == meta['device']
    assert all(r['capturePath'] == pre['resolvedContainer'] for r in rows)
for row in rows:
    assert row['device'] == meta['device']
    assert row['pathMatchesRequestedDevice'] is True
    assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 11)
    assert row['journal'] is None
    assert len(row['keyHashes']) == 11
    changes = {k for k in rows[0]['keyHashes']
               if rows[0]['keyHashes'][k] != row['keyHashes'][k]}
    assert changes == ({'SRS_PREFS_V1'} if row['phase'] == 'editor-en-attempt' else set())
assert [(r['phase'], r['microphoneAuthValues'], r['recordingFileCount'])
        for r in os_rows] == [
    ('baseline', [], 0), ('granted-before-rotation', [2], 0),
    ('rotated-take', [2], 1), ('voice-deleted', [2], 0),
    ('restored-unasked', [], 0),
]
assert meta['initialProcess'] == meta['processAliveAfterRotatedTake']
assert meta['finalColdProcess'] != meta['initialProcess']
assert meta['takeDurationSecondsDisplayed'] == 20.1
assert meta['editorEnglishKeyboardActionsAccepted'] is False
assert meta['backupImportUsed'] is False
assert meta['audioCommitted'] is False
assert not list(root.glob('*.m4a'))
draft = re.search(r'Value: (.*?)(?:, Details:|$)',
                  (root / 'editor-es-retained-draft.txt').read_text().strip())[1]
assert len(draft) == meta['draftCharacters'] == 610
assert hashlib.sha256(draft.encode()).hexdigest() == meta['draftSHA256']
assert len(meta['images']) == 11
for name, digest in meta['images'].items():
    data = (root / name).read_bytes()
    assert data.startswith(b'\xff\xd8\xff')
    assert hashlib.sha256(data).hexdigest() == digest
    assert (root / Path(name).with_suffix('.txt')).is_file()
print('PASS: nine own-path states; English preferences-only delta and exact '
      'cold/visible restoration; four preflights, five OS/file observations, '
      'retained610-character draft and eleven JPEG hashes agree. '
      'Passive artifacts do not independently prove native UI or sound.')
