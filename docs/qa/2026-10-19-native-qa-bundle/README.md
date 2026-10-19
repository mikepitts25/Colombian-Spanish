# Native QA bundle: earned midnight, Release Files and editor keyboard

October19,2026; base main `5b6adca`. Two existing own-path SE3/iOS26 installs were used **sequentially**, never concurrently. No new content, account, security patch or product subsystem. This bundle closes only B08.3-C3q, B08.5-B8i and B12.6-B; all five work packages retain other cases.

## Earned-counter natural midnight — C3q

The unsigned Release install `D5502A06-4858-428C-901C-587B58280F64` started with47decks/1392cards/one existing QA event, Classic/System/Spanish, and ordinary Greetings queue0009–0013. The installed executable, Info.plist and embedded bundle match the previously reviewed [Release build](../2026-10-19-release-bundle/native/build-metadata.json); [fresh comparison](build-check.json). Product/config sources through the base main match that build. This Release binary does **not** include the later development-only editor fix tested below.

Official `SIMCTL_CHILD_TZ=Asia/Kolkata` plain launch started PID85692. One actual reveal/Good grade of0009 earned daily count1/newCount1 and exactly one additional self-rated recall event; card0009 reps0→1/interval0→1/ease2.5 unchanged. Read-only comparison with the prior recovery backup's matching pregrade deck hash shows no other card changed; [graded-card metadata](graded-card.json). The remaining ordinary queue is0010–0013/current0010. This is an earned counter, not a prepared nonzero fixture.

Barrio/System was selected through Save. Home stayed focused across actual local midnight at **18:30:00UTC**, with no app restart, foreground return, navigation or injected time between the before/after observations. The read-only two-second [timeline](timeline.json) first records October20/count0/newCount0 at **18:30:57.791836UTC**. Only daily progress changed; all ten other hashes, both events and full saved checkpoint stayed exact. PID85692 was still alive with the original timezone. Home automatically showed0/5, morning greeting, the new daily word and ten available new cards. Progress agreed; ordinary Continue opened buenos días/four remaining with no second grade, changing only the normal checkpoint timestamp.

[Before](before-midnight.png), [after](after-midnight.png), [Progress](progress-after.png), [continuation](resumed-after.png). No retained durable plan was prepared here; its current value is null. The earlier retained-plan/prepared-counter case is reused, not repeated. No live OS timezone/DST, foreground-at-boundary, cap exhaustion, signed or physical claim follows from this process-local observation. The OS status-bar clock consequently differs from the app's process-local day.

Original Classic/System/Spanish preferences were restored using normal controls. Plain cold launch without TZ, PID86628, returned daily date to the OS-local October19 with count/new0; ten other records and the exact saved queue remained unchanged. [Classic Home](plain-cold.png). The new earned schedule/event is deliberately retained: this QA profile now has **two events**, not its former one-event baseline. This is not an eleven-record restoration claim. No backup import or direct storage write occurred on this Release install.

## Native local Files on compiled Release — B12.6-B

On the same Release process after the boundary/resume, Settings Save backup file opened the actual OS share sheet. Save to Files→On My iPhone→Save created the local JSON. Native Import backup file selected it through [OS Recents](file-picker.png) and returned the [correct preview](file-preview.png):47decks/1392cards/two observations, full-state guidance and all four actions. Cancel applied nothing. All eleven records before export and after preview cancellation are identical.

Read-only inspection of the actual File Provider Storage file matched all eleven portable record hashes after reconstructing the normal schema1 event-storage envelope from the backup's event array; [filename, size, hash and comparisons](file-provider.json). The file remains local as a backup; no raw backup or recording is committed. Save/File selection used screenshot-grounded coordinates; preview cancellation used AX. A Device Hub stale AX tree was refreshed by selecting a **stopped** device and returning, without booting it. Brief VoiceOver use returned off; Capture Keyboard stayed off.

This is current compiled unsigned Release/own-path validation, supplementing the earlier Expo Go/seven-section [B11.2-C packet](../2026-10-15-backup-alerts/REPORT.md), not another file-backup implementation. Cloud providers, unavailable/malformed/oversized native selections, actual file-based replacement/reinstall, low storage, Android, signed candidate and physical sharing remain open.

## Maximum-text editor header fix — B8i

