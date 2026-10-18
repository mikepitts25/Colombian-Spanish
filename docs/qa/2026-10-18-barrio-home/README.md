# Barrio Home implementation and bounded QA — 2026-10-18

Runtime candidate: `9bd079b`, based on approved plan `6a6afd4`. Classic remains the default and retains its original Home composition. Barrio adds a plan-first hero, explicit phase labels, activity, word, tools and due decks. Existing Home controllers, queues, storage schemas and editorial gates remain authoritative.

## Automated verification

Full suite: **117 suites / 1,134 tests passed** after the React render-purity fix. Typecheck, lint, format, calendar zones, data validation, content validation/review, simulator isolation (**11 tests**) and theme color audit passed. The color audit classifies 255 literals, checks 418 composited pairs and retains 63 explicit Classic exceptions with zero errors. Logs are in `software/`; no package, lockfile or editorial inventory change was required.

Real-provider integration covers production review-only Study without a fabricated durable plan; failed stale reads with Retry; held/rejected starts and repeated presses while theme/language/font change; exact retained prior-day queue/run; unavailable content version recovery; fresh midnight budgets; completed-today to next-day fresh identity. Pure selector/component tests cover empty, cap, no-due, unavailable, completed, full long labels, loading/error stale-row suppression, semantic actions and decorative-art hiding. These are automated harness results, not native or signed production acceptance.

## Native provenance and state preservation

Reused the verified foundation Debug simulator binary because no native configuration or dependency changed. Both installed binary SHA256s match provenance. Current JS/image assets came from the actual isolated checkout with cloned dependencies and cache-cleared Metro8099. Normal Metro8098 was preserved. This bare React Native Debug binary needs the normal volatile launch argument `-RCT_jsLocation localhost:8099`; the first launch without it showed “No script URL provided.” Every launch has explicit UUID own-container preflights before/after. No simulator storage was written directly.

| Device                                 | Model/runtime                       | Original state                                                                    | Final durable state                                                                                 |
| -------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730` | iPhone SE3 / iOS26                  | 48 decks, 1,402 cards, 10 events; Classic/Spanish, retained applied plan          | All 11 original hashes restored via supported full-state backup import and verified after cold load |
| `DF3686C1-A2E7-4870-B127-A83A8B67541D` | Actual iPad mini A17 Pro / iPadOS26 | 48 decks, 1,402 cards, 11 events; BarrioDark/Spanish, prior-day completed fixture | All 11 original hashes retained after settings restored and cold load                               |

The mini baseline is an existing initialized completed fixture, not a pristine new-device state. Both finish at OS Light, Text Size3, VoiceOver off and Capture Keyboard off. Original backups were independently compared to all baseline keys before UI work. Read-only captures include prefs, plan, missions, decks, daily progress, streak, seen words, quiz history, saved session, notifications and learning events. `verify-evidence.py` validates the recorded snapshots and image digests without a device.

## Observed native matrix

| Case                                             | Phone                                                                                                                                     | Mini                                                                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Spanish/English × BarrioLight/Dark, default text | Visible hero/current primary, layout and palette observed                                                                                 | Visible hero/current primary, activity and word observed                                                                          |
| Same combinations, live maximum text11           | Upper reflow, cup hidden and two-row tabs observed; SpanishLight final control image saved rather than upper image                        | Upper reflow, cup hidden and two-row tabs observed; four upper images saved                                                       |
| Retained greeting phase                          | Continue opened original draft; Start draft initialized one revision0 run, blank response; cold Continue resumed that same run directly   | Not exercised                                                                                                                     |
| Cold preservation                                | Before/after retained cold all 11 hashes identical; after original backup import Classic composition returned with all 11 baseline hashes | Prior-day completed plan remains unchanged and yields a fresh recommendation; all 11 baseline hashes match after cold load        |
| Lower routes                                     | Listening preview reached and returned without starting                                                                                   | AX-driven Favorites, Phrases, Difficult Words, Quiz, Explore and Browse All reached their existing screens; no grading/quiz start |
| Word audio                                       | Existing callback covered by tests                                                                                                        | Visible audio control pressed without error; playback/quality not established                                                     |

Phone phases: only preferences changed for theme/language checks; greeting introduction then changed only missions plus preferences. Plan identity/hash and 10 events stayed unchanged. No Check, Hint, grade or End action was used. Full-state import restored the original phone missions and preferences. Mini settings checks changed only preferences; all route visits left its 11 events and all durable keys unchanged.

## Open acceptance — do not mark as passed

- [ ] Controlled touch-only scrolling through every middle/lower section and maximum-text primary on both devices. Device Hub long/short drags and coordinate scrolling did not provide reliable incremental scrolling. One phone gesture reached the final control; another short gesture activated an unstarted Listening preview. These observations do not prove every intermediate target or an app defect.
- [ ] Long deck name native fixture and complete native deck/goal/settings route matrix; automated full-name/route coverage is separate.
- [ ] Native completed-today, exact review-resume, unavailable-version, empty/cap/review-only and injected read/start failure fixtures. Harness coverage passes; no signed-production or native fixture claim is made.
- [ ] Home-specific saved System appearance/OS switch matrix and complete native Classic roundtrip on both devices. Phone Classic restoration is established; prior foundation evidence does not fill every Home cell.
- [ ] Physical audio/performance, assistive-user/tap comfort, Android agreements/tooling, signed distribution and human editorial acceptance.

The mini embedded app AX tree was absent during its first light/dark/language sequence; visible coordinate controls were used with screenshots after each action. AX returned after its final cold load, enabling the explicitly AX-driven route checks above. The known unsigned Debug notification/keychain entitlement banner was dismissed; signed notification acceptance remains open. All images were observed through CUA and saved using explicit-device simctl screenshots. `images.json` records their hashes. No blocked security work was attempted.

Implementation may be integrated with these gaps explicitly retained under B08.3-C; the parent Home acceptance checklist remains open. This package does not claim the entire native matrix or all AI work is finished.
