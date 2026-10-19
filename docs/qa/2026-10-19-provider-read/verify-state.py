"""Passively verify archived data; never stage faults or operate simulators."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent

def read(name):
    return json.loads((root / name).read_text())

rows, meta, fault = read('state.json'), read('verification.json'), read('fault.json')
assert [row['phase'] for row in rows] == ['baseline', 'restricted-selected',
    'restricted-canceled', 'restored-preview', 'preview-canceled', 'cold-home']
prior = json.loads((root.parent / '2026-10-19-mini-editor-focus/state.json').read_text())[-1]
for row in rows:
    assert row['keyHashes'] == prior['keyHashes'] and len(row['keyHashes']) == 11
    assert row['journal'] is None
    assert row['device'] == meta['device'] and row['pathMatchesRequestedDevice'] is True
    assert row['capturePath'] == meta['container'] == prior['capturePath']
    assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 11)
assert len(read('preflights.json')) == 2
for pre in read('preflights.json').values():
    assert pre['isolated'] is True and pre['requestedDevice'] == meta['device']
    assert pre['resolvedContainer'] == meta['container']
assert fault['fileName'] == '741 2.json'
assert fault['originalMode'] == fault['restoredMode'] == '0o644'
assert fault['restrictedMode'] == '0o0'
assert fault['hostReadDenied'] is True and fault['hostErrno'] == 13
assert fault['sha256'] == fault['restoredSha256']
assert 0 < fault['restoredAt'] - fault['startedAt'] < fault['guardSeconds'] == 240
files = read('files-after.json')
prior_files = json.loads((root.parent / '2026-10-19-files-collision/file-states.json').read_text())[-1]['files']
assert files.keys() == prior_files.keys()
for name, value in files.items():
    for key in ['bytes', 'sha256', 'exportedAt']:
        assert value[key] == prior_files[name][key]
assert files[fault['fileName']]['sha256'] == fault['sha256']
assert files[fault['fileName']]['mode'] == fault['restoredMode']
assert meta['actualAppErrorObserved'] is False and meta['nativeSourceChanged'] is False
assert meta['coldPID'] != meta['initialPID']
preview = (root / 'restored-preview.txt').read_text()
assert meta['previewExportedAt'] in preview and '48 decks · 1402 tarjetas · 11 observaciones.' in preview
assert meta['beforeShutdown'].count('(Booted)') == 1 and meta['device'] in meta['beforeShutdown']
assert '(Booted)' not in meta['afterShutdown']
assert len(meta['images']) == 4
for name, digest in meta['images'].items():
    data = (root / name).read_bytes()
    assert data.startswith(b'\xff\xd8\xff') and hashlib.sha256(data).hexdigest() == digest
    assert (root / Path(name).with_suffix('.txt')).is_file()
print('PASS: six exact-state checkpoints, two preflights, restored restricted-file mode/hash, '
      'unchanged four-file inventory, preview metadata, four JPEG hashes and cleanup inventory. '
      'No app-error or cloud acceptance inferred.')
