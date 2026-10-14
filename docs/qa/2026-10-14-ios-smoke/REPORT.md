# iOS smoke checks and study queue correction

Date: October 14, 2026. Baseline app source: `5519b09`. Dedicated simulator: Colombian Spanish QA, iPhone 16 Pro, iOS 26.0, UDID `DA623884-B6E4-4E09-8945-EC74CC888A61`. Host: Xcode 27.0 (27A266a), Device Hub. App: Expo Go 54.0.7, SDK 54 development JavaScript served locally on port 8094. This is not a signed standalone app or release candidate.

## Setup correction

Xcode 27 uses [Device Hub](https://developer.apple.com/documentation/xcode/device-hub) to display and interact with simulators. The previous report's diagnosis that missing `Simulator.app` meant an incomplete toolchain was incorrect. Opening Xcode → Open Developer Tool → Device Hub immediately exposed the dedicated device and pending Expo confirmation. Updated development instructions preserve older attempt evidence but supersede that diagnosis.

The first Metro launch encountered a missing-module error for a file present on disk while Watchman reported repeated recrawls. Resetting only this project's Watchman watch and starting Metro with `--clear` produced a successful development bundle. No dependency or product-code workaround was required. The same local reset may be needed when serving a newly installed worktree.

## Baseline interactive evidence

| Flow                 | Observed result                                                                                                                                                                                                                | Evidence                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Launch/onboarding    | Accepted Expo prompt and developer introduction. Chose travel, all regions, five-card daily goal. First study opened directly. No prior onboarding data was present; no reset of other simulators or user devices.             | [Onboarding](01-onboarding.png)             |
| First study          | Front suitcase / reverse maleta rendered and flipped. Pronunciation replay control exercised; no audio-quality or route acceptance inferred. Grade Good recorded one review.                                                   | [Answer](02-study-answer.png)               |
| Queue defect         | Before correction, one grade changed 10 remaining to 8 remaining and displayed airport. The eligible batch shrank while the screen index advanced, skipping the next item.                                                     | [After one grade](03-after-one-grade.png)   |
| Home/Progress        | Home refreshed to 1/5 and a one-day streak. Progress showed one in-review card, zero due reviews, and no invented recognition results.                                                                                         | [Progress](06-progress.png)                 |
| Quiz, sparse history | Quiz opened and correctly displayed its current lock state: one of ten seen words, nine more needed, Study now action. Actual scored quiz outcomes are not covered by this smoke run.                                          | [New learner quiz](04-quiz-new-learner.png) |
| Phrases/favorites    | Opened essential phrases, saved “Me llamo... / Mi nombre es...”, exercised its replay control.                                                                                                                                 | [Phrases](05-phrases-favorite.png)          |
| Settings             | UI language toggled from Spanish to English while five-card goal remained. No account, rating, publication, or reminder-permission action.                                                                                     | [Settings](07-settings-english.png)         |
| Process restart      | Terminated Expo Go and reopened the same local project. Onboarding remained completed, English UI and daily count 1/5 persisted. Study landing offered Travel resume; baseline resume reopened suitcase, the just-graded card. | [Restart Home](08-restart-home.png)         |

All actions used only the dedicated QA simulator. Other running project simulators were left alone.

## Bounded correction

- Snapshot queue membership/order by card ID at explicit session boundaries; use current card objects for rendered content/favorite state. Provider scheduling updates no longer remove entries underneath the current index.
- One pending submission per Study screen prevents overlapping grade taps/swipes from submitting the same prompt twice. This guard is not a durable transaction or persisted idempotency key.
- Save the next queued card for resume, rather than the just-graded card. At batch completion clear the forced starting card and request a fresh eligible batch. Full queue/order/filter restoration after restart remains open.
- Re-selecting the active region leaves position unchanged. Changing regions or starting another session creates a new queue boundary. A version guard prevents late grade completion from advancing a different session; it does not establish atomic cross-session storage writes.

Regression tests failed before these corrections for provider-queue shrink, overlapping submissions, next-card/completed-batch resume, and re-selecting the active region. An existing region fixture was corrected to include its returned cards in the active deck, matching the real provider contract.

## Remaining observations and limits

- Five-card daily goal and ten-card new-card allowance are separate current settings: onboarding began a ten-card session. B05 must reconcile the bounded daily plan with both settings; this run does not certify daily caps/relearning/cross-deck behavior.
- Home labels the unstudied library as due (1,391 after one review), while Progress properly separates new cards from due reviews. The Home workload redesign remains B05.4.
- Settings displays hardcoded v2.0.0 (build 42) while app configuration is 1.0.0. Track deriving displayed version/build from the actual app configuration before release.
- Today's word was vulgar slang without a visible register warning on Home. Editorial content selection and register handling remain B03/B05 work.
- Multi-key grade/counter/session persistence, partial failure/retry, exact full-queue resume, mid-save navigation, and durable deduplication remain open. No new recall-observation producer was added.
- Audio controls were exercised without a visible crash; output audibility, pronunciation accuracy, interruptions/routes, and physical-device audio were not validated.
- Actual scored quiz feedback, conjugation modal interaction, large text, accessibility navigation, tablet, Android, timezone/DST, corrupted/upgrade data, native compilation, signed-release behavior, and physical devices remain outside this smoke run.

## Final correction verification

- Full Jest suite: **40 suites / 376 tests passed**. TypeScript, ESLint, Prettier, content/data validation, and unchanged editorial inventory passed.
- Independent review found the active-region replay edge case; a regression failed before the no-op correction and passed afterward. Follow-up review independently reran all **29 Study-screen tests** and found no remaining actionable regressions within scope.
- Corrected iOS flow: baseline legacy resume opened suitcase with 10 left; one Good grade showed ticket with **9 left**. Tapping the selected All filter preserved ticket/9 left. [Corrected single grade](09-corrected-one-grade.png).
- Terminated Expo Go again and reopened the same local project. Home retained English UI and the now 2/5 daily count; Travel resume opened **ticket with 9 left**, rather than suitcase. [Corrected process-restart resume](10-corrected-resume.png).
- Implementation `0f9811e` was fast-forward merged and pushed to main. [Hosted CI run 38620447936](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38620447936) passed all quality/content and iOS/Android project generation and production JavaScript bundle jobs. Full transactional storage and release/device gates remain open.
