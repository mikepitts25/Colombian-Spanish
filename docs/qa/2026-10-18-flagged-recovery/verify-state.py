import json
from pathlib import Path
states = json.loads((Path(__file__).parent / 'native-state-check.json').read_text())
assert [s['phase'] for s in states] == ['before-ui', 'es-after-copy-scroll', 'en-layout', 'restored-before-cold', 'cold-restored']
base = states[0]
assert len(base['keyHashes']) == 11
for state in states:
    assert state['device'] == base['device']
    assert set(state['keyHashes']) == set(base['keyHashes'])
    expected = {'SRS_PREFS_V1'} if state['phase'] == 'en-layout' else set()
    assert {k for k,v in base['keyHashes'].items() if state['keyHashes'][k] != v} == expected
    prefs = dict(state['prefs'])
    prefs['uiLanguage'] = 'es'
    assert prefs == base['prefs']
    assert state['cardCount'] == 1392
    assert state['journal'] is None
    assert state['session'] == base['session']
    assert state['events'] == base['events']
    assert state['daily'] == base['daily']
print('Five flagged-screen snapshots verified: unchanged library/flags/learning state, temporary language-only edit, all eleven keys restored through cold launch.')
