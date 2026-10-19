"""Passive archived maximum-text evidence checks; no UI replay or app writes."""
from pathlib import Path
import hashlib,json,struct
root=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text())
digest=lambda v:hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()
rows=read(root/'native/native-state-check.json');meta=read(root/'verification.json');b=rows[0]
assert [r['phase'] for r in rows]==['baseline','baseline-cold','fixture-imported','fixture-cold-max-en-light','en-light-max-covered','en-dark-max-covered','incidental-ungraded-study','captured-drag-opened-study','restored-before-cold','restored-cold']
old=read(root.parent/'2026-10-18-barrio-home-phone-label/native/native-state-check.json')[-1]
assert {k for k in b['keyHashes'] if b['keyHashes'][k]!=old['keyHashes'][k]}=={'SRS_DAILY_PROGRESS_V1'}
assert b['daily']==dict(old['daily'],date='2026-10-19')
fields={'plan':'SRS_DAILY_PLAN_V1','missions':'SRS_MISSIONS_V1','prefs':'SRS_PREFS_V1','session':'SRS_LAST_STUDY_SESSION_V1','daily':'SRS_DAILY_PROGRESS_V1','streak':'SRS_STUDY_STREAK_V1','quizHistory':'SRS_QUIZ_HISTORY_V1','notificationPrefs':'SRS_NOTIFICATION_PREFS_V1'}
for i,r in enumerate(rows):
 assert r['device']==meta['device'] and r['capturePath']==b['capturePath'] and r['pathMatchesRequestedDevice']
 assert '/Devices/'+meta['device']+'/data/Containers/Data/Application/' in r['capturePath']
 assert r['deckCount']==48 and r['cardCount']==1402 and len(r['events'])==10
 assert r['events']==b['events'] and r['plan']==b['plan'] and r['missions']==b['missions']
 assert r['journal'] is None and len(r['keyHashes'])==11
 for f,k in fields.items():assert digest(r[f])==r['keyHashes'][k]
 assert digest({'schemaVersion':1,'events':r['events']})==r['keyHashes']['SRS_LEARNING_EVENTS_V1']
 expected=dict(b['keyHashes'])
 if 2<=i<=7:
  prefs=dict(b['prefs'],themeId='barrio',appearanceMode='light' if i<=4 else 'dark',uiLanguage='en' if i<=5 else 'es')
  expected.update(SRS_PREFS_V1=digest(prefs),SRS_DECKS_V3=meta['fixtureDeckCanonicalSHA256'])
  assert r['prefs']==prefs and r['deckHash']==rows[2]['deckHash']
  if i>=6:
   s=r['session'];assert s['deckId']=='catchup-qa' and s['cardId']=='catchup-4'
   assert s['queue']=={'schemaVersion':1,'cardIds':[f'catchup-{j}' for j in range(4,10)],'region':'all','sessionId':s['queue']['sessionId']}
   assert s['queue']['sessionId']!=b['session']['queue']['sessionId']
   assert s['updatedAt']>rows[i-1]['session']['updatedAt']
   expected['SRS_LAST_STUDY_SESSION_V1']=digest(s)
  else:assert r['session']==b['session']
 else:assert r['deckHash']==b['deckHash']
 assert r['keyHashes']==expected
assert rows[1]['keyHashes']==b['keyHashes']==rows[-1]['keyHashes']==rows[-2]['keyHashes']
assert rows[2]['keyHashes']==rows[3]['keyHashes']==rows[4]['keyHashes']
assert rows[6]['session']['queue']['sessionId']!=rows[7]['session']['queue']['sessionId']
assert len(meta['title'])==100 and meta['nativeTextSizeForAcceptedViews']==11
assert not meta['productionJS'] and not meta['nativeChanges'] and not meta['spanishMaximumCountsComplete']
assert {(c['language'],c['appearance']) for c in meta['acceptedCells']}=={('en','light'),('en','dark')}
images=list((root/'native').glob('*.png'));assert len(images)==len(meta['imageSHA256'])==11
for p in images:
 assert hashlib.sha256(p.read_bytes()).hexdigest()==meta['imageSHA256'][p.name]
 assert struct.unpack('>II',p.read_bytes()[16:24])==(750,1334)
for c in meta['acceptedCells']:
 assert len(c['images'])==4 and all(n in meta['imageSHA256'] for n in c['images'])
flights=list((root/'native').glob('*preflight.json'));assert len(flights)==7
for p in flights:
 f=read(p);assert f['isolated'] and f['requestedDevice']==meta['device']
 assert f['container']==f['resolvedContainer']==b['capturePath']
print('PASS:10 checkpoints,7 own-path preflights,11 PNGs; exact title/prefs-only English fixture, two recorded ungraded session deltas, all11 baseline recovery. English maximum views accepted visually; Spanish counts/touch remain open. No UI replay.')
