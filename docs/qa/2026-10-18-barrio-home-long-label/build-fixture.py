"""Derive a mini-owned long-name fixture on the host, without simulator access."""
import argparse
import copy
import json
from pathlib import Path
p = argparse.ArgumentParser(description=__doc__)
p.add_argument('original', type=Path)
p.add_argument('output', type=Path)
a = p.parse_args()
x = json.loads(a.original.read_text())
assert x['kind'] == 'colombian-spanish-backup' and x['version'] == 3
assert len(x['learningEvents']) == 11 and len(x['decks']) == 48
assert sum(len(d['cards']) for d in x['decks']) == 1402
assert x['decks'][0]['id'] == 'catchup-qa'
y = copy.deepcopy(x)
y['decks'][0]['name'] = 'Conversaciones largas para conocer el barrio y preparar un viaje por Colombia sin perder el contexto'
assert not a.output.exists(), 'Do not overwrite a backup'
a.output.write_text(json.dumps(y, ensure_ascii=False))
print('Created host-only fixture; only catchup-qa name changed')
