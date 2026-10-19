"""Passively check archived Files collision evidence; never operate a simulator."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent

def read(name):
    return json.loads((root / name).read_text())

rows, inventories = read('state.json'), read('file-states.json')
meta, before = read('verification.json'), read('target-before.json')
assert [r['phase'] for r in rows] == [
    'baseline', 'after-first-export', 'collision-baseline', 'stopped',
    'kept-both', 'replaced', 'replaced-preview', 'preview-canceled', 'cold-visible',
]
prior = json.loads((root.parent / '2026-10-19-mini-reinstall-restore/state.json').read_text())[-1]
assert rows[0]['keyHashes'] == prior['keyHashes']
for row in rows:
    assert row['device'] == meta['device']
    assert row['capturePath'] == meta['container'] == prior['capturePath']
    assert row['pathMatchesRequestedDevice'] is True
    assert row['keyHashes'] == rows[0]['keyHashes'] and len(row['keyHashes']) == 11
    assert row['journal'] is None
    assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 11)
preflights = read('preflights.json')
assert len(preflights) == 3
for pre in preflights.values():
    assert pre['isolated'] is True and pre['requestedDevice'] == meta['device']
    assert pre['resolvedContainer'] == meta['container']
assert [r['phase'] for r in inventories] == ['stopped', 'kept-both', 'replaced', 'final']
stopped, kept, replaced, final = [r['files'] for r in inventories]
assert len(stopped) == 3 and stopped['741.json']['sha256'] == before['sha256']
assert set(kept) - set(stopped) == {'741 2.json'}
assert all(kept[k] == v for k, v in stopped.items())
assert kept.keys() == replaced.keys() == final.keys()
assert [k for k in kept if kept[k] != replaced[k]] == ['741.json']
assert replaced['741.json']['exportedAt'] > kept['741.json']['exportedAt']
assert final == replaced
assert len({v['logicalHash'] for files in [stopped, kept, replaced, final]
            for v in files.values()}) == 1
for files in [stopped, kept, replaced, final]:
    assert files[meta['originalFileName']]['sha256'] == meta['originalFileSHA256']
assert meta['originalHostCopySHA256'] == meta['originalFileSHA256']
assert meta['backupPayloadsMatchBaseline'] is True and len(meta['portableFields']) == 9
assert meta['nativeBuildChanged'] is False and meta['rawBackupCommitted'] is False
assert read('os.json') == {'microphoneRows': [], 'takeCount': 0}
assert len(meta['images']) == 7
for name, digest in meta['images'].items():
    data = (root / name).read_bytes()
    assert data.startswith(b'\xff\xd8\xff') and hashlib.sha256(data).hexdigest() == digest
    assert (root / Path(name).with_suffix('.txt')).is_file()
preview = (root / 'replaced-preview.txt').read_text()
assert replaced['741.json']['exportedAt'] in preview
assert '48 decks · 1402 tarjetas · 11 observaciones' in preview
print('PASS: Stop preserves target, Keep Both adds one file, Replace changes only '
      '741.json, and matching preview/final files/nine app states preserve all11 '
      'records. Passive artifacts do not replay native provider actions.')
