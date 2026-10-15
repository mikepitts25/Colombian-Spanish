# Onboarding save recovery — 2026-10-15

## Delivered

B02.4-B2d replaces onboarding's swallowed save errors and unconditional navigation with one durable goal/preferences intent, acknowledged navigation, bilingual visible retry, duplicate-submission protection and pending control guards. Existing recommendations remain intact; current counts and unrelated preferences are preserved. An unmounted screen does not navigate after its write resolves.

## Verification

- Screen regressions failed against the old behavior: failure navigated away, pending back/goal controls remained active, and unmount still permitted navigation. They pass with the correction.
- 57 suites / 602 tests passed. Types, lint, formatting, data and editorial ledger validation passed; generated editorial inventory unchanged.
- Storage tests cover preserving current counts/preferences, failure between daily and preference writes, journal replay before subsequent reads, safe retry and invalid intents before writes. Screen tests cover failure/retry in English and Spanish, unresolved writes/rapid taps and unmount.
- Independent review found no actionable issues; 47 focused tests passed independently. Its English-only coverage gap was subsequently covered by the Spanish failure/retry test.
- Created isolated `Colombian Spanish Fresh QA` iPhone 16 Pro / iOS 26.0 simulator, UDID `121168CB-C271-4202-AC19-94F8DAE7B8B1`, Expo Go 54.0.7 via Metro 8098. Existing QA and other projects' simulators were not reset.
- In Spanish, selected travel, general regional coverage and goal 5, then started the first session. Direct handoff opened Travel with ten new cards (new-card cap 10 is separate from daily goal 5). Read-only local storage confirmed onboardingDone true, travel/all, daily target 5 with count/newCount 0, exact Travel queue checkpoint and no pending journal. Screens: [selected goal](01-selected-goal.png), [direct study](02-direct-study.png).

After terminating and reopening Expo Go, Home bypassed completed onboarding and showed goal `0/5`, ten new cards available and zero streak. [Restarted Home](03-restarted-home.png).

## Limits

Simulator successful-save navigation is separate from injected storage failures in Jest. No low-storage OS failure, physical interruption durability, hardware navigation, signed native build or effectiveness claim is made. Reviewed language, broad layout/accessibility and remaining planner work stay open.

Implementation `c77550b` was merged and pushed to main. [GitHub Actions run 38751487389](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38751487389) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.
