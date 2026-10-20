from pathlib import Path
import json,hashlib,shutil
src=Path('/tmp/colombian-android-study-home');out=Path('docs/qa/2026-10-20-android-study-zone');out.mkdir(exist_ok=True)
for name in ['home-max-primary-touch.jpg','home-max-primary-open.jpg','study-max-all-intervals.jpg','study-max-hard-touch.jpg','home-max-lower-tools-touch.jpg','home-favorites-route.jpg','zone-positive-berlin-home.jpg','zone-positive-fixed-anchorage-home.jpg','final-cold-home.jpg']:
 shutil.copyfile(src/name,out/name)
for name,dest in [('greeting-red.log','greeting-red.txt'),('reminder-red.log','reminder-red.txt'),('zone-green.log','focused-green.txt'),('typecheck.log','typecheck.txt'),('lint.log','lint.txt'),('calendar.log','calendar-zones.txt'),('exclusive-watch.jsonl','runtime-inventory.jsonl'),('os-timeline.jsonl','os-timeline.jsonl'),('native-clock-diagnostic.json','native-clock-diagnostic.json'),('host-control-crash.json','host-control-crash.json')]:shutil.copyfile(src/name,out/dest)
s=(src/'zone-red.log').read_text();s=s[s.index('FAIL __tests__/utils/calendarDay.test.ts'):s.index('Test Suites:')];(out/'calendar-word-red.txt').write_text('Calendar/word excerpts from the initial RED run. Corrected Home RED is separate.\n'+s)
labels=['start','plan','again','graded','anchorage','fixed-live','positive','fixed-boundary','restored','cold'];rows=[]; originals=None
for label in labels:
 raw=json.loads((src/(label+'-raw.json')).read_text());decks=json.loads(raw['SRS_DECKS_V3'])
 if originals is None:originals=decks
 cards={c['id']:c for d in decks for c in d['cards']}
 row={'label':label,'hashes':{k:hashlib.sha256(v.encode()).hexdigest() for k,v in sorted(raw.items())},'values':{k:json.loads(v) for k,v in raw.items() if k!='SRS_DECKS_V3'},'selectedCards':{k:cards[k] for k in ['0039','0045','0046']}}
 original_by_id={c['id']:c for d in originals for c in d['cards']}
 row['changedCardIdsFromStart']=[k for k,v in cards.items() if original_by_id[k]!=v]
 row['ungradedLibraryHash']=hashlib.sha256(json.dumps([{**d,'cards':[c for c in d['cards'] if c['id'] not in ['0039','0045','0046']]} for d in decks],sort_keys=True,separators=(',',':')).encode()).hexdigest()
 row['libraryCounts']={'decks':len(decks),'cards':sum(len(d['cards']) for d in decks)}
 rows.append(row)
(out/'state-summary.json').write_text(json.dumps(rows,indent=2)+'\n')
