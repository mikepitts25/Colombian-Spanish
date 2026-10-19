"""Check requirement-index coverage, not requirement completion."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parent
repo = root.parents[2]
index = json.loads((root / 'open-items.json').read_text())
current = {}
for line in (repo / 'MASTER_PLAN.md').read_text().splitlines():
    match = re.match(r'\s*- \[ \] \*\*(B[0-9][^ ]*) \[([^]]+)\]\*\* (.*)', line)
    if match:
        identifier, tags, text = match.groups()
        assert identifier not in current, identifier
        current[identifier] = {'tags': tags.split(', '), 'text': text}
assert index['schemaVersion'] == 1
assert len(current) == len(index['openItems']) == 127
assert len(index['groups']) == 29
groups = {}
owners = {}
for group in index['groups']:
    assert group['id'] not in groups
    groups[group['id']] = group
    assert group['classification'] and group['aiCanDoNow'] and group['requires']
    assert group['evidenceFiles']
    for evidence in group['evidenceFiles']:
        assert (repo / evidence).exists(), evidence
    for identifier in group['taskIds']:
        assert identifier not in owners, identifier
        owners[identifier] = group['id']
seen = set()
for item in index['openItems']:
    identifier = item['id']
    assert identifier not in seen
    seen.add(identifier)
    assert item['tags'] == current[identifier]['tags']
    assert item['text'] == current[identifier]['text']
    assert item['group'] == owners[identifier]
assert seen == set(owners) == set(current)
assert groups['security-skipped']['classification'] == 'owner-skipped'
assert groups['store-assets']['classification'] == 'ai-now'
print('PASS: all 127 unchecked requirements mapped once into 29 groups; text/tags and local references match. Classification is not completion proof.')
