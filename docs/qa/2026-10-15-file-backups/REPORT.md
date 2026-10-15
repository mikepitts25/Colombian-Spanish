# File backup acceptance

October 15, 2026. Base `1a329d6`. Scope B11.1-A2.

## Delivered behavior

Settings can save a dated version-2 deck/card/event JSON through the native share sheet, or choose a local/provider file. A coherent storage snapshot waits behind pending grading/history commits and rejects corrupt stored decks. Input is bounded before reading (20 MB) and parsing (10 million UTF-16 code units), then checked for supported legacy/version-1/version-2 envelopes, dates, decks and events. Cancellation performs no restore.

An in-app preview shows export date, counts and omitted state, with Cancel, Add new cards and Replace decks. Additive merge retains existing local deck/card content and scheduling and adds only globally new card IDs. Both modes merge event history and use durable restore journaling. Backup actions and preview callbacks are guarded against overlapping writes. Existing clipboard compatibility remains.

Selected source documents are retained. Imported cache copies are removed best effort after reading. Handed-off export cache files remain available because an Android chooser can resolve before the receiving app reads them. Later exports attempt cleanup of owned JSON exports at least 24 hours old; this is not guaranteed deletion after 24 hours. Privacy draft/inventory reflect plaintext files, cache lifetime and user-selected provider destinations.

## Automated checks and review

48 suites / **489 tests passed**; TypeScript, ESLint, Prettier, data validation and deterministic inventory checks passed. Inventory remains 47 decks / 1,392 cards / 1,392 audio entries. New regression coverage includes file cancellation/size/lifetime/cleanup, source preservation, create failure, malformed input, corrupt local snapshot, snapshot/grade ordering, additive merge preservation, preview/error handling and deferred restore overlap. Tests failed before the relevant behavior was implemented. Independent follow-up review found no actionable findings after lifetime and preview-lock fixes (82 targeted tests independently passed).

The simulator exposed an existing invalid named import from React Native's internal Alert module. Restore had committed but success presentation threw. Settings now uses the public React Native Alert export; the Jest mock no longer invents the invalid named internal export. The full suite above includes this correction.

## iOS simulator

Dedicated Colombian Spanish QA iPhone 16 Pro, iOS 26.0, Expo Go 54.0.7, current working-tree Metro bundle. Native Save to Files produced a 373 KB JSON. Read-only validation of the saved file confirmed version 2, a valid export date, 47 decks, 1,392 cards and six observations. Native picker selected that file and displayed the same counts/date in the app preview. Add new cards completed with a visible Importado confirmation; native picker cancellation returned to Settings with actions available and no preview/error.

The initial native Alert preview disappeared when invoked immediately after picker dismissal; the in-app preview fixes that observed presentation race. Screenshots: [saved file picker](01-saved-file-picker.png), [in-app preview](02-import-preview.png), [successful import](03-import-success.png). Follow-up grading/restart evidence is in [the grading report](../2026-10-15-transactional-grading/REPORT.md).

## Still open

This exports decks/cards and supported event history, not full application state. Preferences, daily counters, streak, seen words, quiz round history and exact session queue are omitted; B11.1 remains open. Replace behavior and failure recovery are covered by automated tests, not a destructive simulator reset. Interrupted native restore, Android provider/chooser behavior, cloud file providers, physical devices, native compilation/signing and store acceptance remain open. Expo Go success does not substitute for those checks. Existing dependency audit findings remain tracked separately; this batch adds SDK-compatible Expo adapters without claiming those findings resolved.

SDK adapter references: [Expo filesystem](https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/), [document picker](https://docs.expo.dev/versions/v54.0.0/sdk/document-picker/), [sharing](https://docs.expo.dev/versions/v54.0.0/sdk/sharing/).

## Integration

Implementation `1e98e24` was merged and pushed to main. [GitHub Actions run 38712206939](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38712206939) passed quality/content and independent iOS/Android project generation and production JavaScript bundles. Native compilation/signing and device acceptance are still separate gates.
