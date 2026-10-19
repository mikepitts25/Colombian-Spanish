"""Passive archived natural-boundary validation; never replays UI/storage writes."""
from pathlib import Path
from datetime import datetime
import hashlib,json,struct
root=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text())
digest=lambda v:hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()
rows=read(root/'native/native-state-check.json');meta=read(root/'verification.json')
assert [r['phase'] for r in rows]==['baseline','fixture-imported','before-midnight','waiting-midpoint','before-boundary-final','after-natural-midnight','progress-after-midnight','retained-plan-resumed','restored-before-cold','restored-cold-home']
b=rows[0];assert b['keyHashes']==read(root.parent/'2026-10-19-release-home-budget/native/native-state-check.json')[-1]['keyHashes']
assert len(b['events'])==1 and b['plan']=={'schemaVersion':1,'current':None}
plan=read(root.parent/'2026-10-19-release-home-budget/verification.json')['fixturePlan']
prefs=dict(b['prefs'],themeId='barrio');before={'date':'2026-10-18','count':1,'target':5,'newCount':1};after=dict(before,date='2026-10-19',count=0,newCount=0)
fields={'plan':'SRS_DAILY_PLAN_V1','missions':'SRS_MISSIONS_V1','prefs':'SRS_PREFS_V1','daily':'SRS_DAILY_PROGRESS_V1','streak':'SRS_STUDY_STREAK_V1','quizHistory':'SRS_QUIZ_HISTORY_V1','session':'SRS_LAST_STUDY_SESSION_V1','notificationPrefs':'SRS_NOTIFICATION_PREFS_V1','seenWords':'SRS_SEEN_WORDS_V1'}
for i,r in enumerate(rows):
 assert r['device']==meta['device'] and r['capturePath']==b['capturePath'] and r['pathMatchesRequestedDevice']
 assert '/Devices/'+r['device']+'/data/Containers/Data/Application/' in r['capturePath']
 assert r['deckCount']==47 and r['cardCount']==1392 and r['deckHash']==b['deckHash']
 assert r['events']==b['events'] and r['journal'] is None and len(r['keyHashes'])==11
 for f,k in fields.items():
  if f in r:assert digest(r[f])==r['keyHashes'][k]
 assert digest({'schemaVersion':1,'events':r['events']})==r['keyHashes']['SRS_LEARNING_EVENTS_V1']
 if 1<=i<=7:
  assert r['prefs']==prefs and r['plan']==plan
  assert r['daily']==(before if i<=4 else after)
  session=b['session']
  if i==7:
   session=dict(plan['current']['review']['session'],updatedAt=r['session']['updatedAt'])
   assert session['updatedAt']>rows[6]['session']['updatedAt']
  assert r['session']==session
  expected=dict(b['keyHashes'],SRS_PREFS_V1=digest(prefs),SRS_DAILY_PLAN_V1=digest(plan),SRS_DAILY_PROGRESS_V1=digest(r['daily']),SRS_LAST_STUDY_SESSION_V1=digest(session))
  assert r['keyHashes']==expected
 else:assert r['keyHashes']==b['keyHashes']
assert rows[1]['keyHashes']==rows[2]['keyHashes']==rows[3]['keyHashes']==rows[4]['keyHashes']
assert rows[5]['keyHashes']==rows[6]['keyHashes']
timeline=read(root/'native/midnight-timeline.json');assert len(timeline)==2
assert timeline[0]['daily']==before and timeline[1]['daily']==after
assert timeline[0]['keyHashes']==rows[4]['keyHashes'] and timeline[1]['keyHashes']==rows[5]['keyHashes']
assert datetime.fromisoformat(timeline[0]['utc'])<datetime.fromisoformat(meta['boundaryUTC'])<datetime.fromisoformat(timeline[1]['utc'])
assert timeline[1]['utc']==meta['observedUTC']
assert 0<(datetime.fromisoformat(meta['observedUTC'])-datetime.fromisoformat(meta['boundaryUTC'])).total_seconds()<60
for t in timeline:
 assert t['device']==meta['device'] and t['capturePath']==b['capturePath'] and t['journal'] is None
assert meta['samePID']==36090 and meta['normalRestoredPID']==48962
flights=list((root/'native').glob('*preflight.json'));assert len(flights)==7
for p in flights:
 f=read(p);assert f['isolated'] and f['requestedDevice']==meta['device']
 assert f['container']==f['resolvedContainer']==b['capturePath']
images=list((root/'native').glob('*.png'));assert len(images)==len(meta['imageSHA256'])==6
for p in images:
 assert hashlib.sha256(p.read_bytes()).hexdigest()==meta['imageSHA256'][p.name]
 assert struct.unpack('>II',p.read_bytes()[16:24])==(750,1334)
print('PASS:10 checkpoints,2 timeline states,7 own-path preflights,6 images; daily-only nonzero natural rollover, exact retained plan/resume delta and all11 normal-cold baseline recovery. No UI replay/live OS-zone proof.')
