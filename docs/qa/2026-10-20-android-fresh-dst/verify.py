"""Passive consistency checks; does not execute the UI or establish provenance."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
s = json.loads((root / 'state-summary.json').read_text())
f = s['fresh']
assert f['recordCount'] == 4 and f['eventCount'] == 0
assert f['daily'] == {'date': '2026-10-25', 'count': 0, 'target': 5, 'newCount': 0}
assert f['prefs']['themeId'] == 'classic' and f['prefs']['onboardingDone']
b = s['before-dst']
assert b['recordCount'] == 7 and b['eventCount'] == 1
assert b['daily'] == {'date': '2026-03-29', 'count': 1, 'target': 5, 'newCount': 1}
assert b['checkpoint']['queue']['cardIds'] == ['0039', '0045', '0046', '0057']
for name in ['after-dst', 'final-staged']:
    assert b == s[name]
rows = [json.loads(x) for x in (root / 'transition.jsonl').read_text().splitlines()]
assert {r['pid'] for r in rows} == {'2848'}
assert rows[-2]['device'] == '2026-03-29T01:59:59+0100'
assert rows[-1]['device'] == '2026-03-29T03:00:01+0200'
os = json.loads((root / 'restored-os.json').read_text())
assert os['airplane'] == '0' and os['autoTime'] == os['autoZone'] == '1'
assert os['zone'] == 'Europe/Berlin'
assert all(not json.loads(x)['collision'] for x in (root / 'exclusive-watch.jsonl').read_text().splitlines())
for name, digest in json.loads((root / 'sha256.json').read_text()).items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == digest, name
print('PASS: fresh state, staged spring transition, seven exact records, restoration, runtime samples and artifact digests; not broad native acceptance.')
