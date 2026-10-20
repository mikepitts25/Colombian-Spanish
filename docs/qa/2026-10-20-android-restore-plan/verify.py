"""Passive packet checks. UI provenance still requires the report/screenshots."""
from pathlib import Path
import hashlib,json
p=Path(__file__).resolve().parent
r={x['label']:x for x in json.loads((p/'state-summary.json').read_text())}
start=r['start'];prior=json.loads((p.parent/'2026-10-20-android-study-zone/state-summary.json').read_text())[-1]
assert start['hashes']==prior['hashes'] and len(start['hashes'])==9
for label in ['recovered','preview']:
 assert r[label]['hashes']==start['hashes']
for label in ['english','before-apply']:
 assert [k for k in start['hashes'] if start['hashes'][k]!=r[label]['hashes'][k]]==['SRS_PREFS_V1']
 assert r[label]['values']['SRS_PREFS_V1']==dict(start['values']['SRS_PREFS_V1'],uiLanguage='en')
restored=r['restored']
assert len(restored['hashes'])==11
assert [k for k in start['hashes'] if start['hashes'][k]!=restored['hashes'][k]]==['SRS_LEARNING_EVENTS_V1']
assert all(restored['values'][k]==v for k,v in start['values'].items())
assert restored['values']['SRS_QUIZ_HISTORY_V1']==[] and restored['values']['SRS_NOTIFICATION_PREFS_V1']=={}
assert restored['hashes']==r['restored-cold']['hashes']
assert r['applied-advanced']['hashes']==r['completed-home']['hashes']==r['completed-cold']['hashes']
for row in r.values():
 assert row['libraryCounts']==[47,1392]
 assert row['ungradedLibraryHash']==start['ungradedLibraryHash']
 assert set(row['changedCardIdsFromStart']) <= {'0057','0242'}
 assert row['values']['SRS_LEARNING_EVENTS_V1']['events'][:5]==start['values']['SRS_LEARNING_EVENTS_V1']['events']
 assert row['values']['SRS_MISSIONS_V1']['runs'][0]==start['values']['SRS_MISSIONS_V1']['runs'][0]
 plan=row['values']['SRS_DAILY_PLAN_V1']['current'];initial=start['values']['SRS_DAILY_PLAN_V1']['current']
 assert plan['id']==initial['id'] and plan['review']['initialCardIds']==initial['review']['initialCardIds']
 assert plan['applied']==initial['applied']
 if row['label'] not in ['english','before-apply']:
  assert row['hashes']['SRS_PREFS_V1']==start['hashes']['SRS_PREFS_V1']
for label,count,queue,phase in [('resumed',5,['0057','0242'],'review'),('review-one',6,['0242'],'review'),('applied-ready',7,[],'applied'),('applied-started',7,[],'applied'),('applied-feedback',8,[],'applied'),('completed-cold',8,[],'complete')]:
 row=r[label];plan=row['values']['SRS_DAILY_PLAN_V1']['current']
 assert len(row['values']['SRS_LEARNING_EVENTS_V1']['events'])==count
 assert plan['phase']==phase and plan['review']['session']['queue']['cardIds']==queue
final=r['completed-cold'];v=final['values'];events=v['SRS_LEARNING_EVENTS_V1']['events']
assert set(final['changedCardIdsFromStart'])=={'0057','0242'}
for e,c in zip(events[5:7],['0057','0242']):
 assert e['cardId']==c and e['quality']==4 and e['evidence']=='self-rated'
assert events[7]['evidence']=='answer-checked' and events[7]['outcome']=='incorrect' and events[7]['exercise']['kind']=='typed-recall'
assert v['SRS_DAILY_PROGRESS_V1']=={'date':'2026-10-20','count':2,'target':5,'newCount':2}
run=v['SRS_MISSIONS_V1']['runs'][1]
assert run['completed'] and run['assisted'] and run['nodeId']=='complete' and run['revision']==2
assert run['id']==v['SRS_DAILY_PLAN_V1']['current']['applied']['runId']==events[7]['sessionId']
assert r['applied-feedback']['values']['SRS_MISSIONS_V1']['runs'][1]['feedback']['status']=='accent'
for row in map(json.loads,(p/'runtime-inventory.jsonl').read_text().splitlines()):
 assert not row['collision'] and not row['ios'] and row['android'] in [[],['emulator-5554']]
for row in map(json.loads,(p/'os-timeline.jsonl').read_text().splitlines()):
 assert (row['zone'],row['automaticTime'],row['automaticTimeZone'],row['fontScale'])==('Europe/Berlin','1','1','1.0')
cleanup=json.loads((p/'cleanup.json').read_text())
assert cleanup['android']['stdout']=='List of devices attached'
assert not any(json.loads(cleanup['ios']['stdout'])['devices'].values())
assert cleanup['processes']=={'exit':1,'stdout':''}
for name,digest in json.loads((p/'sha256.json').read_text()).items():
 assert hashlib.sha256((p/name).read_bytes()).hexdigest()==digest,name
print('PASS: baseline continuity, bounded restore/default normalization, two grades/one assisted observation, exact completed cold recovery, resource samples and evidence digests.')
