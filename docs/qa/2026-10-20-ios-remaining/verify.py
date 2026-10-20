"""Validate routing references only. This is not a completion or native-UI test."""
from pathlib import Path
import json
import re

p = Path(__file__).resolve().parent
root = p.parents[2]
d = json.loads((p / 'cases.json').read_text())
index = json.loads((root / 'docs/qa/2026-10-19-actionability/open-items.json').read_text())
master = (root / 'MASTER_PLAN.md').read_text()
open_ids = {r['id'] for r in index['openItems']}
checked_ids = set(re.findall(r'- \[x\] \*\*([^ *]+)', master))
assert len(d['cases']) == 9
ids = {c['id'] for c in d['cases']}
assert len(ids) == 9
assert sum(c['status'] == 'completed-bounded' for c in d['cases']) == 2
assert sum(c['status'].startswith('tool-limited') for c in d['cases']) == 6
for case in d['cases']:
    assert set(case['requirements']) <= open_ids, case['id']
    assert case['nextAction'] and case['dependency']
    assert set(case['packages']) <= {1, 2, 3, 4, 5}
    for ref in case['evidence']:
        assert (root / ref).is_file(), ref
names = {'native-source-and-queue', 'calendar-native', 'exercise-native', 'whole-plan-native', 'mission-native', 'visual-and-home', 'voice-native', 'tablet-and-lifecycle', 'touch-route'}
expected = {r['id']: r['group'] for r in index['openItems'] if r['group'] in names}
routes = d['openRequirementRoutes']
assert len(routes) == len(expected) == 43
assert len({r['requirement'] for r in routes}) == 43
assert {r['requirement']: r['group'] for r in routes} == expected
for row in routes:
    assert row['caseIds'] and set(row['caseIds']) <= ids
for ref in re.findall(r'\]\(([^)]+)\)', (p / 'README.md').read_text()):
    if '://' not in ref:
        assert (p / ref.split('#')[0]).is_file(), ref
reuse = {'B05.3-B2b2-B2g', 'B08.5-B8g', 'B08.5-B8h', 'B08.5-B8i', 'B08.5-B8j', 'B08.5-B8k', 'B12.6-I', 'B12.6-J', 'B12.6-K', 'B12.6-L'}
assert reuse <= checked_ids
prep = json.loads((p / 'preparation.json').read_text())
assert prep['sourceRecords'] == len(prep['sourceBeforeAndAfterExportHashes']) == 11
assert (prep['sourceDecks'], prep['sourceCards'], prep['sourceEvents']) == (48, 1402, 10)
assert prep['export']['version'] == 3 and prep['export']['eventCount'] == 10
assert prep['interruption']['ownStopped']
assert prep['interruption']['other'] == ['C100803B-D3D6-48B3-9615-7F74673A590D']
assert prep['tabletAppLaunched'] and prep['tabletDataCaptured']
assert prep['sourceColdAfterTabletMutationProved']
print('PASS: nine known iOS case groups route all43 existing local rows, references/reuse IDs match, two bounded cases completed and seven groups remain. No native or parent completion proof.')
