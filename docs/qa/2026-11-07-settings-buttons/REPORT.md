# Settings and button audit — 2026-11-07

Scope: the existing Colombian-Spanish app, including settings persistence,
navigation, study actions, recovery, and the purpose of controls across all 26
screen modules. This is a source and automated behavior audit. It does not claim
that every control was manually exercised on a physical device.

## Fixes

- Language changes become visible after durable confirmation. Rapid changes are
  serialized, stale startup reads cannot overwrite a newer choice, and failed
  saves have an accessible retry path without an unhandled rejection. If storage
  reports a failure after creating its recovery journal, an authoritative read
  reconciles the recovered choice before reporting success or failure.
- A saved language change refreshes reminder text without asking for notification
  permission. The existing notification queue continues to serialize scheduling.
- Denied reminder permission now offers **Open system settings**, alongside
  **Retry** to reapply the saved choices after permission is enabled. Failure to
  open Settings provides manual instructions and preserves the saved choices.
- **Browse All Decks** explicitly requests Study's topic browser, preserving its
  existing checkpoint guards, instead of merely returning to a retained session.
- Version/build metadata is static information. Settings destinations and
  Explore actions expose button semantics to assistive technology.
- An audio-preferences save can finish while the screen is blurred. Returning
  no longer leaves controls stuck in their saving state. Blur still cancels
  playback and invalidates late preview results.
- The optional trip date explicitly says it is saved for reference only; it does
  not imply that trip urgency changes the current study plan.

## Settings purposes and contracts

| Control              | Purpose and behavior checked                                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colombian Library    | Lists free/full collections, samples, actual available product pricing, purchase and restore states. Unavailable billing remains explicit.                                                                                                         |
| Learning preferences | Saves purpose, region, starting level and available study time for recommendations; validates and saves the optional reference date; preserves unrelated preferences.                                                                              |
| Daily goal           | Saves the daily target and refreshes the study budget. Presets have explicit values.                                                                                                                                                               |
| New cards per day    | Opens the same daily-limits editor for its separate new-card cap. Decrease/increase respect the 1–100 range; reviews remain available.                                                                                                             |
| Reminders            | Master switch controls implemented morning/night reminders; child switches are disabled when master is off. Saves and native scheduling failures have separate recovery. Legacy streak/achievement fields are not exposed as functioning switches. |
| Manage decks         | Search, select, rename, reset and delete have distinct actions; reset/delete require confirmation and pending writes are guarded.                                                                                                                  |
| Theme                | Classic and Barrio selection; Barrio system/light/dark appearance; explicit save, failed-save retry and cancel. Classic intentionally retains its original dark appearance.                                                                        |
| Audio                | Persists playback speed and opt-in speech after flashcard reveal. Preview uses the unsaved speed; repeat applies to generated clips; device fallback is labeled single-play; Stop cancels pending playback.                                        |
| UI language          | Changes English/Spanish with durable confirmation, busy/error handling, and refreshed reminder copy.                                                                                                                                               |
| Export Backup        | Copies decks and practice results in the compatible clipboard format. It is distinct from a full-state file backup.                                                                                                                                |
| Import Backup        | Validates clipboard input before confirmation; handles older formats and full-state preview without silent writes.                                                                                                                                 |
| Save backup file     | Shares a version-3 snapshot including portable app state without overwriting the clipboard.                                                                                                                                                        |
| Import backup file   | Validates and previews contents; Add new cards, Replace decks, Restore app state and Cancel are distinct explicit choices. Restore messages retain the restart instruction for active providers.                                                   |
| Version              | Displays actual native version/build, or clearly identifies Expo Go host metadata; has no inert action.                                                                                                                                            |

## Other button purposes

| Screen/component group                | Actions reviewed                                                                                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home and tabs                         | Primary start/resume, topic discovery, daily-plan management, settings, word audio, study topics and optional tools connect to their existing destinations.                                                            |
| Study and flashcards                  | Topic/search/region selection, session start/resume, reveal, audio, stop, favorite and grading have separate learning purposes; checkpoint/grade recovery retains save guards.                                         |
| Quiz and Difficult Words              | Start/retry, answer selection, next, missed-card review, regions and grading operate on the corresponding session.                                                                                                     |
| Daily plan                            | Resume review, continue applied practice, finish/end plan, retry a failed load and return Home preserve plan ownership.                                                                                                |
| Adventures and passport               | Start/resume/continue/revisit, next eligible visit, open/close passport and loading recovery preserve mode-scoped progress and earned stamps.                                                                          |
| Phrases and favorites                 | Topic choice, study, pronunciation and favorite toggles retain their separate jobs.                                                                                                                                    |
| Explore and Add Card                  | Browse, favorites, create card/deck and manage decks remain available; empty/invalid forms, cancellation and pending-save recovery are explicit.                                                                       |
| Progress                              | Quiz and Study links lead to their named activities; learning evidence is not a decorative button.                                                                                                                     |
| Onboarding                            | Reason, region and goal choices persist through the existing next/back/retry flow.                                                                                                                                     |
| Internal review/listening/voice tools | Review save/filter/export/reset, listening answers, record/stop/replay/delete, permission recovery and written alternatives retain their intended behavior. Existing production/editorial feature gates remain intact. |

A one-off TypeScript AST scan found no direct `Pressable` elements without an
action handler (excluding wrappers that forward props). This is a useful
structural check, not proof that every native interaction succeeds.

## Verification

- `npm test -- --runInBand --watchman=false`: **130 suites, 1,351 tests and 1 snapshot passed**. The run includes screen/component integration, persistence, backup/restore, navigation, billing boundaries, content and accessibility checks. Two suites emitted Expo's Expo Go notification-module warning; there were no failed tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed with zero warnings.
- Prettier checks for changed code/tests and `git diff --check`: passed.
- `npm run validate:data`: passed for 47 decks, 1,392 cards and 1,392 audio entries, plus configured PNG headers/dimensions.
- `npx expo export --platform ios --max-workers 2 --output-dir /tmp/colombian-settings-audit-ios-verified`: passed, producing the iOS Hermes bundle, assets and metadata.
- New regression checks reproduced failures before fixes for language persistence, rapid toggles, stale startup reads, notification-language refresh, denied-permission recovery, explicit topic navigation, settings action semantics and the audio blur/save lifecycle. Additional post-journal write and cleanup failures were reproduced and now recover to the authoritative language.
- Independent code review found the post-journal language discrepancy; it was fixed, retested and confirmed resolved. No further important findings remained in that review.

## Remaining device-dependent checks

Native system-settings navigation and permission dialogs, actual reminder
delivery, audible playback/recording, purchase/restore transactions, touch feel,
and maximum-text layout still require device acceptance. Jest mocks native
boundaries; the iOS export validates JavaScript/Hermes packaging and assets,
not native compilation or hardware execution. No simulator saves, user data,
store configuration, or release distribution were changed by this audit.
