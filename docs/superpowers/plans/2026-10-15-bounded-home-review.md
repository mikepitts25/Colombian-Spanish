# Preference-aware bounded Home review

Existing Home/Study integration, B05.2-B1 / B05.3-A / B05.4-B1. Under standing execution authorization, connect saved purpose, region, self-reported level and time to a bounded flashcard recommendation. Due review takes priority, so absence does not hide overdue material. With no due cards, prioritize purpose then regional membership, active deck and general greetings fallback. Preferences guide ranking, not claims of content acceptance or a strict dialect exclusion.

Time is an initial estimate, not a timer or learning claim: per-card estimates 45/35/25 seconds for beginner/basic/confident, maximum 15 cards; introduce at most 3/5/8 new cards for 3/5/10 minutes and respect the remaining daily cap. No due/new content means browse. A bounded review may be shorter than the chosen time when content/cap is scarce. Optional trip date is stored but does not accelerate or enlarge workload. Applied-activity phase, duration calibration and trip-aware planning remain open.

Home shows suggested deck and up-to card count/time estimate. The main action refreshes provider budget then passes explicit validated card/new-card limits. Study freezes the selected bounded IDs in the exact saved queue; ordinary category/search/legacy entry defaults remain unchanged. Explicit new starts reset limits; resuming preserves the saved membership. Region chips during a bounded review retain its limits. Invalid route limits fall back safely.

- [x] Pin due priority, purpose/region/fallback, level/time bounds and cap/empty cases in pure tests; pin route queue limits in Study and Home handoff tests.
- [x] Implement recommendation helper, localized preview and bounded route integration without changing scheduling/rewards.
- [x] Run full checks, review and simulator bounded start/restart evidence; checklist, merge/push and CI.

Final: fixed resumed limit reset — resume/region regression RED→GREEN; optional validated limits are persisted with exact queue and deeply copied for storage/grade intents. Sparse-content estimate regression also passed after correction. Final suite 60/646 and static/content checks passed; iOS eight-card start, grade/restart/exact seven-card resume and explicit-region cap evidence captured. No deferred minor findings. Merge/CI pending.

Implementation `0c32322` was merged and pushed to main. [GitHub Actions run 38754924531](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38754924531) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.
