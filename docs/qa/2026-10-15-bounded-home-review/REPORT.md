# Preference-aware bounded Home review — 2026-10-15

## Delivered

B05.2-B1 / B05.3-A / B05.4-B1 connect saved purpose, region, level and time to bounded flashcard suggestions. Due reviews take priority. Fresh choices rank purpose, regional metadata, active deck and general greetings fallback. The preview shows a deck, up-to count and initial duration estimate. Card limits are at most 15; new-card limits are 3/5/8 for a 3/5/10-minute budget, further bounded by the daily allowance. Level adjusts the initial per-card duration assumption, not content proficiency certification.

Home refreshes provider budget before handoff. Study validates route limits and saves them with exact queue membership, including subsequent grades, backups and resume. Ordinary starts keep existing defaults. Explicit region changes begin a new eligible session with the retained bounds; they are not continuation of the previous identity or a cumulative time quota across separately requested sessions.

## Evidence

- 60 suites / 646 tests passed, plus types/lint/format/data/editorial checks; generated inventory unchanged.
- New tests failed before implementation for the missing helper and ignored bounded handoff. A sparse-content estimate regression failed before correction: one available card now estimates its workload rather than the full selected time budget.
- Fresh review found resumed limits reset before an explicit region change. A reproducing regression failed; optional validated queue limits now persist/restore and are deeply copied from caller inputs. Tests verify bounded resume/region changes, invalid limits, legacy queues, backup preservation, due-first backlog handling, purpose/region/fallback, no-content/cap cases and Home foreground preference changes.
- Dedicated fresh QA iPhone 16 Pro / iOS 26.0 / Expo Go 54.0.7, Metro 8098: saved work/Paisa/basic/10-minute preferences produced “Suggested: Business · up to 8 cards · about 5 min”. This is an uncalibrated estimate of the smaller workload, not a promise to fill ten minutes.
- Main action opened Business with exactly eight fresh IDs 1800–1807; checkpoint limits were cardLimit 15 / newLimit 8. One simulated Good grade saved exactly 1801–1807 with unchanged identity/limits. Terminated/reopened Expo Go and resumed: UI seven left, first card `gerente`; read-only storage queue matched the prior checkpoint exactly.
- Explicit General selection after resume created a new session with eight eligible new cards 1801–1808, retained new limit 8 despite nine daily slots remaining, and excluded future-due graded card 1800. No extra grade was performed. Screens: [start](01-bounded-start.png), [Home after one grade](02-home-estimate.png), [resume](03-resumed.png), [region bound](04-region-bound.png).

## Limits

This is a bounded flashcard review, not the complete review/new/applied-activity planner. Estimates need measured calibration. Trip-date urgency, native language acceptance, broad timezone/navigation behavior, Android interaction, signed native builds and physical-device acceptance remain open. Regional metadata guides ranking but is not editorial approval. Repeated explicit starts are permitted; the daily new-card limit is still enforced at grade commit.
