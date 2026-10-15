# Editable learning preferences

B05.1-A/B05.2-A, continuing the authorized master plan. Extend existing local preferences and Settings with an editor for purpose, region, self-reported beginner/basic/confident level, 3/5/10-minute study time and optional YYYY-MM-DD trip date. No accounts, travel details, network services or proficiency certification. Empty trip date clears it; calendar dates retain their identity across timezones. Preserve unrelated preferences/current study data and include new fields in version-3 backups. Legacy profiles get safe defaults.

The screen loads before editing, offers retry on read failure, retains edits on save failure, prevents overlapping saves, supports local back/cancel and reports saved success. Inputs stay disabled while pending. It is scrollable with keyboard avoidance and accessible selected/disabled states. Existing purpose/region labels are reused. Recommendations/timed plan selection remain a subsequent bounded package; this editor does not claim they already consume the new fields.

- [x] Pin storage defaults, validation, preserved fields and backup roundtrip with failing tests.
- [x] Add profile normalization and atomic patch persistence; extend strict backup validation.
- [x] Add bilingual Settings editor and navigation; tests for load/save failure, retry, invalid date and preserved draft.
- [x] Full checks, fresh review and simulator save/reopen; update checklist, merge/push and CI.

Verification: storage and screen tests failed before new implementation; final suite 59/624 passed. Static/content checks passed with unchanged generated inventory. Fresh review found no actionable findings (40 focused tests/typecheck). Spanish iOS save and English reopen confirmed work/Paisa/basic/10 minutes/leap date; impossible dates disabled Save. Date input scrolled above the keyboard; Return made Save visible. Daily totals/goal remained unchanged. No design deviations or deferred minor findings. Merge/CI pending.

Implementation `6276835` was merged and pushed to main. [GitHub Actions run 38752944117](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38752944117) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.
