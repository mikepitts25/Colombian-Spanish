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
for c in s.values():assert c['hashes']==s['baseline']['hashes'] and c['eventCount']==2 and c['daily']['count']==0
for phase,size in [('invalid-json',8),('oversized-bytes',20000001)]:
 g=json.loads((p/(phase+'-restored.json')).read_text())
 assert g['stagedBytes']==size and g['restoredBytes']==g['originalBytes']==372359
 assert g['restoredSha256']==g['originalSha256']=='ee68474574cda36eda5ef735a658474ad099c3cebe28561856878c1c06ce6fae'
 assert g['restoredMode']==g['originalMode']
assert 'Respaldo inválido' in (p/'invalid-error.txt').read_text()
assert 'Archivo de respaldo demasiado grande' in (p/'oversized-error.txt').read_text()
assert 'No se cambió ningún dato' in (p/'oversized-error.txt').read_text()
assert '12:28:30.772Z' in (p/'valid-preview.txt').read_text()
assert o['initialPid']!=o['finalColdPid'] and o['acceptedOversizeAttempt']==2
assert o['validPreview']['action']=='Cancel; no import'
assert len(list(p.glob('*.png')))==6
print('PASS: recorded native error messages, guard document recovery, six eleven-hash checkpoints/cold and artifact integrity; not a native rerun or broader B12.6 pass')
