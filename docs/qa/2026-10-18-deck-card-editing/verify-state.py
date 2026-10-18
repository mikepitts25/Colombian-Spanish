import json
from pathlib import Path
states = json.loads((Path(__file__).parent / 'native-state-check.json').read_text())
assert [s['phase'] for s in states] == ['before-ui', 'after-draft-layout', 'english-layout', 'restored-before-cold', 'cold-restored']
base = states[0]
for state in states:
    expected = {'SRS_PREFS_V1'} if state['phase'] == 'english-layout' else set()
    changed = {key for key, value in base['keyHashes'].items() if state['keyHashes'][key] != value}
    assert changed == expected, (state['phase'], changed)
    prefs = dict(state['prefs'])
    prefs['uiLanguage'] = 'es'
    assert prefs == base['prefs']
    assert state['journal'] is None
    assert state['cardCount'] == 1392
    assert state['session'] == base['session']
    assert state['events'] == base['events']
    assert state['daily'] == base['daily']
assert len(base['keyHashes']) == 11
print('Five snapshots verified: only temporary UI language changed; all eleven logical hashes restored through cold launch, with exact queue and no added credit.')
