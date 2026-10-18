"""Create a host-only completed-today fixture for supported backup import."""
import argparse
import copy
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('original', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
base = json.loads(args.original.read_text())
assert base['kind'] == 'colombian-spanish-backup' and base['version'] == 3
assert len(base['decks']) == 48 and len(base['learningEvents']) == 11
assert sum(len(d['cards']) for d in base['decks']) == 1402
assert base['applicationState']['dailyPlan']['current']['phase'] == 'complete'
fixture = copy.deepcopy(base)
fixture['applicationState']['dailyPlan']['current']['day'] = '2026-10-18'
fixture['applicationState']['prefs'].update(themeId='barrio', appearanceMode='system', uiLanguage='en')
assert fixture['learningEvents'] == base['learningEvents']
assert not args.output.exists(), 'Use a new output path; never overwrite a backup'
args.output.write_text(json.dumps(fixture, ensure_ascii=False))
print('Created host-only fixture; only plan day and theme/language preferences changed')
