# Study and unrelated destructive deck mutations

Continue B02.4-B2 using the actual StudyScreen/DeckProvider/storage stack.

1. Add parameterized reset/delete of unrelated beta deck queued behind a held alpha grade journal. Assert original alpha grade, exact frozen remaining queue, daily/new credit and events, intended beta result and untouched gamma.
2. Repeat beta mutations after journal creation/first deck apply fails. The real mutation recovers the grade; original UI Retry must acknowledge it exactly once and retain beta mutation.
3. React unmount/remount/Continue must preserve exact remaining session, decks/events/counters. Treat passing current behavior as audit coverage, not a product fix. If a real regression fails, diagnose before changing implementation.
4. Run targeted/full relevant checks, fresh review, checklist/evidence, merge/push. These in-memory controlled storage failures do not prove simulator/process-death/physical acceptance. Security access work stays skipped.
