import json
from pathlib import Path
states = json.loads((Path(__file__).parent / 'native-state-check.json').read_text())
mini = states[:7]
assert [s['phase'] for s in mini] == ['before-ui', 'deck-created', 'card-saved', 'rename-saved', 'cold-with-fixture', 'fixture-removed', 'cold-restored']
base = mini[0]
assert base['deckCount'] == 47 and base['cardCount'] == 1392 and not base['qaDecks']
for i, state in enumerate(mini):
    assert state['device'] == base['device']
    assert set(state['keyHashes']) == set(base['keyHashes'])
    expected = {'SRS_DECKS_V3'} if 1 <= i <= 4 else set()
    assert {k for k, v in base['keyHashes'].items() if state['keyHashes'][k] != v} == expected
    assert state['journal'] is None
    assert state['deckCount'] == (48 if 1 <= i <= 4 else 47)
    assert state['cardCount'] == (1393 if 2 <= i <= 4 else 1392)
    if 1 <= i <= 4:
        assert len(state['qaDecks']) == 1
        assert state['qaDecks'][0]['id'] == mini[1]['qaDecks'][0]['id']
        assert state['qaDecks'][0]['name'] == ('12345' if i < 3 else '123456')
        assert len(state['qaDecks'][0]['cards']) == (0 if i == 1 else 1)
    else:
        assert not state['qaDecks']
card = mini[2]['qaDecks'][0]['cards'][0]
assert card['front'] == '12345' and card['back'] == '67890'
assert card['id'].startswith('custom-card-')
assert card['reps'] == 0 and card['interval'] == 0
assert card['due'] == card['createdAt']
assert set(card) == {'id', 'front', 'back', 'tags', 'createdAt', 'due', 'reps', 'interval', 'ease'}
assert mini[3]['qaDecks'][0]['cards'] == [card]
assert mini[4]['qaDecks'] == mini[3]['qaDecks']
assert mini[4]['keyHashes'] == mini[3]['keyHashes']
tablet = states[7:]
assert [s['phase'] for s in tablet] == ['tablet-before-ui', 'tablet-restored']
assert tablet[0]['device'] != base['device']
assert tablet[1]['device'] == tablet[0]['device']
assert set(tablet[0]['keyHashes']) == set(base['keyHashes'])
assert tablet[0]['keyHashes'] == tablet[1]['keyHashes']
assert all(s['journal'] is None for s in tablet)
assert len(base['keyHashes']) == len(tablet[0]['keyHashes']) == 11
print('Native fixture lifecycle verified: one deck, one ungraded card, retained rename/cold persistence, exact cleanup and eleven-key restoration on both simulators.')
