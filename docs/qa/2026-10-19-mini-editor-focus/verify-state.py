"""Passively check archived editor evidence; never operate UI or storage."""
from pathlib import Path
import hashlib
import json
import re

root = Path(__file__).resolve().parent

def read(name):
    return json.loads((root / name).read_text())

rows, meta = read('state.json'), read('verification.json')
assert [row['phase'] for row in rows] == [
    'baseline', 'english-portrait', 'english-landscape', 'english-two-drafts',
    'restored-before-cold', 'restored-cold-visible',
]
prior = json.loads((root.parent / '2026-10-19-files-collision/state.json').read_text())[-1]
assert rows[0]['keyHashes'] == prior['keyHashes']
for index, row in enumerate(rows):
    assert row['device'] == meta['device'] and row['pathMatchesRequestedDevice'] is True
    assert row['capturePath'] == meta['container'] == prior['capturePath']
    assert row['journal'] is None and len(row['keyHashes']) == 11
    assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 11)
    differences = [key for key in row['keyHashes']
                   if row['keyHashes'][key] != rows[0]['keyHashes'][key]]
    assert differences == (['SRS_PREFS_V1'] if 1 <= index <= 3 else [])
for pre in read('preflights.json').values():
    assert pre['isolated'] is True and pre['requestedDevice'] == meta['device']
    assert pre['resolvedContainer'] == meta['container']
assert len(read('preflights.json')) == 3
translation = re.search(r'Value: (Temporary editor draft[^\n]*), Details:',
                        (root / 'landscape-retained-draft.txt').read_text())[1]
both_landscape = (root / 'two-drafts-landscape.txt').read_text()
both_portrait = (root / 'two-drafts-portrait-translation.txt').read_text()
example = re.search(r'Value: (Ejemplo temporal[^\n]*), Details:', both_portrait)[1]
for value, kind in [(translation, 'translation'), (example, 'example')]:
    assert len(value) == meta[kind + 'DraftCharacters'] == 610
    assert hashlib.sha256(value.encode()).hexdigest() == meta[kind + 'DraftSHA256']
    assert 'Value: ' + value in both_landscape and 'Value: ' + value in both_portrait
assert meta['acceptedActions'] == ['Prev', 'Skip', 'Needs Native Check', 'Save & Next']
assert meta['nativeSourceChanged'] is False and meta['keyboardOpenAccepted'] is True
assert read('os.json') == {'microphoneRows': [], 'takeCount': 0,
                           'dictationPromptChoice': 'Not Now'}
assert meta['finalNative'] == {'textSize': 3, 'orientation': 'portrait',
                               'voiceOver': False, 'captureKeyboard': False,
                               'appearance': 'Light'}
assert len(meta['images']) == 7
for name, digest in meta['images'].items():
    data = (root / name).read_bytes()
    assert data.startswith(b'\xff\xd8\xff') and hashlib.sha256(data).hexdigest() == digest
    assert (root / Path(name).with_suffix('.txt')).is_file()
print('PASS: six states preserve ten records in English and all11 after recovery; '
      'three preflights, both retained610-character drafts and seven JPEG hashes '
      'agree. Passive artifacts do not replay focus or prove visual acceptance.')
