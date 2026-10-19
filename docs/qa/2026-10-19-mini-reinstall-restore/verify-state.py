"""Passively check archived reinstall evidence; never replay UI or installation."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
rows = json.loads((root / 'state.json').read_text())
preflights = json.loads((root / 'preflights.json').read_text())
meta = json.loads((root / 'verification.json').read_text())
install = json.loads((root / 'reinstall.json').read_text())
bundle = json.loads((root / 'bundle.json').read_text())
backup = json.loads((root / 'backup-file.json').read_text())
assert [r['phase'] for r in rows] == [
    'baseline', 'exported', 'before-replacement', 'after-replacement-install',
    'replacement-cold', 'replacement-visible', 'fresh-onboarding',
    'fresh-before-restore', 'fresh-preview', 'restored-before-cold',
    'restored-cold', 'restored-visible',
]
old, replacement, new = (install['oldContainer'], install['replacementContainer'],
                         install['freshContainer'])
assert len({old, replacement, new}) == 3
assert install['containerChanged'] is True
assert install['replacementContainerChanged'] is True
assert install['replacementContainerExistsAfterRecovery'] is False
assert install['oldContainerExistsAfterUninstall'] is False
assert install['appContainerLookupAfterUninstallExitCode'] != 0
assert install['backupSurvivesUninstall'] is True
assert len(preflights) == 9
for pre in preflights.values():
    assert pre['isolated'] is True
    assert pre['requestedDevice'] == meta['device']
    assert pre['resolvedContainer'] in {old, replacement, new}
for i, row in enumerate(rows):
    assert row['device'] == meta['device']
    assert row['pathMatchesRequestedDevice'] is True
    assert row['capturePath'] == (old if i < 3 else replacement if i < 6 else new)
    assert row['journal'] is None
    assert len(row['keyHashes']) == 11
    if i < 6 or i >= 9:
        assert row['keyHashes'] == rows[0]['keyHashes']
        assert (row['deckCount'], row['cardCount'], row['eventCount']) == (48, 1402, 11)
    else:
        assert (row['deckCount'], row['cardCount'], row['eventCount']) == (47, 1392, 0)
assert rows[7]['keyHashes'] == rows[8]['keyHashes']
assert backup['baselineRecordHashes'] == rows[0]['keyHashes']
assert backup['allPortableFieldsAndEventPayloadMatch'] is True
assert (backup['kind'], backup['version']) == ('colombian-spanish-backup', 3)
assert backup['sha256'] == install['backupSHA256AfterUninstall']
assert backup['sha256'] == install['fileSHA256AfterRecovery']
assert (backup['decks'], backup['cards'], backup['events']) == (48, 1402, 11)
assert bundle['hostCopyExact'] is True and bundle['fileCount'] == 82
assert bundle['executableSHA256'] == install['reinstalledExecutableSHA256']
assert install['microphoneValuesAfterRecovery'] == []
assert install['recordingFilesAfterRecovery'] == 0
assert meta['sameBuildReplacement'] is True
assert meta['differentVersionUpgradeTested'] is False
assert meta['rawBackupCommitted'] is False
assert meta['nativeBundleCommitted'] is False
assert len(meta['images']) == 6
for name, digest in meta['images'].items():
    data = (root / name).read_bytes()
    assert data.startswith(b'\xff\xd8\xff')
    assert hashlib.sha256(data).hexdigest() == digest
    assert (root / Path(name).with_suffix('.txt')).is_file()
print('PASS: twelve states distinguish preserved data, fresh installation and '
      'exact eleven-record recovery in a new container; nine preflights, '
      'backup/native metadata and six JPEG hashes agree. '
      'Passive artifacts do not independently replay removal or restore.')
