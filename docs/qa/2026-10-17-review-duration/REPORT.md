# Measured review pacing — 2026-10-17

## Contract

B05.3-B1 extends the existing review flow. A monotonic timer counts only time on the current actionable Study card while the screen is focused and the OS is active. It pauses for navigation, inactive/background states, checkpoint failures/waits, grade save/retry waits and Android interaction blur. Android blur/focus state persists across card/save effect restarts. iOS does not subscribe to those unsupported events. Changing session/deck/card resets the segment; a process restart begins a new segment without inventing pre-restart time.

The first grade attempt freezes its duration with its identity/quality/next queue. The existing durable grading journal saves timing with the learning event, schedule, counters and resume pointer. Retried identities cannot change timing. Untimed callers and old events remain null; backup/event formats already carry durationMs, so no new storage key or migration is needed.

Home requires at least five eligible observations from two sessions before calibrating. It uses the median of the latest 30 unique self-rated recall observations within 30 days, excluding future, mission/exercise/assessed/untimed samples and durations outside 2–180 seconds. The resulting pace is bounded to 15–90 seconds/card. Until then, initial level estimates apply. Existing total-card, fresh-card, region, due-priority and daily caps remain authoritative. English/Spanish copy identifies the estimate as based on active review pace. Timing never changes a grade or asserts learning ability.

## Automated results and review

Observed RED→GREEN for measured storage, invalid timing rejection, calibration eligibility/order/bounds, Home limits/label, and Study forwarding/immutable retry timing. Lifecycle tests cover foreground/background/inactive, focus loss, save pauses, identity reset, unknown OS state and Android blur across effect restarts. Independent review caught Android blur and an incorrect all-due fixture cap expectation (correct cap is zero). Both were resolved.

The first real iOS launch exposed RCTAppState rejecting the Android-only event subscription. A native-equivalent rejecting-subscription regression failed, then passed with the Android platform guard; native flow was rerun successfully.

Final full suite: **83 suites / 824 tests passed**. Typecheck, zero-warning lint, formatting, 16 calendar-zone cases, 47-deck / 1392-card / 1392-audio validation and editorial ledger validation passed. All 1392 cards still await real editorial acceptance.

## Native evidence

Created a separate **Colombian Spanish Timing QA**, iPhone 18 Pro / iOS27, device `A1792E3E-B9FD-4BD1-8364-7FC979B92825`. Installed the existing unsigned SDK57 development client and loaded current Metro source. Existing app QA fixtures and unrelated devices were left intact. Completed real fresh onboarding (work/all/default five-minute profile).

Five real grades across two session IDs persisted durations **52616, 35213, 27269, 12699, 11916 ms**. The second grade followed a verified SpringBoard background interruption: 66033 ms elapsed between grade timestamps, while measured active card time was 35213 ms. Background exclusion accounts for about 30.8 seconds of that wall-time interval.

Before sufficient samples, Home estimated five cards at four minutes. After the fifth sample, the median rounded to 27 seconds and Home estimated five cards at three minutes with the calibrated-pace label. English and Spanish layouts were inspected. Terminate/relaunch retained all five event durations and daily 5/10, newCount5. Explicit Continue retained exact IDs `1805,1806,1807`, session identity and original limits 6 total / 5 fresh; calibration did not refill or resize the saved queue. Explicit resume refreshed only the checkpoint timestamp. The fixture remains on Home with five retained QA grades.

- [Initial estimate](home-before-calibration.png)
- [Spanish calibrated estimate after restart](home-calibrated-es.png)
- [English calibrated estimate](home-calibrated-en.png)
- [Exact resumed session](exact-resume.png)
- [Read-only persisted snapshots](native-state-check.json)

The unsigned client's known expo-notifications missing-keychain-entitlement warning remains visible after restart. No signed notifications, Android runtime, physical audio/hardware, real learner pacing accuracy or editorial acceptance is claimed. Android interruption behavior has controlled regression coverage only.

## Remaining whole-plan work

B05.3 and B05.3-B remain open. This package calibrates the review phase; one applied activity, durable progression across phases, activity-specific timing, accepted content integration and wider catch-up/platform validation remain B05.3-B2 and related existing gates. No draft activity was promoted to accepted production content.

## Integration

Implementation `b5c0217` was merged and pushed to main after the merged tree passed 83 suites / 824 tests. [GitHub Actions 39031013262](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39031013262) passed all four quality/content, iOS/Android project-generation and production-JS-bundle, and summary jobs. [Checklist board deployment 39031013246](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39031013246) passed. Native Android runtime, signed builds and physical-device acceptance remain separate.
