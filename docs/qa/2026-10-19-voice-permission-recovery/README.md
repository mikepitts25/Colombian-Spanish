# Live microphone permission revocation and recovery

October 19, 2026, unchanged source main `ac3f125`. B09.2-B2d / Package 4 follow-up on own-path SE3/iOS26 development install `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730`, normal Metro8099/SDK57. Only this simulator ran. This is new evidence for a distinct permission transition, not another basic capture or background-cleanup implementation.

## Native observations

1. Record requested the actual iOS microphone prompt. Allow granted permission; no take was created by granting it. Read-only app-scoped OS inspection changed from no microphone row to authorized value2.
2. Native Settings → Apps → Colombian Spanish displayed [Microphone on](02-settings-granted.jpg). The exposed Settings list `Scroll Down` secondary action reached Apps; the generic scroll helper had not moved the viewport. Clicking the actual switch produced [Microphone off](03-settings-revoked.jpg), OS value0 and zero take files.
3. iOS terminated PID92522 on revocation. Normal app launch returned new PID92805, rather than a same-process resume. Record now displayed [the denied message and Open app settings action](04-denied-after-revoke.jpg), with no take. The app action successfully opened its own native settings pane with Microphone off.
4. Clicking that switch [re-enabled access](05-settings-reenabled.jpg), OS value2. iOS also terminated PID92805; normal launch returned new PID92869. Reopening voice preview and Record entered [Grabando](06-recording-after-reenable.jpg). Stop produced [Listo para escuchar, 7.1s/141KB](07-take-ready.jpg) and one local `.m4a`. Delete returned [ready with replay/delete disabled](08-take-deleted.jpg) and zero take files.

This proves bounded **Settings revocation → denied app behavior → working settings recovery link → re-enable → successful new take/delete**, including actual OS-driven relaunches. It does not prove same-process live permission refresh, audible quality, playback completion, calls, routes, low-storage behavior, Android or signed/physical acceptance. Completed initial-denial, unscored written-alternative and granted-background cases are reused, not repeated as new acceptance. The parent voice requirement and all five QA packages stay open.

## State, cleanup and evidence

[Four read-only app checkpoints](state.json) retain all eleven original hashes exactly:48decks/1402cards/10events, original plan/session, no write journal. No learning credit was earned and no backup import or direct storage write was needed. The [own-path validation](preflight.json) confirms the container belongs to this exact device; the collector also checked this at each snapshot. [OS checkpoints](os.json) show unasked → granted → revoked → re-enabled → one take → cleanup. Only permission values/counts are archived; actual recordings are not committed.

After app Delete and Back, supported `simctl privacy <UUID> reset microphone <bundle>` restored the original unasked OS state. Final inspection found no microphone row and zero take files. Native Light/Text3/VoiceOver off/Capture Keyboard off were unchanged. The sole simulator was shut down, Metro stopped, and idle QA Device Hub closed; no simulator was erased or unrelated app closed.

The seven JPEGs are unmodified1972×1368 Device Hub window captures, with app-scoped accessibility diffs alongside them. They are not full-resolution app-only captures and do not certify the broader layout matrix. The initial capture-service errors were resolved before these acceptance actions. The unsigned build's known notifications/keychain diagnostic was dismissed through LogBox, not treated as a microphone failure or notification acceptance.

[Observed process/image metadata](verification.json) records the native actions above. Run `python3 docs/qa/2026-10-19-voice-permission-recovery/verify-state.py` to check saved state/hash/metadata consistency. It is passive; it cannot replay or independently prove historical UI actions, OS process termination or audio quality. Source is unchanged, so no broad local product tests were repeated; required CI runs on the actual committed candidate.
