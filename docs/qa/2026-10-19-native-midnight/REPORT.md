# Own-path Home natural midnight — 2026-10-19

B02.6-B2c verifies one current same-store native Home rollover without a clock change, injected JS date, app reload, grade or navigation across the boundary. It repeats the Home portion of historical midnight evidence on a validated own-path device. It does not close B02.6-B2, B01.6-B2 or Barrio Home calendar acceptance.

## Environment and acquisition

Actual iPhone SE3 / iOS26, `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730`, data container `5F437B65-7217-48DC-85CD-67AE3C6C69B0`. Explicit preflight passed before interaction; the read-only collector independently validates every captured path, and [return preflight](return-preflight.json) passes. No alias or other simulator was operated. Existing unsigned development binary, Classic/Spanish, normal Metro8099; its process cwd is the preserved `barrio-controls` worktree at main `7af0132`. There is no native dependency/configuration or product-source change.

Device Hub AX observations exceeded the previous30-second tool deadline, while Finder read immediately. A read-only process sample showed Device Hub main-thread layout activity, not evidence of a stopped process or a locked Mac. Allowing60 seconds obtained AX state in38/42 seconds. One screenshot call still timed out; later native controls and screenshots returned in about5 seconds. No app/device/process restart was performed, and the exact cause of the intermittent observation delay is unproven.

All UI used CUA. Set native Text Size3→1 through the inspector so the daily-word heading was visible near the lower edge. An attempted Home drag did not reposition the screen; no touch-scrolling acceptance follows. Capture Keyboard, VoiceOver and native appearance stayed off/off/Light. Official explicit-UUID simctl supplied screenshots, and the existing [read-only state collector](../2026-10-18-barrio-home/native/capture-state.py) supplied snapshots with its output redirected to a new temporary evidence file. No app-storage file was edited directly. No content/import fixture was installed for this observation.

## Observed boundary and exact changes

The before checkpoint is23:55:28 on October18 and the after checkpoint00:01:29 on October19, host Europe/Berlin (+02:00). The phone visibly shows11:55PM then12:01AM. It stayed on Home; no navigation, reload or clock/timezone setting occurred during this interval. The same app PID77843 and Metro argument are recorded [before](before-meta.json) and [after](after-meta.json). This is a before/after observation, not continuous video or frame-by-frame instrumentation.

- [Before](before.png): “¡Buenas noches!”, daily word “tinto”,0/5, three reviews, ten new available, retained daily-plan Continue/Manage actions.
- [After](after.png): “¡Buenos días!”, daily word “meter presión”, the same0/5 and workload/plan actions, without an entry action. These greeting semantics are existing behavior, not a redesigned midnight greeting.
- The expected daily picks from the actual stored deck pool and unchanged `pickWordOfDay` function are [recorded separately](expected-words.json). That calculation is corroboration; the visible native screenshots establish the observed change.

Exactly `SRS_DAILY_PROGRESS_V1.date` advances `2026-10-18`→`2026-10-19`; count/newCount stay0 and target stays5. This fixture was already at zero, so it does **not** demonstrate resetting a positive count or replenishing an exhausted allowance. All ten other logical hashes remain identical: decks/schedules, durable plan, mission state, preferences, streak, seen words, quiz history, exact ordinary Study session, notification preferences and learning events. The event count stays10, with exact event content unchanged and no write journal. The full session retains `catchup-7/8/9`, current `catchup-7`, region, session identity and even updatedAt. The saved plan remains unchanged, rather than being replaced merely because the day changed.

Restore native Text Size1→3 through CUA. The [returned Home](restored-text3.png) and third checkpoint retain the after-midnight state exactly. The natural new date is intentionally not rolled back; an old daily date would be normalized again by normal reads. No original learning record or queue was changed by test input.

## Verification and limits

Run `python3 docs/qa/2026-10-19-native-midnight/verify-state.py`. It checks the three saved checkpoint identities, exact date-only delta, full retained session/plan/events, ten other hashes, same PID/Metro, own container and screenshot digests. It does not replay the UI, recognize image text, prove general simulator isolation, or establish a source-device cold launch. Image text was inspected separately. No cross-store restore or source-preservation claim is made.

This is Spanish Classic Home on one installed development client at native Text1, followed by return to3. It is not Barrio Home, Progress, English/maximum text, live timezone/DST, positive-counter reset, a full fresh/returning/upgrade matrix, signed/Android, accessibility/hardware or actual learner acceptance. Those requirements remain open. Audio/passport review questions and security skip are unchanged. No runtime defect was found or product fix made; documentation formatting, this passive verifier, independent review and CI apply to this evidence package only.
