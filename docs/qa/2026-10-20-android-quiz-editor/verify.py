"""Passive assertions; screenshot/action provenance requires human or agent review."""
from pathlib import Path
import json,hashlib
p=Path(__file__).resolve().parent
rows={r['label']:r for r in json.loads((p/'state-summary.json').read_text())}
a=rows['start'];prior=json.loads((p.parent/'2026-10-20-android-restore-plan/state-summary.json').read_text())[-1]
assert a['hashes']==prior['hashes'] and len(a['hashes'])==11
for r in rows.values():
 assert len(r['hashes'])==11 and r['originalLibraryHash']==a['originalLibraryHash']
 for k,v in a['hashes'].items():
  if k not in ['SRS_DECKS_V3','SRS_LEARNING_EVENTS_V1','SRS_QUIZ_HISTORY_V1']:assert r['hashes'][k]==v,k
 assert r['values']['SRS_LEARNING_EVENTS_V1']['events'][:8]==a['values']['SRS_LEARNING_EVENTS_V1']['events']
assert rows['quiz-open']['hashes']==a['hashes']
for label,count in [('quiz-feedback-one',9),('quiz-two',10),('quiz-four',12),('quiz-six',14),('quiz-results',14),('missed-open',14),('missed-result',15)]:
 assert len(rows[label]['values']['SRS_LEARNING_EVENTS_V1']['events'])==count
history=rows['quiz-results']['values']['SRS_QUIZ_HISTORY_V1']
assert len(history)==1 and (history[0]['score'],history[0]['total'],history[0]['missedCardIds'])==(5,6,['0039'])
assert rows['missed-open']['hashes']==rows['quiz-results']['hashes']
b=rows['missed-result'];h=b['values']['SRS_QUIZ_HISTORY_V1'];assert len(h)==2 and h[1]==history[0]
assert (h[0]['score'],h[0]['total'],h[0]['missedCardIds'])==(1,1,[])
e=b['values']['SRS_LEARNING_EVENTS_V1']['events'][8:]
assert [x['cardId'] for x in e]==['0039','0038','0046','0045','0242','0057','0039']
assert [x['outcome'] for x in e]==['incorrect']+['correct']*6
assert all(x['evidence']=='answer-checked' and x['modality']=='recognition' for x in e)
assert [x['sessionId'] for x in e]==[h[1]['id']]*6+[h[0]['id']]
assert rows['quiz-cold']['hashes']==b['hashes']==rows['before-editor']['hashes']
assert rows['blank-rejected']['hashes']==rows['deck-created']['hashes']
d=rows['deck-created']['temporaryDecks'];assert len(d)==1 and d[0]['name']=='Qa' and d[0]['cards']==[]
s=rows['card-saved']['temporaryDecks'];assert len(s)==1 and s[0]['id']==d[0]['id'] and len(s[0]['cards'])==1
c=s[0]['cards'][0];assert c['front']=='Uno' and c['back']=='One' and c['reps']==0 and c['interval']==0 and c['tags']==[]
n=rows['renamed']['temporaryDecks'];assert n==[dict(s[0],name='Qaq')]
assert rows['renamed-cold']['hashes']==rows['renamed']['hashes']
for label in ['deck-created','blank-rejected','card-saved','renamed','renamed-cold']:
 assert all(rows[label]['hashes'][k]==b['hashes'][k] for k in b['hashes'] if k!='SRS_DECKS_V3')
for label in ['deck-removed','final-cold']:
 assert rows[label]['hashes']==b['hashes'] and rows[label]['libraryCounts']==[47,1392] and not rows[label]['temporaryDecks']
for r in map(json.loads,(p/'runtime-inventory.jsonl').read_text().splitlines()):assert not r['collision'] and not r['ios'] and r['android'] in [[],['emulator-5554']]
for r in map(json.loads,(p/'os-timeline.jsonl').read_text().splitlines()):assert (r['zone'],r['automaticTime'],r['automaticTimeZone'],r['fontScale'])==('Europe/Berlin','1','1','1.0')
clean=json.loads((p/'cleanup.json').read_text());assert clean['android']['stdout']=='List of devices attached' and not any(json.loads(clean['ios']['stdout'])['devices'].values()) and clean['processes']=={'exit':1,'stdout':''}
for name,digest in json.loads((p/'sha256.json').read_text()).items():assert hashlib.sha256((p/name).read_bytes()).hexdigest()==digest,name
print('PASS: baseline continuity, seven recognition observations/two results, exact quiz cold, QA-only editor changes and exact cleanup/cold, inventories and digests.')
