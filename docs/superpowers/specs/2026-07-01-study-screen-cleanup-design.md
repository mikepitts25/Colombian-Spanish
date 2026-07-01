# Study Screen Cleanup Design

## Context

The Study screen currently keeps the Colombian flag-inspired dark theme, but its layout is difficult to parse. The region filter row can expand vertically and look like a set of tall columns, which pushes attention away from the flashcard. Header actions, swipe hints, card content, conjugation content, and grading controls compete for priority.

The goal is to keep the existing visual identity while making the study task obvious: choose a deck/filter, read the card, reveal the answer, then rate recall.

## Decision

Use the approved Focused Stack direction. The screen remains a single vertical study flow with compact controls:

- Header: deck context on the left, favorite and remaining-count actions on the right.
- Daily progress: a compact progress bar near the header, using Colombian yellow/blue/red as a restrained accent.
- Region filters: a horizontal chip row that sizes to its content and never consumes the main card area.
- Study hint: one concise row explaining the swipe/tap actions.
- Flashcard: the visual center of the screen, with the Spanish prompt, example, and audio button clearly grouped.
- Rating: a bottom recall panel with the four existing SRS options and intervals.

This is preferred over a card-first layout because the intervals and remaining-card context stay visible, and it is preferred over guided mode because it avoids adding another instructional row.

## User Experience

The first viewport should communicate what is happening without reading every label. The deck title and remaining count identify the session, the filter chips read as optional narrowing controls, and the card dominates the screen.

The region filter chips should look like chips, not columns. They should remain horizontally scrollable when labels do not fit, with a clear active state.

The flashcard should feel tappable. The prompt copy should use action-oriented language such as "Tap card for answer" rather than ambiguous instructional text. The audio button stays available but should not visually compete with the card text.

The rating area should feel like the next step after review. Keep the four existing labels and intervals so SRS behavior remains understandable and tests do not need to learn new semantics.

## Architecture

Keep the change focused on presentation:

- `src/screens/StudyScreen.tsx` owns the screen layout, header, filter row, progress bar, hints, empty state, and rating controls.
- `src/components/Flashcard.tsx` owns the card face layout, flip animation, swipe grading, and audio button.
- `src/styles/theme.ts` remains the source for shared color tokens. Any new local colors should be small extensions of the existing dark surface and Colombian accent palette.

No new navigation routes, state models, or SRS logic are needed. Existing `recordAnswer`, `toggleFavorite`, region filtering, daily progress, and flashcard flip behavior stay intact.

## Data Flow

The data flow is unchanged:

1. `StudyScreen` reads the active deck and study batch from `useDeck()`.
2. Region selection filters the current batch and resets the index.
3. `Flashcard` handles tap-to-flip, long-press/audio, and swipe grading.
4. Grade buttons call `grade(q)`, which records the answer, increments daily progress, and advances the card.

Layout changes must not alter card ordering, filter matching, favorite toggling, daily progress, or SRS quality values.

## Error Handling

The existing loading, no-deck, and caught-up states remain. They should receive the same cleaner spacing and button treatment as the main study screen, but their control flow should not change.

If a card is missing optional fields such as `example` or `tags`, `Flashcard` should continue to render without crashing.

## Testing

Use focused regression tests around existing behavior:

- Study screen still renders loading, no-deck, caught-up, active deck, remaining count, region filters, favorite toggle, and grading controls.
- Region filtering still switches to matching regional cards.
- Grade buttons still call `recordAnswer` with the same SRS quality values.
- Flashcard still renders front/back text, example splits, flip target accessibility label, and audio playback trigger.

Manual verification should include an iPhone simulator pass to confirm the region row is compact, the flashcard is central, the bottom rating panel is reachable, and the tab bar does not crowd the study controls.

## Scope

This change does not redesign the whole app, replace the tab bar interaction model, alter the SRS algorithm, add onboarding, or change deck/card content. It is a focused visual and usability cleanup of the Study screen and flashcard presentation.
