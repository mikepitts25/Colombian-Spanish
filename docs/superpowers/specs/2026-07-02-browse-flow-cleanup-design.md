# Browse Flow Cleanup Design

## Context

The current Browse screen is visually busy and its controls do not match the intended flow. The bottom navigation places Study before Browse, but the desired flow is to browse available content before starting study. Browse also shows two rows of filter chips below search. Those chips consume prime space, are not useful enough for the screen's main job, and make the categories feel secondary.

The screen defines 14 category buckets, but only renders 6 cards. The current app data maps at least one loaded deck into every defined bucket, so the missing categories are a display problem rather than deleted content.

## Decision

Use a simplified Browse-first flow:

- Swap Browse and Study in the bottom tab order, so the tabs read Home, Browse, Study, Progress, Settings.
- Remove the Browse filter pill from the header and the two horizontal filter rows below search.
- Keep the search bar, but make search operate across all loaded cards without deck-type or region filters.
- Render all non-empty category buckets from the loaded decks, not a hardcoded subset of six.
- Keep category cards as the primary browse surface and preserve the existing press behavior: selecting a category activates the first matching deck and navigates to Study.
- Keep Words of the Day below categories, using all loaded slang/Colombianism cards rather than a region-filtered subset.

This is preferred over keeping hidden filter state because invisible filters would make search and Words of the Day harder to reason about. It is also preferred over a separate "all categories" drill-in because Browse should expose the full content map directly.

## User Experience

Browse should open with a clear hierarchy: title, search, categories, then Words of the Day. Removing the filters should make the first viewport less cramped and make category selection the obvious path into study.

The category grid should include every non-empty bucket currently represented in the deck data:

- Colombianisms
- Essentials
- People & Relationships
- Places & Travel
- Home & Daily Life
- Food & Drink
- Communication
- Health
- Nature
- Work & School
- Numbers & Time
- Fun & Culture
- Tech
- Other

The category header can keep a simple "Categories" label. The old "See all" affordance should be removed because all categories are already shown.

## Architecture

Keep the change focused on existing files:

- `src/navigation/index.tsx` owns the bottom tab order and tab metadata.
- `src/screens/BrowseScreen.tsx` owns the category definitions, category-to-deck mapping, search results, Words of the Day, and browse layout.
- `src/i18n/translations.ts` supplies any missing category labels in Spanish and English.
- `__tests__/screens/BrowseScreen.test.tsx` should be updated to reflect the simpler Browse behavior.

No new routes, data models, persistence, or deck mutations are required.

## Data Flow

Browse reads loaded decks from `useDeck()` as it does today. The screen flattens cards for search and Words of the Day. Search results should match the query across front, back, examples, tags, and deck name without applying removed filters.

Category cards should be derived from the category display definitions and the currently loaded decks. A category card renders only when at least one deck maps to that bucket. Pressing a category sets the active deck to the first matching deck and navigates to Study.

## Error Handling

The loading state remains unchanged. If there are no loaded decks or a category has no matching decks, Browse should not render empty category cards. Optional card fields such as `example` and `tags` must continue to be handled defensively.

## Testing

Update focused tests to verify:

- Browse renders search, categories, and Words of the Day in the default state.
- The old deck-type and region filter chips are absent.
- Search returns results from all loaded cards without requiring a selected filter.
- Category cards include categories beyond the old six-card subset when decks exist for them.
- Pressing a category still calls `setActiveDeckId` and navigates to Study.
- Audio buttons still call `speakCard`.

Run the Browse screen test file, then run typecheck if the local test environment allows it.

## Scope

This does not redesign Study, alter SRS behavior, change deck content, add a category details screen, or change the language toggle. It is a focused navigation and Browse cleanup.
