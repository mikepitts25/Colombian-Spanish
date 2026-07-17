# Combined Study Browse Flow Design

## Context

The app currently exposes Browse and Study as separate bottom tabs. Browse is the discovery surface with search and categories. Study is the session surface with flashcards, region filters, progress, and grading. This makes the main path feel split: a user browses content in one tab, then studies in another.

The desired flow is one Study destination. Study should open with the Browse-style discovery content, then let the user enter the existing flashcard experience from a category, a search result, or a resume affordance.

## Decision

Use a single Study tab with two internal layers:

- **Landing layer:** search bar, categories, and a Resume Session section.
- **Session layer:** the existing Study flashcard UI, with a back control that returns to the landing layer.

Remove Browse from the bottom navigation and delete the obsolete BrowseScreen implementation once the landing behavior lives in Study.

## User Experience

The Study tab opens to a landing page:

- Title uses the Study label, not Browse.
- Search works across all loaded cards by Spanish, English, example, deck name, and tags.
- Categories use the same visible category cards as Browse.
- Resume Session appears below search/categories and shows the last study deck when available.

Starting a session:

- Tapping a category sets the first matching deck active and opens the session layer.
- Tapping a search result sets that result's deck active and opens the session layer. The tapped card should be shown first when it can be found in that deck.
- Tapping Resume Session restores the last stored deck and opens the session layer.
- The session layer includes a visible back control to return to the landing layer without leaving the Study tab.

## Architecture

Keep the change focused:

- `src/navigation/index.tsx` removes Browse from the bottom tab list and tab navigator.
- `src/screens/StudyScreen.tsx` owns the landing/session mode and reuses the existing study session UI.
- `src/storage/storage.ts` stores and loads the last study deck/card metadata for Resume Session.
- `src/i18n/translations.ts` adds Study landing and resume copy in Spanish and English.
- `__tests__/screens/StudyScreen.test.tsx` covers landing, transitions, resume, search-result starts, and existing grading behavior.
- `__tests__/navigation/RootNavigator.test.tsx` covers the updated bottom tab set.
- `src/screens/BrowseScreen.tsx` and `__tests__/screens/BrowseScreen.test.tsx` are removed because their behavior has moved into Study.

No new dependencies or new top-level routes are required.

## Data Flow

Study reads decks and `setActiveDeckId` from `useDeck()`. Landing mode flattens loaded cards for search, using the same search fields as Browse. Category selection uses the existing `getPreferredDeckForCategory()` helper.

Last session state is persisted as a small AsyncStorage record containing `deckId`, optional `cardId`, and `updatedAt`. The record is written when a session starts and after a card is graded. Resume reads the record, validates that the deck still exists, and hides the Resume Session section when there is no valid deck.

The session layer keeps the existing SRS batch behavior. If a session starts from a tapped search result, Study attempts to put that card first by moving it to the front of the current batch when present, or by prepending the matching active-deck card when absent.

## Error Handling

Loading and no-deck states remain intact. Resume state is ignored when the stored deck no longer exists. Optional card fields such as `example` and `tags` continue to be handled defensively. Search with no results shows the existing empty state copy.

## Testing

Focused tests should verify:

- Study initially renders the landing layer with search and categories.
- Browse is removed from the bottom navigation.
- Category taps open the Study session layer.
- Search result taps open the Study session layer and activate the result's deck.
- Resume Session opens the last valid deck when stored.
- The session back control returns to the Study landing layer.
- Existing Study grading behavior still records answers and daily progress.

Run the Study screen tests, navigation tests if edited, and TypeScript typecheck.
