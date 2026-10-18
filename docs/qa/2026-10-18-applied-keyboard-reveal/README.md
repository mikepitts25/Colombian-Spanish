# Applied reply keyboard reveal and rotation — B05.3-B2b2-B2e

Base main `4ac2dac`; runtime `83fe543` plus review corrections `e7bef82` on `codex/tablet-applied-matrix`. Integration pending. This advances the existing daily-plan/native matrix; the broader parent remains open.

## Native reproduction

Fresh own-container iPad Pro 13-inch M4 / iPadOS26 `F9BC32B5-9591-4CEA-9363-707D3A7E204D`, Barrio Dark, OS Light, default Text Size3, VoiceOver/Capture Keyboard off. Only this fresh QA device was operated; original source devices and quarantined aliases were untouched. CUA performed all UI actions; official simctl handled explicit-device launches/screenshots and storage reads were passive.

A read-only fixture builder verified all11 baseline records and wrote an exact local v3 backup, SHA256 `2c4a26c908771a2a25ebb7267b54cac3a4e710ef43a95a7ae1ba30facaeb4cac`,376947 characters. Metadata is in `native/fixture.json`. A derived local backup changed only dailyPlan/missions to the previously validated applied/no-run fixture and interface language to English. Both files were transferred using TextEdit copy → Device Hub Send Clipboard → supported app import/Restore app state → cold restart. No simulator-storage writes.

English Home Continue → Start draft reply created the already-linked run at revision0. Device Hub's software keyboard initially needed Device→Keyboard→Toggle Software Keyboard despite Capture Keyboard off. Coordinate software-key taps entered `Buenos dias`; full default Check/Hint/End were visible. Live Text Size3→11 retained the draft but dismissed the keyboard as the existing ScrollView remeasured. Reopening it put the input at the keyboard edge and Check below (`english-max-keyboard-portrait.png`). Rotating to landscape with keyboard open left the input behind it (`english-max-keyboard-landscape-before.png`). One new landscape prompt drag `[1050,640]→[1050,405]` dismissed the keyboard and exposed all controls; it did not establish keyboard-open drag positioning. No answer, Hint, Check or End was pressed.

## Correction and review

MissionScreen had KeyboardAvoidingView but no explicit measured focus reveal after keyboard/viewport changes. The correction uses the existing Add Card pattern: keep a ScrollView ref, record current card/input content positions, and reveal the focused response after focus, keyboard-show and layout events. A width/font-scale/run-node measurement key rejects incomplete or stale geometry; blur and feedback/completion stop eligibility. Answer/controller state remains above the existing font-scale remount. No storage, command, timing, palette or native configuration path was changed.

Two regressions fail on the old behavior (15 pass/2 fail), with the same card layout target, and pass with the fix. Initial test setup targeted a text wrapper; corrected that selector before the final recorded RED/reversion/GREEN. A synthetic layout event also needed React Native's `persist` method; the final RED has only the intended missing-scroll failures.

Independent review found one Important focus identity defect: a hint increments revision while the same input can retain focus. It also found a Minor assumption that every language change produces new layout events. Both were reproduced in two further RED tests (17 pass/2 fail), then fixed: focus identity follows run/node, and valid unchanged frames survive revision/translation changes while width/font changes still require current measurements. Final reviewer independently passed19 MissionScreen tests and found no remaining Critical/Important/Minor issues. The reviewer declined native event ordering/placement, physical/full matrix, signed/Android, final evidence and security; native observations and passive evidence were handled here, broader gates remain open.

## Final native check

Restarted only the new cache-cleared Metro8099 server for each runtime revision; the original8098 host server/worktree was preserved. Reused the unchanged previously rebuilt unsigned Debug binary. Explicit before/after own-container preflights accompany every cold launch. As in the preceding tablet report, cold launches initially lost Device Hub app AX/input attachment; Controls→Home then reopening the visible QA app icon restored interaction. Immediate post-launch input readiness is not certified.

On final runtime `e7bef82`, resumed the same revision0 run. The unsubmitted draft was re-entered after process restart; process-death draft persistence is not claimed. Software-key touches entered `Buenos dias`, live maximum text retained it, and refocusing showed the complete input/Check/Hint/End above the open keyboard (`fixed-max-portrait-ax-focus.png`).

To separate accessibility positioning from coordinate focus, hid the keyboard with its native key and coordinate-tapped the visible input `[1000,700]`. That selected the last word but did not itself reopen the software keyboard in this simulator configuration. Device→Keyboard→Toggle Software Keyboard reopened it; the app revealed the complete controls (`fixed-max-portrait-coordinate-focus.png`) without another app AX positioning action. Rotating with keyboard open then retained the draft and full input/Check/Hint/End above it (`fixed-max-landscape-keyboard.png`). This proves the corrected measured reveal on this English 13-inch configuration, including rotation. It does not prove physical automatic keyboard opening, accented popup entry or every touch/assistive scenario. No Check, Hint or End was pressed in the native check.

Restored portrait/Text Size3, backed out without ending/grading, and imported the exact original baseline backup through supported UI. All11 hashes match immediately and after final cold restart; Spanish/Home returned with the original completed October17 plan, Barrio/Dark pair, all11 learning events,20 flags,48 decks/1402 cards, schedules, counters and ordinary Study queue unchanged. OS Light/Text Size3/Capture Keyboard off/VoiceOver off were observed. Device permissions were not imported. Existing unsigned notification-entitlement banners were dismissed; notification-delivery acceptance is not claimed.

## Evidence and remaining work

Seven snapshots preserve all11 events and eight invariant records throughout; draft/rotation/fixed snapshots are identical in every durable key. Restored/final snapshots equal all11 baseline hashes. Nine own-container preflights and eight image digests are recorded. `verify-evidence.py` checks recorded values/hashes/images, not touch provenance or visual quality.

Software: final115 suites/1099 tests,23 focused tests, types and zero-warning lint pass. Color audit unchanged:255 literals/418 pairs/63 preserved Classic exceptions/zero errors. Logs include both final RED boundaries and GREEN runs. Repository formatting/whitespace is checked before publication.

Accent-popup entry, Spanish corrected-layout capture, narrow-phone/window and broader bilingual/assistive/activity matrix remain AI/native work; Android tooling/agreements, signing, physical feedback/audio and editorial/product/account gates remain distinct. This does not close B05.3-B2b2-B2 or certify learner pace/proficiency. Security B01.8-C2g remains access-blocked and was skipped without retry or bypass.

Device-label correction: an earlier working description called this device a mini. Official `simctl list devices --json` and its device.plist identify the13-inch M4 (`native/device-provenance.json`); screenshot2064×2752 dimensions agree. The preceding tablet post-cold report had the same carried-forward label and is corrected in this change. These runs do not establish smaller-tablet acceptance.
