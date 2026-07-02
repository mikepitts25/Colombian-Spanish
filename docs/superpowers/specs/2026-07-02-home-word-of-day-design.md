# Home Word Of Day Design

## Context

Browse currently owns a "Words of the Day" section that renders up to five slang or Colombianism cards. The Browse screen is now category-first, so this list adds a second content feed below categories and weakens the screen's purpose.

Home is the better place for a single daily discovery prompt because it is the app's starting point and already summarizes today's learning state.

## Decision

Move Words of the Day out of Browse and add one Word of the Day card to Home.

- Browse should no longer render the Words of the Day section.
- Home should render one Word of the Day card below the Today card and above Tools.
- The word should come from the same source logic Browse uses today: loaded cards whose tags or deck name match slang, jerga, coloquial, or Colombia.
- The card should show the Spanish word, English meaning, deck name, and a pronunciation button.
- The pronunciation button should call the existing `speakCard` service.
- If there is no matching word, Home should omit the card rather than render an empty state.

## User Experience

Home should keep its current learning hierarchy:

1. Greeting and profile entry.
2. Today card with due count, streak, daily goal, and primary study action.
3. One Word of the Day discovery card.
4. Tools.
5. Due decks.

The Word of the Day card should feel like a compact learning prompt, not a second dashboard. It should use the app's existing dark surface styling, Colombian accent colors, and the same audio affordance used in Browse rows.

## Architecture

Keep the change in existing screen files:

- `src/screens/HomeScreen.tsx` derives the one matching word from loaded decks and renders the new card.
- `src/screens/BrowseScreen.tsx` removes the old Words of the Day derivation, JSX, and unused styles.
- `src/i18n/translations.ts` adds Home labels for the new card title.
- Existing screen tests cover the new Home card and the absence of the Browse section.

No new routes, persisted state, shared store, or deck mutations are required.

## Data Flow

Home already reads loaded decks from `useDeck()`. It should flatten deck cards into rows with deck name, filter rows to slang/Colombianism matches, and select the first match. This mirrors the previous Browse behavior and avoids new randomness or date-based persistence.

Pressing the audio button should call `speakCard(word.card)`. Pressing the card itself does not need to navigate anywhere.

## Error Handling

If decks are not ready, Home keeps its existing loading state. If no matching slang/Colombianism cards exist, the Word of the Day card is not rendered. Optional card fields such as `tags` and `example` must be handled defensively.

## Testing

Update focused tests to verify:

- Home renders exactly one Word of the Day card when a matching word exists.
- Home does not render the card when no matching word exists.
- Pressing the Home audio button calls `speakCard` with the selected card.
- Browse no longer renders Words of the Day in browse mode.
- Browse search and categories continue to work.

Run the Home and Browse screen test files, then run typecheck.

## Scope

This does not change card content, add daily rotation persistence, redesign Home, add a word detail screen, or alter study/SRS behavior. It is a focused move from a Browse list to one Home card.