Release intentionally hides editorial Review; that gate was preserved. After shutting Release down, development phone `BF511B0E-479F-429E-83B7-4134E910847F` used normal Metro8099. Its separate baseline is48decks/1402cards/**12events**, daily2/5/new0 and the original retained plan/frozen current9 queue. No source/cross-device cold-protection claim is added.

The unsigned notifications banner initially hid lower controls. Its exposed secondary Cancel did nothing. **Opening the banner, then AX Dismiss in LogBox, removed it** without code/configuration changes or repeating failed coordinate dismissals. It returns on a later cold startup; notification entitlements/delivery are not fixed or accepted by this action.

With a610-character unsaved translation and native Text Size11, the [pre-fix Spanish Save](editor-es-save-partial.png) remained partly beneath the software keyboard after targeted scrolling and a further scroll at that position. Review's keyboard-avoiding view omitted the native header height. The working Add form uses the measured `HeaderHeightContext`; React Native subtracts this offset from the screen-coordinate keyboard edge when calculating avoidance. A real-component regression with header74/local-y20/height573/keyboard-y407 expected313 available points but got387: [observed RED](editor-red.log).

The minimal fix passes the measured header height, defaulting to0 without a header, into Review's `keyboardVerticalOffset`. The real keyboard-layout regression and adjacent Add/Review suites then pass: [19/19 GREEN](editor-green.log). No save, scheduler, filter, navigation or theme behavior was changed.

On the patched development JS, all four maximum-text action labels are fully readable above the open software keyboard in **separate** positioned views for both languages:

| Language | Save                                         | Native-review action                                   | Previous and Skip                                   |
| -------- | -------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| Spanish  | [Guardar y seguir](editor-es-save-fixed.png) | [Necesita revisión nativa](editor-es-native-fixed.png) | [Anterior / Saltar](editor-es-navigation-fixed.png) |
| English  | [Save & Next](editor-en-save-fixed.png)      | [Needs Native Check](editor-en-native-fixed.png)       | [Prev / Skip](editor-en-navigation-fixed.png)       |

Positioning used AX-targeted scrolling; no action was submitted and no touch-only/assistive pass is claimed. Previous is disabled on the first card as expected. The long draft was canceled in each language. Fast Refresh reset the initial Spanish draft when the hook signature changed; the identical draft was re-entered for the comparison. Software keyboard visibility was checked explicitly: the English keyboard-hidden view was **not** accepted; Device→Keyboard→Toggle Software Keyboard restored it before the accepted images. No hardware-keyboard option was toggled.

Spanish acquisition left all eleven original records exact; English acquisition changed only prefs through the normal language save. The host twelve-event recovery backup was first proven to match all eleven current baseline hashes. Supported clipboard preview/full-state restore and actual normal cold launch PID88383 recovered all eleven records exactly, immediately and after [visible restored Classic Home](editor-restored-cold.png). Text3/Light/VoiceOver off/Capture Keyboard off returned. No editor draft, reviewed status, flag, schedule or learning event was saved.

Other focused fields/long examples, tablet/window/theme/platform matrices, production-gated editorial scope and full touch/assistive acceptance remain open. This is development-JS native evidence, not a rebuilt/signed editor candidate.

## Verification and cleanup

[Seventeen checkpoints](state.json), [process/image/test metadata](verification.json), two development preflights and a Release final preflight are archived. The actual read-only acquisition scripts/logs remain under `/tmp/colombian-earned-midnight`; the collector reuses the existing own-container verifier. Run `python3 docs/qa/2026-10-19-native-qa-bundle/verify-state.py` for saved-artifact consistency. It cannot independently replay historical native UI/process/clock/file events, prove touch provenance or replace visual inspection. File/normalized-deck metadata records live read-only comparisons; raw portable files/decks are not embedded for a second replay.

One justified full regression run after the code fix passes117 suites/1158 tests; typecheck and lint pass. Formatting, evidence/index/ID/link checks, one fresh final review and CI gate integration. The two simulators were shut down before switching/end; a fresh booted listing showed none. Metro, QA TextEdit and Device Hub were closed. No simulator was erased and no unrelated app or file was closed/deleted. The other packages' named failed routes were not replayed unchanged; blocked security stayed skipped.
