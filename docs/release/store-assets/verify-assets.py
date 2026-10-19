"""Passive draft asset validation; no simulator actions or publication."""
from pathlib import Path
import hashlib,json,subprocess
root=Path(__file__).resolve().parent
m=json.loads((root/'requirements.json').read_text());assets=m['assets']
assert len(assets)==12 and not m['storefrontLocalizationsSelected']
assert not m['submissionOrPublicationAuthorized']
seen=set()
for a in assets:
 p=root/a['file'];assert p.is_file() and p.suffix=='.jpg'
 assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256']
 info=subprocess.check_output(['sips','-g','pixelWidth','-g','pixelHeight','-g','format','-g','hasAlpha',str(p)],text=True)
 for key,value in [('pixelWidth',a['size'][0]),('pixelHeight',a['size'][1]),('format','jpeg'),('hasAlpha','no')]:assert f'{key}: {value}' in info
 slot=0 if p.name.startswith('phone-') else 1
 assert a['size'] in m['slots'][slot]['portraitSizes']
 assert a['candidate']=='unsigned-local-Release' and a['os']=='26.0'
 assert a['productSource']=='2b6665db5e79379c8cb7dc0d2567a24c9ed1eb38'
 assert a['visualReview']=='inspected-actual-app-viewport'
 key=(slot,a['language'],a['theme'],a['view']);assert key not in seen;seen.add(key)
for slot in (0,1):
 for lang in ('en','es'):
  for theme,view in [('classic','home'),('classic','study'),('barrio','home')]:assert (slot,lang,theme,view) in seen
for p in (root/'2026-10-19').glob('*preflight.json'):
 f=json.loads(p.read_text());assert f['isolated'] and f['container']==f['resolvedContainer']
 assert f['requestedDevice'] in {'D64F6521-8EE6-47B8-86FB-A935306D0E47','CAE2C851-1943-46F9-9DF6-89A241C9CAEE'}
assert len(list((root/'2026-10-19').glob('*preflight.json')))==4
print('PASS:12 actual JPEG drafts, accepted measured dimensions/no alpha, hashes, bilingual phone/tablet coverage and4 own-path preflights. No signed/submission acceptance.')
