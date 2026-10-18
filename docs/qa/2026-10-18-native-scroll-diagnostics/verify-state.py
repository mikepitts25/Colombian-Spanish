"""Passive saved-evidence checks; no live simulator or launch behavior."""
import json
from pathlib import Path
folder=Path(__file__).parent
rows=json.loads((folder/'native-state-check.json').read_text())
assert [r['phase'] for r in rows]==['before','diagnostic','normal-resumed','final-cold']
base,diag,normal,cold=rows
session_key='SRS_LAST_STUDY_SESSION_V1'
assert len(base['keyHashes'])==11
for row in rows:
 assert row['device']==base['device']=='5E9A8854-135A-4675-A437-4EFCA043F656'
 assert row['pathMatchesRequestedDevice'] is True
 assert row['capturePath']==base['capturePath']
 assert f"/Devices/{row['device']}/data/Containers/Data/Application/" in row['capturePath']
 assert row['journal'] is None
 assert set(row['keyHashes'])==set(base['keyHashes'])
 assert {k for k,v in base['keyHashes'].items() if row['keyHashes'][k]!=v} == (set() if row is base else {session_key})
 assert {k:v for k,v in row['session'].items() if k!='updatedAt'}=={k:v for k,v in base['session'].items() if k!='updatedAt'}
 for field in ['events','daily','prefs','streak','plan','missions','quizHistory','notificationPrefs','flaggedCards','deckHash']:
  assert row[field]==base[field]
 assert row['deckCount']==48 and row['cardCount']==1402
assert base['session']['queue']['cardIds']==['catchup-7','catchup-8','catchup-9']
assert base['session']['updatedAt'] < diag['session']['updatedAt'] < normal['session']['updatedAt']
assert normal['keyHashes']==cold['keyHashes']
preflights=list(folder.glob('*preflight.json'))
assert len(preflights)==8
for p in preflights:
 result=json.loads(p.read_text())
 assert result['isolated'] is True
 assert result['requestedDevice']==base['device']
 assert result['container']==base['capturePath']
metrics=json.loads((folder/'observed-metrics.json').read_text())
assert len(metrics)==6
assert metrics[2]['offset']==metrics[1]['offset']
assert metrics[3]['offset']==metrics[4]['offset']
assert metrics[3]['offset']['y'] > 1500
native=metrics[-1]
assert native['content']==[native['drag']['content']['width'],native['drag']['content']['height']]==[375,1892]
assert native['viewport']['height']==native['drag']['viewport']['height']==335
assert native['drag']['offset']=={'x':0,'y':0}
boot={r['device']:r['state'] for r in json.loads((folder/'final-devices.json').read_text())}
assert boot=={base['device']:'Shutdown','DABA2821-3619-4F4A-B0C3-54E70B31511F':'Booted','E66076BE-D9F8-49FB-870F-F29B57C4CA40':'Booted'}
print('PASS: ten exact records, queue identity with Continue timestamps only, normal cold persistence, own paths; recorded native extent matches layout')
