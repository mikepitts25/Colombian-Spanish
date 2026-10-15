# Home workload and direct study

Date: October 15, 2026. Base: `c8c07b7`. Scope: B05.4-A / B05.5-A. Interactive platform: dedicated Colombian Spanish QA iPhone 16 Pro, iOS 26.0, Xcode 27 Device Hub, Expo Go 54.0.7.

## Delivered behavior

Home counts only studied cards due now as reviews. Fresh cards and studied cards due later today no longer inflate the overdue workload. It separately shows fresh cards in the library and the remaining daily new-card allowance. This allowance is distinct from the daily flashcard goal. Due-deck shortcuts include only decks with studied reviews due now.

The main action opens the selected review deck directly, or a deck containing new cards when allowance remains. With no recommended deck it opens the deck browser. Starting first refreshes DeckProvider's data and daily budget, preventing a fresh Home count from using a stale prior-day study cap. A budget-read failure keeps Home visible and shows a retryable error. Other existing reload callers retain their best-effort behavior.

Spanish inspection exposed a long heading pushing the streak badge beyond the card. The summary now takes the remaining row width and wraps while the badge retains its width.

## Automated evidence

Baseline: 40 suites / 380 tests passed. Added coverage distinguishes new/due/later cards, exhausted allowance, empty library, foreground preference and daily-budget changes, delayed refresh before navigation, and refresh failure/retry. Study verifies the existing auto-start route. A real DeckProvider/Home/Study integration test covers next-day allowance recovery, blocked navigation on failed budget read, and successful retry. It failed when the awaited refresh was temporarily omitted and before strict failure propagation was implemented. Fake time and in-memory storage are test-only.

Independent review found the stale provider budget and swallowed read failure; both were fixed and reviewed without remaining actionable findings. Final checks are recorded below.

## Interactive iOS evidence

1. [English Home](01-home-workload.png): zero studied reviews due, 1,390 new library cards, ten available today, goal 0/5.
2. Main action opened [Essentials directly](02-direct-study.png), with ten cards left, without a second deck-start action.
3. Opened the [conjugation dialog](03-conjugation-dialog.png), switched tense, and inspected separate tú/vos rows. This is UI verification only; linguistic acceptance remains open.
4. Graded one card Good. [Home after study](04-home-after-study.png) showed zero reviews due, 1,389 fresh library cards, nine available today, goal 1/5.
5. Switched to Spanish. Captured the [clipped badge before correction](05-spanish-before.png). After the layout correction and process restart, [Spanish Home](06-spanish-home.png) wraps its heading and displays the badge inside the card. Persisted study counts remained 1/5 and nine available.

No destructive storage reset, account change, or other project's simulator was used.

## Limits

Parent B05.4/B05.5 remain open: no 3/5/10-minute planner, absence catch-up package, cross-deck plan, or purpose/time-aware recommendation was added. Broader timezone changes, resume races, tablet/large text/screen reader layouts, Android interaction, physical devices, native compilation/signing, and signed-release validation remain open. Preference/day/error boundaries above have automated coverage; the actual simulator run covers the listed English/Spanish and direct-start interactions.

## Final verification and integration

**41 suites / 390 tests passed**, plus TypeScript, ESLint, Prettier, data validation, deterministic editorial inventory comparison, and `git diff --check`. Inventory remains 47 decks / 1,392 cards / 1,392 audio mappings. Independent review of behavior and the final layout delta found no remaining actionable findings. Implementation `b593e03` was fast-forward merged and pushed to main. [GitHub Actions run 38677765924](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38677765924) passed all quality/content checks and independent iOS/Android project generation and production JS bundle jobs. These CI jobs do not compile/sign native binaries or exercise physical devices.
