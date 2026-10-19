"""Passively check negative-route evidence and exact recovery, not acceptance."""
from pathlib import Path
import json
import hashlib

root = Path(__file__).resolve().parent

def read(name):
    return json.loads((root / name).read_text())

rows, windows, meta = read('state.json'), read('window-state.json'), read('verification.json')
assert [r['phase'] for r in rows] == ['baseline', 'coordinate-master-off', 'before-recovery',
                                      'restored', 'cold-restored']
prior = json.loads((root.parent / '2026-10-19-voice-navigation/state.json').read_text())[-1]
assert rows[0]['keyHashes'] == prior['keyHashes'] == meta['recovery']['keyHashes']
for group in [rows, windows]:
    for row in group:
        assert row['device'] == meta['device'] and row['pathMatchesRequestedDevice'] is True
        assert row['capturePath'] == meta['container'] == prior['capturePath']
        assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 11)
        assert row['journal'] is None and len(row['keyHashes']) == 11
for i, row in enumerate(rows):
    changed = [k for k in row['keyHashes'] if row['keyHashes'][k] != rows[0]['keyHashes'][k]]
    assert changed == (['SRS_NOTIFICATION_PREFS_V1'] if i in [1, 2] else [])
    assert row['notificationPrefs'] == ({'masterOn': False, 'morningOn': True,
        'nightOn': False, 'streakOn': True, 'achieveOn': True} if i in [1, 2] else {})
assert len(windows) == 2 and all(r['keyHashes'] == rows[0]['keyHashes'] for r in windows)
assert len(read('preflights.json')) == 2
for pre in read('preflights.json').values():
    assert pre['isolated'] is True and pre['requestedDevice'] == meta['device']
    assert pre['resolvedContainer'] == meta['container']
assert meta['windowedAppsInitiallySelected'] is True
for key in ['windowModeChanged', 'nativeMenuExposed', 'viewportChanged',
            'voiceOverActivationAccepted', 'notificationPromptObserved']:
    assert meta[key] is False
assert meta['recovery']['daily'] == {'date': '2026-10-20', 'count': 0, 'target': 5, 'newCount': 0}
text = (root / 'master-key-command.txt').read_text()
assert 'switch Description: Notificaciones, Value: 0' in text
assert 'switch Description: Recordatorio Mañana, Value: 1' in text
assert 'switch Description: Recordatorio Noche, Value: 0' in text
assert '(Booted)' not in meta['finalBooted']
assert len(meta['images']) == 4
for name, digest in meta['images'].items():
    data = (root / name).read_bytes()
    assert data.startswith(b'\xff\xd8\xff') and hashlib.sha256(data).hexdigest() == digest
    assert (root / Path(name).with_suffix('.txt')).exists()
print('PASS: two unchanged window states, bounded reminder-only mutation and all-eleven '
      'immediate/cold recovery; negative acceptance flags, two preflights/four JPEG hashes. '
      'No resized-window or VoiceOver activation acceptance inferred.')
