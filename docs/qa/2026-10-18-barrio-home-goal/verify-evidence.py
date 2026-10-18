"""Check committed native goal/read-recovery evidence; no simulator access."""
import hashlib
import json
from pathlib import Path
root = Path(__file__).resolve().parent
rows = json.loads((root/'native/native-state-check.json').read_text())
s = {r['phase']:r for r in rows}
assert len(rows) == len(s) == 12
meta = json.loads((root/'metadata.json').read_text())
assert not meta['productChanges'] and not meta['nativeChanges'] and not meta['productionJS']
assert meta['harnessServerStopped'] and meta['normalPort'] == 8099 and meta['harnessPort'] == 8100
assert hashlib.sha256((root/'native-harness.jsx').read_bytes()).hexdigest() == meta['committedHarnessSha256']
def digest(v): return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()
base=s['mini-baseline']
previous=json.loads((root.parent/'2026-10-18-barrio-home-mini-state/native/native-state-check.json').read_text())
assert base['keyHashes'] == next(r for r in previous if r['phase']=='mini-restored')['keyHashes']
for r in rows:
    assert r['device'] == meta['device'] and r['pathMatchesRequestedDevice']
    assert f"/Devices/{meta['device']}/data/Containers/Data/Application/" in r['capturePath']
    assert r['deckCount']==48 and r['cardCount']==1402 and len(r['events'])==11
    assert r['events']==base['events'] and len(r['keyHashes'])==11
    assert all(e['matchesStored'] for e in (r.get('journal') or {}).get('entries',[]))
    for f,k in [('plan','DAILY_PLAN'),('missions','MISSIONS'),('prefs','PREFS'),('daily','DAILY_PROGRESS'),('session','LAST_STUDY_SESSION'),('streak','STUDY_STREAK'),('quizHistory','QUIZ_HISTORY'),('notificationPrefs','NOTIFICATION_PREFS')]:
        assert digest(r[f])==r['keyHashes']['SRS_'+k+'_V1'],(r['phase'],f)
    assert digest({'schemaVersion':1,'events':r['events']})==r['keyHashes']['SRS_LEARNING_EVENTS_V1']
for phase in ['mini-goal-draft','mini-restored','mini-refresh-held','mini-refresh-rejected','mini-refresh-retried','mini-start-held','mini-start-rejected','mini-final-normal']:
    assert s[phase]['keyHashes']==base['keyHashes'],phase
for phase in ['mini-goal-saved-home','mini-goal-cold']:
    r=s[phase]
    assert {k for k,v in r['keyHashes'].items() if v!=base['keyHashes'][k]}=={'SRS_DAILY_PROGRESS_V1'}
    assert r['daily']==dict(base['daily'],target=10)
assert s['mini-goal-cold']['keyHashes']==s['mini-goal-saved-home']['keyHashes']
r=s['mini-start-retried'];p=r['plan']['current'];session=r['session'];q=session['queue']
assert {k for k,v in r['keyHashes'].items() if v!=base['keyHashes'][k]}=={'SRS_DAILY_PLAN_V1','SRS_LAST_STUDY_SESSION_V1'}
assert p['id']=='mve35vqs-1-st6wziw11bp' and p['id']!=base['plan']['current']['id']
assert p['day']=='2026-10-18' and p['phase']=='review' and p['minutes']==3
assert p['review']['initialCardIds']==['catchup-4','catchup-5']
assert session['deckId']=='catchup-qa' and session['cardId']=='catchup-4'
assert q=={'schemaVersion':1,'cardIds':['catchup-4','catchup-5'],'region':'all','sessionId':'mve35vqs-2-fop1yxosj04','limits':{'cardLimit':2,'newLimit':2}}
assert {k:v for k,v in p['review']['session'].items() if k!='updatedAt'}=={k:v for k,v in session.items() if k!='updatedAt'}
assert p['applied']=={'missionId':'daily-morning-greeting','contentVersion':1,'runId':'mve35vqs-3-cx7r1zqat1'}
for path in (root/'native').glob('*-preflight.json'):
    r=json.loads(path.read_text());assert r['isolated'] and r['requestedDevice']==meta['device']
    assert f"/Devices/{meta['device']}/data/" in r['resolvedContainer']
images=json.loads((root/'images.json').read_text());assert len(images)==8
assert {i['file'] for i in images}=={str(p.relative_to(root)) for p in (root/'native').glob('*.png')}
for i in images:assert hashlib.sha256((root/i['file']).read_bytes()).hexdigest()==i['sha256']
print('PASS:12 snapshots/8 images; unsaved/saved/cold goal, held/rejected/retried refresh/start, full exact retry queue, all11 original keys and11events restored. UI procedures remain observational evidence.')
