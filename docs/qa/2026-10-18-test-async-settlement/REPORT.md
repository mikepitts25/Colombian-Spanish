# Settle screen tests without React act warnings

B01.1-A, base `1edf727`. This fixes test completion in five existing cases; it changes no application source, dependencies, test assertions, simulator data, or runtime behavior. The test count remains1,140.

## Cause and correction

| Existing test                                    | Baseline diagnostics                        | Correction                                                                                                                              |
| ------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Study no-deck landing                            | Two late resume-state updates outside `act` | Hold the mocked resume read, retain the existing landing/no-daily-read assertions, then resolve the read inside awaited `act`           |
| Difficult Words failed-save Retry                | One act-environment diagnostic              | Await the button lookup before entering the action's `act` block                                                                        |
| Difficult Words next-card eligibility            | One act-environment diagnostic              | Await the button lookup before entering the action's `act` block                                                                        |
| Difficult Words Barrio Light and Dark tag colors | One late Flashcard update per theme case    | Mount normally, then await the existing theme action in async `act`, settling initial reduced-motion work before assertions and cleanup |

The baseline71 focused tests passed but emitted six diagnostic blocks. A temporary observer forwarded `console.error` unchanged and printed Jest's current test name for these messages; it identified the cases above. The observer is not included in the test configuration or committed tests. Neither console suppression nor a global React act-environment override was added.

An initial attempt wrapped `render` itself in async `act`. The installed renderer could not expose its root in that nested scope, causing three test failures. That approach was removed. The final change leaves ordinary render intact and settles the actual pending read/actions. Both focused files pass71/71 with zero diagnostics, and the normal full-project command passes117 suites/1,140 tests with zero diagnostics. No app bug fix or added test case is claimed.

## Verification

```sh
npm test -- --runInBand --watchman=false --runTestsByPath __tests__/screens/StudyScreen.test.tsx __tests__/screens/DifficultWordsScreen.test.tsx
npm test -- --runInBand --watchman=false
npm run typecheck
npm run lint
npm run format:check
python3 -m unittest discover -s scripts/tests -p 'test_*.py'
git diff --check
```

All commands pass; Python QA14/14. A diagnostic-output gate returns exit1 for the six baseline React act messages and exit0 for the final focused/full logs. `verification.json` records the counts and test names. This is an observed diagnostic correction, not a failing product regression followed by a runtime fix. Existing behavioral assertions and real hooks/components remain in place; the storage mock was already part of the Study screen unit fixture. Full CI remains the integration gate.

## Simulator work remains open

Before the attempted phone follow-up, explicit UUID `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730` passed own-container preflight and normal Metro8099 was listening. Device Hub AX/getApp reads then timed out after approximately30,45 and30 seconds, resetting the CUA kernel. Between retries, inventory reported Device Hub running. No fresh simulator tree/screenshot or UI action followed; a timeout is not proof the app stopped, that the Mac is locked, or that layout failed. The user was asked to check window/unlock availability while this independent software work continued. No device/app restart or fixture import was performed.

English maximum-size Home title coverage, Spanish maximum count views, touch-only positioning and calendar cells remain B08.3-C3e. They require functioning simulator UI tooling; this is not evidence that they require physical hardware or manual coding. Existing physical/audio/signed, editorial and account gates remain separate. Blocked security work was skipped. Read-only historical provenance inspection did not close B01.6's broader repeat requirement.
