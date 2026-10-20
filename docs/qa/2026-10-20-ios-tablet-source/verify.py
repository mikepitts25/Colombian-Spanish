from pathlib import Path
import json,hashlib
p=Path(__file__).resolve().parent
s=json.loads((p/'checkpoints.json').read_text())
o=json.loads((p/'observations.json').read_text())
for name,meta in json.loads((p/'artifacts.json').read_text()).items():
 f=p/name
 assert f.stat().st_size==meta['bytes'] and hashlib.sha256(f.read_bytes()).hexdigest()==meta['sha256'],name
for c in s.values():
 assert c['recordCount']==len(c['hashes'])==11 and c['journal'] is None
base=s['source-before-launch']['hashes']
for k in o['sourceRawExactCheckpoints']:assert s[k]['hashes']==base,k
for k in o['tabletRawExactRecovery']:assert s[k]['hashes']==s['tablet-baseline']['hashes'],k
assert {k for k in s['tablet-imported']['hashes'] if s['tablet-imported']['hashes'][k]!=s['tablet-draft']['hashes'][k]}=={'SRS_MISSIONS_V1'}
assert s['tablet-imported']['hashes']['SRS_LEARNING_EVENTS_V1']==s['tablet-baseline']['hashes']['SRS_LEARNING_EVENTS_V1']
assert s['source-before-launch']['eventCount']==10
assert s['tablet-draft']['eventCount']==11 and s['tablet-draft']['daily']['count']==0
assert s['tablet-draft']['session']==s['source-before-launch']['session']
assert s['source-before-launch']['container']!=s['tablet-baseline']['container']
assert o['interruption']['ownStopped']
assert len(list(p.glob('*.png')))==7
print('PASS: recorded source cold eleven hashes, mission-only draft delta, original tablet eleven-hash cold recovery and artifact integrity; not a native rerun or broad parent pass')
