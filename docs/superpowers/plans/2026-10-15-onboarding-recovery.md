# Onboarding save recovery

Bounded correction under B02.4-B2d. Existing onboarding silently swallows persistence errors and navigates into study. Save reason/region/completion and daily target as one recoverable durable intent, retain existing counters/unrelated preferences, and navigate only after acknowledged success. On failure keep selections and show bilingual retry; serialize rapid taps and freeze local controls while pending. Existing recommendation behavior stays the same. External hardware navigation and signed-device interruption are separate acceptance gates.

- [x] Reproduce write-failure navigation and pending-control failures in screen tests; pin atomic replay/count preservation in storage tests.
- [x] Implement coordinated onboarding completion and explicit retry/pending state.
- [x] Full checks and fresh review; update master/evidence, merge/push and verify CI.

Ruling: this is a correctness fix in an existing flow, not a new onboarding redesign. Standing authorization covers implementation, merge and push.

Evidence: screen regressions failed before the correction and passed afterward, with 57 suites / 602 tests green. Static/content checks passed. Fresh review found no actionable findings (47 focused tests); Spanish failure/retry rendering was added for its coverage gap and passed. Fresh iOS successful onboarding confirmed goal/cap separation and exact stored setup; injected failure/replay remains automated evidence. Integration/CI pending.

Implementation `c77550b` was merged and pushed to main. [GitHub Actions run 38751487389](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38751487389) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.
