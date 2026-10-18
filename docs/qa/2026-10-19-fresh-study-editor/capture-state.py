"""Read-only live capture: PHASE UUID HOST_OUTPUT_JSON. Never edits app data."""
from pathlib import Path
import sys,contextlib,io,subprocess
phase,uuid=sys.argv[1:3]
p=Path(__file__).resolve().parent.parent/'2026-10-18-barrio-home/native/capture-state.py'
s=p.read_text()
extra="""
baselineCards=json.loads(pathlib.Path(BASELINE_PATH).read_text())
r['taskCards']={c['id']:c for d in decks if d['id']=='catchup-qa' for c in d['cards'] if c['id'] in baselineCards}
r['deckNames']=[{'id':d['id'],'name':d['name'],'cardCount':len(d['cards'])} for d in decks]
normalized=json.loads(json.dumps(decks))
for d in normalized:
 if d['id']=='catchup-qa':d['cards']=[baselineCards.get(c['id'],c) for c in d['cards']]
r['taskCardNormalizedDeckHash']=digest(normalized)
"""
extra=extra.replace('BASELINE_PATH',repr(str(Path(__file__).with_name('fixture-card-baseline.json'))))
s=s.replace("o=pathlib.Path(__file__).with_name('native-state-check.json')",extra+"\no=pathlib.Path("+repr(str(Path(sys.argv[3]).resolve()))+")")
sys.argv=[str(p),phase,uuid]
with contextlib.redirect_stdout(io.StringIO()):exec(compile(s,str(p),'exec'),{'__file__':str(p),'__name__':'__main__'})
print('Captured '+phase+' '+uuid)
