# Familiar-card catch-up — 2026-10-17

## Delivered behavior

B05.4-B adds a distinct fresh-plan catch-up policy after at least seven local calendar days since the last recorded study day (flashcards or a completed quiz share that history). If studied reviews are due, the recommended batch contains familiar cards only, with newLimit 0. The existing 3/5/10-minute budget, measured pace, applied-response reservation, due ordering and hard card bounds still apply. New cards remain separately available; English and Spanish Home explain the limited plan. Seven days is an initial product default for pilot validation, not an efficacy finding.

Missing, malformed or future history does not invent an absence. Legacy stored instants normalize through the existing calendar utility. No due reviews permits the usual bounded new-card recommendation. An existing plan keeps its exact identity, queue and limits through a changed day, history or preference; no fresh policy rewrites an active plan. No schema or dependency changes.

Review found the direct production handoff could reuse a six-day recommendation after midnight. A regression observed newLimit 1 where 0 was required. Start now refreshes recorded study day, clock, daily allowance, preferences and pace before deriving its bounded handoff; a newly saved unfinished/today-complete plan takes precedence. This uses the current provider deck snapshot after refresh; the broader unrelated editor/deck mutation audit stays in B02.4-B2.

## Automated verification and review

Observed RED → GREEN for mixed due/new catch-up selection, atomic fresh-plan membership and bilingual Home guidance. Covered seven/six-day boundary, future/unknown history, no-due fallback, legacy instants, null/malformed history, unchanged decks/counters on start and frozen existing-plan resume. The additional midnight handoff regression failed before the handoff fix and passed afterward. One fresh reviewer found that issue, confirmed the fix and independently passed all 28 Home tests.

Final local checks: **90 suites / 889 tests passed**; types, lint, formatting, calendar integration (16 cases across Berlin/Bogotá/New York/Auckland), data/audio inventory (47 decks / 1,392 shipped cards), and editorial validation passed. All 1,392 shipped cards still await qualified human acceptance. Implementation 223c198 plus reviewed handoff/native evidence ade4a60 were fast-forward merged and pushed to main. Merged-tree verification passed 90 suites / 889 tests and formatting. [GitHub CI](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39039408354) passed all four jobs, including both platforms’ project generation and JavaScript exports; these are not native Android compilation/runtime acceptance. [Board workflow](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39039408371) succeeded.

## Native evidence

Dedicated iPhone SE 3 / iOS 26 clone **E66A88D6-CC87-4F46-A197-3F97EE9ED8CB**, Colombian Spanish Catch-up QA, existing unsigned SDK57 client and Metro 8098. The prior narrow fixture was preserved. Synthetic ten-card backup: six previously studied QA cards, four fresh QA cards, recorded last day October 8, daily target 5, three-minute preference. This is a controlled software fixture, not a learner history or content-acceptance result.

The fixture was copied through TextEdit UI and Device Hub Send Clipboard, then imported with the app's version-3 preview and Restore app state action. No app data was mutated through filesystem writes. On restart, the normal seed merge retained the shipped library too: 1,402 total cards, six studied due and 1,396 fresh. Existing learning history is union-preserved by restore, so three earlier QA events remained as the baseline; the fixture introduced no fabricated events.

- English and Spanish Home show six due reviews, a separate new-card allowance of 10 and a two-card catch-up suggestion plus the draft applied phase.
- Start creates exact IDs catchup-0 / catchup-1 with cardLimit 2 / newLimit 0. Deck hash, daily count and events are unchanged by starting.
- One actual Good grade advances daily count 0→1 and history 3→4. Cold terminate/relaunch → Home Continue restores only catchup-1 with the same plan/session/limits, even though the recorded study day is now today. Restart leaves deck hash and counters unchanged.
- A second actual Good grade ends this batch at zero remaining and advances the linked plan to applied. Daily count is 2/5, newCount remains 0, and history has exactly two additional QA grade events. The four unselected due cards and all fresh fixture cards retain identical scheduling/content. No automatic backlog expansion or new-card insertion occurs.

Evidence: [English Home](home-en.png), [Spanish Home](home-es.png), [cold exact resume](cold-resume-es.png), [bounded review finished](bounded-review-finished-es.png), [read-only snapshots](native-state-check.json).

The known unsigned-client expo-notifications entitlement banner appeared after restart and was dismissed through UI. Signed notifications remain unverified. Native midnight/timezone injection, Android runtime, broad layouts/keyboard and physical-device acceptance stay in their existing gates. Narrow Study grading interval labels are below the visible fold near the bottom tabs in the cold-resume capture; B12.5 retains a specific check of scrolling and touch access. Reproduce persistent clipping before treating this as a defect. The actual grade controls worked, but this report does not close the broader layout gate.
