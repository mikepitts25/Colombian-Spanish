# Actual iPad mini applied-response validation — B05.3-B2b2-B2f

Runtime main `3271916` (keyboard reveal `e7bef82`), unchanged Debug native binary and localhost8099. This is evidence-only work: no product code, content, command, timing or storage behavior changed.

## Device and fixture

Fresh iPad mini A17 Pro / iPadOS26 `DF3686C1-A2E7-4870-B127-A83A8B67541D`, independently created/installed rather than cloned. Official device.plist identifies `iPad-mini-A17-Pro`; images are1488×2266 portrait/2266×1488 landscape. Before/after own-container launch checks and model metadata accompany the report. Only this mini was operated; source/other QA devices and aliases were untouched. CUA performed UI actions; official simctl handled launches/screenshots, and storage captures were read-only.

Completed disposable onboarding without grading. Imported the preserved Pro13 QA fixture with only dailyPlan/missions changed to the validated applied/no-run state, Spanish retained, through TextEdit copy → Device Hub Send Clipboard → supported Restore app state → cold restart. All11 initialized mini hashes match that intended Spanish applied fixture. This intentionally initializes a new test device; it does not preserve or restore pristine out-of-box records. The final cleanup target is the preserved completed-plan Pro13 fixture, whose11 expected hashes are independently checked against the preceding report's source snapshot. No direct app-storage writes.

Cold launch initially omitted app AX/input attachment. Controls→Home and reopening the visible app icon restored interaction, as on the Pro13. Immediate post-launch input readiness is not certified. Existing unsigned expo-notifications entitlement banners were dismissed; signed notification delivery is not claimed.

## Spanish and English checks

Spanish Home Continue → Start draft reply created the already-linked revision0 run. Focused the response and entered `Buenos dias` with individual software-key coordinate taps. Default Check/Hint/End were fully visible above the keyboard (`spanish-default-keyboard.png`). Live native Text Size3→11 retained the in-memory draft and dismissed the keyboard during the existing remount. A coordinate tap `[1000,665]` reopened it: input, full Check, Hint and End all fit above it in portrait (`spanish-max-portrait-keyboard.png`), without AX positioning of that maximum-text field.

Rotation with the keyboard open retained the draft and full input/Check (`spanish-max-landscape-keyboard.png`). The shorter landscape viewport leaves Hint/End lower; the native keyboard-dismiss key exposed both completely (`spanish-max-landscape-dismissed.png`). Those controls were observed, not activated. No Check, Hint or End was pressed.

Returned to portrait/default text and backed out without ending/grading. Settings' normal language toggle switched to English; only the preferences record changed. Home Continue resumed the same revision0 checkpoint. The unsubmitted draft was re-entered after navigation; persistence of an unsubmitted answer across navigation/process death is not claimed.

English default focus needed Device→Keyboard→Toggle Software Keyboard to reopen it. This simulator-control dependency is recorded separately from automatic opening. Software-key touches entered the same ASCII draft (`english-default-keyboard.png`). Live maximum text retained it; coordinate refocus reopened the keyboard with full input/Check/Hint/End in portrait (`english-max-portrait-keyboard.png`). Landscape retained the input and full Check, with Hint/End below the keyboard (`english-max-landscape-keyboard.png`); dismissal exposed both (`english-max-landscape-dismissed.png`). The word selected by the refocus tap remained unchanged. No answer was submitted.

## Cleanup and evidence

Restored portrait/Text Size3 and backed out. The editor initially reported another old fixture title; a fresh read and explicit Window-menu selection verified the exact `colombian-mini-applied-original.json` URL before copying. No wrong fixture was imported. Supported full-state import restored the preserved completed-plan target. All11 hashes match that target both immediately and after cold restart. Final Home is Spanish/Barrio Dark, with OS Light/Text Size3/Capture Keyboard off/VoiceOver off observed (`final-home.png`). This is exact target-fixture restoration, not a claim of returning to the fresh device's original absence of keys. Device permissions are not imported.

Eight snapshots preserve all11 learning events throughout. Spanish draft/rotation hashes match exactly; English switch/draft/rotation hashes match exactly; language changes affect only preferences. Creating the revision0 checkpoint changes the mission record as intended. Decks,1402 cards/48 decks/20 flags, schedules, daily/streak/seen-word credit, quiz history, notifications and ordinary Study queue remain exact. Final restored/cold snapshots match all11 completed-fixture hashes. No journal remains. Nine screenshots and five own-container preflights record the bounded checks.

Run `python3 docs/qa/2026-10-18-applied-mini/verify-evidence.py` for passive checks of embedded hashes, invariants, model, image digests and preflights. It cannot prove touch provenance or visual correctness. Existing runtime baseline:115 suites/1099 tests and main CI39130418981 pass; evidence-only validation runs the passive verifier, isolation scope tests and repository formatting, with candidate CI before integration.

Accent-popup entry, uninterrupted assistive navigation, broader narrow-phone/window/activity/font/theme matrix and platform checks remain open. Native Android/tooling agreements, signed candidates, physical audio/device/assistive acceptance, editorial/recording/product/account decisions remain separate gates. This closes only the bounded mini draft/keyboard/rotation item, not its whole-plan parent. Security B01.8-C2g remains access-blocked and was skipped without retry or bypass.

Independent read-only review of the evidence and all nine images found no Critical/Important/Minor issues and independently passed the passive verifier. The reviewer checked the exact checkpoint/preferences transitions and target restoration, and declined live touch/state, physical/automatic-opening/accent/assistive/full matrix/security/signed-media acceptance and baseline test/CI execution. The primary agent supplied observed CUA/own-device evidence; other gates remain open. Local isolation/format/verifier logs are in `software/`.
