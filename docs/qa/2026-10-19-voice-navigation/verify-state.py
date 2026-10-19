"""Verify archived voice/navigation evidence without UI or storage mutations."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent

def read(name):
    return json.loads((root / name).read_text())

rows, meta, os_rows = read('state.json'), read('verification.json'), read('os.json')
assert [x['phase'] for x in rows] == ['baseline', 'active-back-home', 'retained-back-home',
    'replay-back-home', 'confirmed-active-back-home', 'before-cold', 'cold-home']
prior = json.loads((root.parent / '2026-10-19-provider-read/state.json').read_text())[-1]
assert rows[0]['keyHashes'] == prior['keyHashes']
for i, row in enumerate(rows):
    assert row['capturePath'] == meta['container'] == prior['capturePath']
    assert row['device'] == meta['device'] and row['pathMatchesRequestedDevice'] is True
    assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 11)
    assert row['journal'] is None and len(row['keyHashes']) == 11
    changed = [k for k in row['keyHashes'] if row['keyHashes'][k] != rows[0]['keyHashes'][k]]
    assert changed == (['SRS_DAILY_PROGRESS_V1'] if i >= 3 else [])
    assert row['daily'] == {'date': '2026-10-20' if i >= 3 else '2026-10-19',
                            'count': 0, 'target': 5, 'newCount': 0}
assert all(x['keyHashes'] == rows[3]['keyHashes'] for x in rows[3:])
assert len(read('preflights.json')) == 3
for pre in read('preflights.json').values():
    assert pre['isolated'] is True and pre['requestedDevice'] == meta['device']
    assert pre['resolvedContainer'] == meta['container']
os_by = {x['phase']: x for x in os_rows}
assert os_by['baseline']['microphoneRows'] == os_by['cold-home']['microphoneRows'] == []
assert os_by['resumed']['microphoneRows'] == [[0]]
assert os_by['prompt-reset']['microphoneRows'] == []
accepted = os_rows[3:]
for x in accepted:
    assert x['device'] == meta['device'] and x['container'] == meta['container']
    assert x['booted'].count('(Booted)') == 1 and meta['device'] in x['booted']
    if x['phase'] != 'cold-home':
        assert x['microphoneRows'] == [[2]]
        assert len(x['process']) == 1 and x['process'][0].startswith(str(meta['acceptedPID']) + '\t')
for phase in ['active-back-home', 'retained-back-home', 'replay-back-home',
              'confirmed-active-back-home', 'before-reset', 'cold-home']:
    assert os_by[phase]['takes'] == []
for phase in ['confirmed-active-before-back', 'retained-before-back', 'replay-ready']:
    assert len(os_by[phase]['takes']) == 1 and os_by[phase]['takes'][0]['bytes'] > 0
assert os_by['retained-before-back']['takes'][0]['bytes'] == 95956
assert os_by['replay-ready']['takes'][0]['bytes'] == 310183
assert os_by['cold-home']['process'][0].startswith(str(meta['coldPID']) + '\t')
assert meta['coldPID'] != meta['acceptedPID']
assert 'text Description: Grabando,' in (root / 'active-immediate-pre-back.txt').read_text()
assert 'Listo para escuchar' in (root / 'retained-immediate-pre-back.txt').read_text()
assert 'Reproducción iniciada' in (root / 'replay-before-back.txt').read_text()
for name in ['after-confirmed-active-back-ready.txt', 'after-retained-back-ready.txt',
             'after-replay-back-ready.txt']:
    text = (root / name).read_text()
    assert 'Listo para grabar' in text
    assert 'button (disabled) Description: Escuchar mi toma,' in text
    assert 'button (disabled) Description: Eliminar mi toma,' in text
seconds = (meta['replayTiming']['homeObservedAt'] - meta['replayTiming']['replayClickBefore']) / 1000
assert 0 < seconds < meta['replayTakeSeconds'] == 20.7
assert '(Booted)' not in meta['finalBooted']
assert meta['setupOverlap'].count('(Booted)') == 2
assert meta['nativeSourceChanged'] is meta['appStateWrittenDirectly'] is False
assert len(meta['images']) == 6
for name, sha in meta['images'].items():
    data = (root / name).read_bytes()
    assert data.startswith(b'\xff\xd8\xff') and hashlib.sha256(data).hexdigest() == sha
    assert (root / Path(name).with_suffix('.txt')).is_file()
print('PASS: seven states preserve ten records plus expected real-midnight daily-date change; '
      'three Back cleanups/reentry, sole-mini accepted file/process snapshots, unasked/zero-take '
      'cold recovery, three preflights and six JPEG hashes. Passive checks are not UI/audio replay.')
