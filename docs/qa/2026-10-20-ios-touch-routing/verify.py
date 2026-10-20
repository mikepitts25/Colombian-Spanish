"""Passive consistency only; no simulator actions or app writes."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent
rows=json.loads((root/'state.json').read_text())
assert [r['phase'] for r in rows]==['before-launch','launched','after-probe','restored','cold']
baseline=rows[1]
for row in rows:
 assert row['device']=='2EDF21F0-7DBD-4B09-8D5F-85560FD0E730'
 assert row['pathMatchesRequestedDevice'] and row['capturePath']==baseline['capturePath']
 assert '/Devices/'+row['device']+'/data/Containers/Data/Application/' in row['capturePath']
 assert (row['deckCount'],row['cardCount'],row['eventCount'])==(48,1402,10)
 assert len(row['keyHashes'])==11 and row['journal'] is None
delta=lambda a,b:{k for k in a['keyHashes'] if a['keyHashes'][k]!=b['keyHashes'][k]}
assert delta(rows[0],baseline)=={'SRS_DAILY_PROGRESS_V1'}
assert baseline['daily']==dict(rows[0]['daily'],date='2026-10-20')
assert delta(rows[2],baseline)=={'SRS_PREFS_V1'}
assert rows[2]['prefs']==dict(baseline['prefs'],themeId='barrio',appearanceMode='dark')
assert rows[3]['keyHashes']==rows[4]['keyHashes']==baseline['keyHashes']
trace=(root/'input-trace.txt').read_text()
assert trace.count('QA_SCROLL_BEGIN 0')==4 and trace.count('QA_SCROLL_END 0')==4
assert 'QA_TOUCH_START 182.5 323.5' in trace and 'QA_TOUCH_MOVE 182.5 53' in trace
assert 'QA_SCROLL_MOMENTUM_END 8066.5' in trace
for line in (root/'runtime-inventory.jsonl').read_text().splitlines():
 sample=json.loads(line)
 assert not sample['collision'] and not sample['android']
 assert sample['ios'] in [[],[baseline['device']]]
for name,digest in json.loads((root/'sha256.json').read_text()).items():
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,name
print('PASS: daily-only launch, preference-only probe, exact eleven-key recovery, bounded trace, exclusive runtime samples and digests.')
