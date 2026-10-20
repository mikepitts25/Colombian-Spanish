"""Derive bounded summaries from host-only read-only captures; never writes app storage."""
from pathlib import Path
import json,hashlib,shutil
import sys
src=Path(sys.argv[1]);out=Path(__file__).resolve().parent
def sha(v):return hashlib.sha256(v).hexdigest()
labels=['start','recovered','preview','english','before-apply','restored','restored-cold','resumed','review-one','applied-ready','applied-open','applied-started','applied-feedback','applied-advanced','completed-home','completed-cold']
base=json.loads((src/'start-raw.json').read_text());basecards={c['id']:c for d in json.loads(base['SRS_DECKS_V3']) for c in d['cards']}
rows=[]
for label in labels:
 raw=json.loads((src/(label+'-raw.json')).read_text());decks=json.loads(raw['SRS_DECKS_V3']);cards={c['id']:c for d in decks for c in d['cards']};excluded={'0057','0242'}
 ungraded=[dict(d,cards=[c for c in d['cards'] if c['id'] not in excluded]) for d in decks]
 rows.append({'label':label,'hashes':{k:sha(v.encode()) for k,v in sorted(raw.items())},'values':{k:json.loads(v) for k,v in raw.items() if k!='SRS_DECKS_V3'},'libraryCounts':[len(decks),len(cards)],'ungradedLibraryHash':sha(json.dumps(ungraded,sort_keys=True,separators=(',',':')).encode()),'selectedCards':{k:cards[k] for k in sorted(excluded)},'changedCardIdsFromStart':[k for k in cards if cards[k]!=basecards[k]]})
(out/'state-summary.json').write_text(json.dumps(rows,indent=2)+'\n')
backup=json.loads((src/'generated-backup.json').read_text());mapkeys={'dailyPlan':'SRS_DAILY_PLAN_V1','missions':'SRS_MISSIONS_V1','prefs':'SRS_PREFS_V1','daily':'SRS_DAILY_PROGRESS_V1','streak':'SRS_STUDY_STREAK_V1','seenWords':'SRS_SEEN_WORDS_V1','lastSession':'SRS_LAST_STUDY_SESSION_V1'}
assert all(backup['applicationState'][k]==json.loads(base[v]) for k,v in mapkeys.items());assert backup['decks']==json.loads(base['SRS_DECKS_V3']);assert backup['learningEvents']==json.loads(base['SRS_LEARNING_EVENTS_V1'])['events'];assert backup['applicationState']['quizHistory'] is None and backup['applicationState']['notificationPrefs'] is None
(out/'backup-check.json').write_text(json.dumps({'bytes':len((src/'generated-backup.json').read_bytes()),'sha256':sha((src/'generated-backup.json').read_bytes()),'matchedStartFields':list(mapkeys)+['decks','learningEvents'],'absentFields':['quizHistory','notificationPrefs'],'transport':'Product-generated cache file read via run-as, unchanged SDK push to dedicated Downloads; actual native document picker selected it.'},indent=2)+'\n')
for name in ['picker-current.jpg','backup-preview.jpg','english-before-restore.jpg','imported-confirmation.jpg','restored-cold-home.jpg','review-complete-handoff.jpg','applied-editorial-gate.jpg','applied-accent-feedback.jpg','applied-complete.jpg','completed-cold-home.jpg','os-timeline.jsonl','cleanup.json']:
 shutil.copyfile(src/name,out/name)
shutil.copyfile(src/'exclusive-watch.jsonl',out/'runtime-inventory.jsonl')
