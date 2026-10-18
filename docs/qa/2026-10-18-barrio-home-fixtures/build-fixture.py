"""Derive host-only supported-import fixtures; never access a simulator."""
import argparse
import copy
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('original', type=Path)
parser.add_argument('kind', choices=['unavailable', 'empty', 'cap', 'long-review'])
parser.add_argument('output', type=Path)
args = parser.parse_args()
base = json.loads(args.original.read_text())
assert base['kind'] == 'colombian-spanish-backup' and base['version'] == 3
assert len(base['decks']) == 48 and len(base['learningEvents']) == 10
assert sum(len(deck['cards']) for deck in base['decks']) == 1402
fixture = copy.deepcopy(base)
a = fixture['applicationState']
a['prefs'].update(themeId='barrio', appearanceMode='light')
if args.kind == 'unavailable':
    a['dailyPlan']['current']['applied']['contentVersion'] = 99
else:
    a['lastSession'] = None
    a['missions'] = {'schemaVersion': 1, 'runs': []}
    if args.kind == 'long-review':
        plan = a['dailyPlan']['current']
        plan['phase'] = 'review'
        review = plan['review']
        review['initialCardIds'] = ['catchup-4', 'catchup-5', 'catchup-6']
        review['session']['cardId'] = 'catchup-5'
        review['session']['queue']['cardIds'] = ['catchup-5', 'catchup-6']
        review['session']['queue']['limits'] = {'cardLimit': 3, 'newLimit': 0}
        fixture['decks'][0]['name'] = (
            'Conversaciones largas para conocer el barrio y preparar un viaje por Colombia '
            'sin perder el contexto'
        )
    else:
        a['dailyPlan'] = {'schemaVersion': 1, 'current': None}
        if args.kind == 'empty':
            fixture['decks'] = []
        else:
            a['prefs']['newCardsPerDay'] = 1
            a['daily']['newCount'] = 1
            for deck in fixture['decks']:
                for card in deck['cards']:
                    card['due'] = 4102444800000
assert fixture['learningEvents'] == base['learningEvents']
assert not args.output.exists(), 'Use a new output file to avoid overwriting a backup'
args.output.write_text(json.dumps(fixture, ensure_ascii=False))
print(f'Created host fixture {args.kind}; event history unchanged')
