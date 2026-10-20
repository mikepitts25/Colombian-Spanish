"""Summarize host-only read-only storage captures; does not write app storage."""
from pathlib import Path
import hashlib,json,sys,shutil
src=Path(sys.argv[1]);out=Path(__file__).resolve().parent
labels=['start','quiz-open','quiz-feedback-one','quiz-two','quiz-four','quiz-six','quiz-results','missed-open','missed-result','quiz-cold','before-editor','deck-created','blank-rejected','card-saved','renamed','renamed-cold','deck-removed','final-cold']
base=json.loads((src/'start-raw.json').read_text());ids={d['id'] for d in json.loads(base['SRS_DECKS_V3'])};rows=[]
for label in labels:
 raw=json.loads((src/(label+'-raw.json')).read_text());decks=json.loads(raw['SRS_DECKS_V3'])
 original=[d for d in decks if d['id'] in ids]
 rows.append({'label':label,'hashes':{k:hashlib.sha256(v.encode()).hexdigest() for k,v in sorted(raw.items())},'values':{k:json.loads(v) for k,v in raw.items() if k!='SRS_DECKS_V3'},'libraryCounts':[len(decks),sum(len(d['cards']) for d in decks)],'originalLibraryHash':hashlib.sha256(json.dumps(original,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'temporaryDecks':[d for d in decks if d['id'] not in ids]})
(out/'state-summary.json').write_text(json.dumps(rows,indent=2)+'\n')
for name in ['quiz-wrong-next.jpg','quiz-correct.jpg','quiz-results.jpg','missed-only.jpg','quiz-cold-history.jpg','blank-rejected.jpg','card-draft.jpg','card-saved.jpg','renamed-cold.jpg','delete-own-qa.jpg','deck-removed.jpg','final-cold-home.jpg','os-timeline.jsonl','cleanup.json']:
 shutil.copyfile(src/name,out/name)
shutil.copyfile(src/'exclusive-watch.jsonl',out/'runtime-inventory.jsonl')
