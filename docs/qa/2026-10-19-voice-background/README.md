# Granted recording and same-process background recovery

October 19, 2026, source main `875bbea`. Package 4 follow-up on the existing own-path SE3/iOS26 development install `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730`, using unchanged SDK57 source through normal Metro8099. No product, native or dependency changes. One simulator ran; all others stayed shut down.

## New acceptance

The previously unverified **granted-recording background/foreground recovery on this SDK57 install** now has a bounded native observation:

1. The app requested microphone permission only after Record. Allow returned to ready; a subsequent Record entered `Grabando`. Stop produced `Listo para escuchar`, a6.8-second/137KB take and a139,869-byte temporary `.m4a` file. Replay entered `Reproducción iniciada`; explicit Stop returned to ready. Delete disabled replay/delete and removed the file. These setup observations corroborate the older SDK55 capture packet; they are not counted as another implementation task.
2. A second take entered recording. The Device Hub Home control actually returned to the iOS launcher while recording was active. Read-only inspection found zero `.m4a` files in the app's ExpoAudio cache while backgrounded.
3. Normal foreground launch returned the **same PID83366**, to `Listo para grabar`, with replay/delete disabled. A new recording succeeded, Stop produced a21.4-second take, and Delete removed it. No force-quit/restart was used to obtain this recovery.

This closes only the local granted-capture/background recovery case, not every interruption or Package4. No audible-quality judgment, true call interruption, route change, live permission revocation, Android, signed-production exclusion or physical-device result is inferred. Replay-start/explicit-Stop states do not prove automatic playback-end UI recovery. The existing unsigned notifications entitlement diagnostic was visible; notification delivery is not accepted here. Actual recordings remain local temporary data and are **not** committed.

## State protection and recovery

The phone began with48decks/1,402cards/10events and the original retained applied draft plan and ordinary queue. Preparation for the missing Spanish maximum-count case used the existing supported long-title backup fixture, changing only the first deck title and saved Barrio Light preferences. Native Text Size11 and VoiceOver were observed. A distinct AX-targeted scroll positioned the long row's beginning, but a coordinate wheel did not provide the required count viewport. Spanish Light/Dark maximum counts remain open; neither a title click nor the previously failed captured drag was replayed. This is not a new clipping diagnosis or touch pass.

Voice checks then ran in Spanish Barrio Light at native Text Size3, VoiceOver off and Capture Keyboard off. [Four read-only checkpoints](state.json) show the nine non-fixture records unchanged after voice, including learning events, daily progress, queue and plan. Supported clipboard backup preview/full-state restore and actual cold launch PID83730 recovered **all eleven original hashes exactly**, both immediately after launch and after the restored Classic Home was visibly present. No direct storage writes were used.

The temporary microphone grant was reset with the supported simulator privacy command; a read-only TCC query found no app microphone row afterward, restoring the original unasked decision. Final ExpoAudio cache contained zero `.m4a` files. Native Light/Text3/VoiceOver off/Capture Keyboard off were observed. The sole running simulator was shut down, Metro stopped, and the QA TextEdit and Device Hub applications closed. A fresh booted-device listing contained none; no simulator was erased and no unrelated application was closed.

## Evidence and limits

- [Ready take](voice-ready.png), [final idle after cleanup](voice-final-idle.png), [restored Classic Home](restored-classic.png). These are actual750×1334 captures, not composited layouts. The idle image follows the recovery take's deletion; it is not a screenshot of the exact foreground transition.
- [Own-path preflight](preflight.json), [checkpoints](state.json), [observed process/file metadata and image hashes](verification.json).
- Run `python3 docs/qa/2026-10-19-voice-background/verify-state.py`. This passively checks saved state/image consistency; it cannot independently replay UI, prove historical permission/background events, determine sound quality or certify the missing cases. The narrative records the native observations; screenshots require visual inspection.

No broad local unit-test rerun is needed for this evidence-only change. Required CI is evaluated on the committed candidate. All five QA packages retain open cases; the127 unchecked parent/requirement rows and29 groups remain open rather than being closed by this narrow child result.
