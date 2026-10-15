# Editable learning preferences — 2026-10-15

B05.2-A adds a Settings editor for learning purpose, region, self-reported starting level, 3/5/10-minute study time and optional trip calendar date. Safe defaults support old profiles; the editor saves an atomic patch retaining unrelated preferences and study state. Version-3 backups validate and retain all new fields. It does not yet change Home recommendations or build timed plans.

## Evidence

- 59 suites / 624 tests passed. Types, lint, formatting, data/ledger validation passed; generated editorial inventory unchanged.
- New storage/screen tests initially failed without the new APIs/screens. Coverage includes legacy defaults, invalid dates/values, leap dates, profile clearing, unrelated field/count preservation, version-3 capture/parse/restore, load failure/retry, invalid-date Save guard, retained edits after write failure, retry, overlapping saves and local exit while pending.
- Independent review found no actionable issues; 40 focused tests and typecheck passed independently.
- Dedicated fresh QA iPhone 16 Pro / iOS 26.0 / Expo Go 54.0.7, Metro 8098: selected work, Paisa, basic and ten minutes. Invalid 2027-02-29 showed an error and disabled Save; valid 2028-02-29 enabled it. Focusing the date scrolled it above the keyboard; Return dismissed the keyboard and left Save visible. Saved confirmation appeared in Spanish.
- Read-only storage inspection confirmed all selected fields, onboarding completion, language, audio defaults and new-card cap; daily count/newCount remained 0 and target 5; no pending journal. Left the screen, switched language through Settings and reopened: work/Paisa/basic/ten minutes/date were still selected in English.
- Screens: [saved Spanish](01-saved-spanish.png), [reopened English](02-reopened-english.png).

## Limits

Self-report is not an assessed proficiency level. Trip dates are calendar labels, with no location or itinerary collected. Recommendation/time-budget integration is subsequent work. Simulator checks do not establish VoiceOver/TalkBack navigation, Android keyboard/gesture behavior, tablet/large-text layouts or physical-device acceptance. Failure injection is automated test evidence, not a reproduced OS disk-full event.

Implementation `6276835` was merged and pushed to main. [GitHub Actions run 38752944117](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38752944117) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.
