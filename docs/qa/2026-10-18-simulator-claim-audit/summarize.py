"""Summarize saved probes and find affected reports; no simulator access."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
before = {r['device']: r for r in json.loads((HERE / 'before.json').read_text())['devices']}
probes = [json.loads(p.read_text()) for p in (HERE / 'probes').glob('*.json')]
known = json.loads((HERE / 'known-aliases.json').read_text())
rows = []
for probe in probes + known:
    row = {'device': probe['device'], 'name': before[probe['device']]['name'],
           'status': probe['status'], 'origin': probe.get('origin', 'this audit; read-only lookup'),
           'reportedContainer': probe.get('reportedContainer'),
           'evidence': probe.get('evidence', str((HERE / 'probes' / (probe['device'] + '.json')).relative_to(ROOT)))}
    if row['reportedContainer']:
        row['reportedDataDevice'] = Path(row['reportedContainer']).parts[-6]
    rows.append(row)
rows.sort(key=lambda r: r['device'])
assert len(rows) == len(before) == len({r['device'] for r in rows})
(HERE / 'mapping-summary.json').write_text(json.dumps(rows, indent=2) + '\n')
aliases = {r['device']: r for r in rows if r['status'] == 'foreign-or-invalid-path'}
refs = json.loads((HERE / 'historical-references.json').read_text())
files = sorted({f for r in refs if r['device'] in aliases for f in r['reports']})
actions = []
for file in files:
    matched = [r for r in aliases.values() if r['device'] in (ROOT / file).read_text()]
    action = 'provenance notice added'
    if file.endswith('2026-10-18-simulator-isolation/REPORT.md'):
        action = 'already explicitly documents aliases; linked from audit'
    elif file.endswith('2026-10-17-braces-depth/REPORT.md'):
        action = 'metadata reference indexed only; security report not edited'
    actions.append({'report': file, 'aliases': [r['device'] for r in matched], 'action': action})
(HERE / 'report-actions.json').write_text(json.dumps(actions, indent=2) + '\n')
print(len(rows), 'device dispositions;', len(files), 'referencing reports')
