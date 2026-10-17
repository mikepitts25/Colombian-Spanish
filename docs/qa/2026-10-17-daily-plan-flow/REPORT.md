# Daily plan flow — 2026-10-17

## Scope

B05.3-B2b1 connects the durable plan contract to Home, exact bounded Study, one short authored written greeting, and completion. Draft text remains development-gated; production keeps review-only fallback. This is not acceptance of authored language, completion of the full first-morning mission, or activity-specific timing calibration.

Fresh storage inputs create one identity atomically. Home does not mutate the active deck before Study settles a pending grade. Read/start errors retain intent with Retry/Manage. Exact queue/session/limits survive preference changes and restart. Explicit End clears intent while retaining schedules/history. The assigned mission/run/version must match; final mission/event/plan writes share the durable journal. Applied completion adds no flashcard grades or proficiency claim.

## Automated evidence

Targeted tests cover the real content registry and development gate, 3/5/10-minute bounds with a 60-second initial response allowance, concurrent starts/replay, production fallback, exhausted caps, exact queue/linkage, stale runs, retries, pending manual grades, detached ordinary resumes, unavailable content and first-read recovery. An injected failure of the final plan write verifies journal recovery and replay without duplicate evidence. This added coverage passed after correcting its assertion to the engine's actual `completed` field; no product change was needed.

Fresh review identified three issues: stale resume linkage, Home changing decks before the old pending grade settled, and an error allowing unlinked fallback. Each was reproduced and fixed with failing/passing regressions.

Final local verification: 87 suites / 862 tests passed; typecheck, lint, whole-repository format, calendar-zone checks, data/audio inventory and editorial-ledger validation passed. CI will be recorded after integration.

## iOS simulator evidence

Dedicated Colombian Spanish Timing QA, iPhone 18 Pro / iOS 27, unsigned SDK57 client serving the worktree through Metro 8098. Original SDK57 QA fixture was untouched. Actions used the app UI; read-only snapshots are in [native-state-check.json](native-state-check.json).

- Five-minute English plan selected five available new Business cards, IDs 1805–1809, limits 8/5. Cold restart and a preference change to ten minutes retained the same plan ID, original five-minute setting, exact queue and limits. Explicit End retained all prior five grades.
- Fresh ten-minute English plan used limits 15/5 and the same five available new cards. Ending again preserved schedules, five events and daily 5/10.
- Three-minute Spanish plan used limits 4/3 and IDs 1805–1807. Three actual grades advanced the empty review queue to applied, daily 8/10 and eight events.
- Continue my plan opened the assigned draft greeting. `Buenos días` produced correct feedback and exactly one applied event. Cold terminate/relaunch → Home Continue restored that same run and feedback. Continue then committed the same plan as complete. Home displayed View completed plan.
- Daily count/new count remained 8 and the deck hash remained `d9612e403fff83af903349628aee5762ae6e7db4a8f4c5e7189ff1120168270f` throughout answer, cold resume and completion. Event count stayed nine after the answer, with no duplicate on restart/completion. The dedicated fixture retains these real QA grades and completed plan.

Screenshots: [five-minute start](five-minute-start.png), [ten-minute start](ten-minute-start.png), [Spanish three-minute start](three-minute-start-es.png), [review complete](review-complete-es.png), [answer feedback](applied-feedback-es.png), [cold feedback resume](applied-cold-resume-es.png), [plan complete](plan-complete-es.png).

## Limits / next work

The applied response still uses existing wall-clock mission timing and a fixed initial 60-second allowance. Active activity-specific calibration is B05.3-B2b2 and remains open, as do the parent B05.3 items. Broader tablet/narrow/large-text, Android runtime and physical-device acceptance remain separate. The unsigned client shows the known expo-notifications keychain-entitlement warning; signed notification behavior is not established. All 1,392 editorial cards still await current human acceptance; no language/audio release gate was relaxed.
