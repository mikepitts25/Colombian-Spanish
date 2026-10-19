# Active capture through live maximum-text resizing

October19,2026, unchanged source main `7ac5021`. B09.2-B2e / Package4 bounded follow-up on the existing own-path SE3/iOS26 development install `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730`, normal SDK57/Metro8099. Only this simulator ran; product/native/dependency code is unchanged.

## New native result

After supported baseline recovery and normal cold launch PID95062, the existing microphone prompt granted local recording permission as setup. This does not recount B2d permission recovery or B1 basic capture.

- Record at native Text Size3 entered [Grabando](01-default-recording.jpg), with elapsed0/30 in the accompanying AX observation.
- A live native slider change to Text Size11 retained recording: the [maximum-text screenshot](02-max-recording.jpg) shows the resized screen and slider; its [AX sidecar](02-max-recording.txt) records Grabando/10seconds. The status is offscreen in this screenshot, so simultaneous visual recording-indicator acceptance is not inferred.
- Stop at maximum text produced a single [ready take](03-max-take-ready.jpg); the [AX observation](03-max-take-ready.txt) records18.7seconds/290KB. Read-only cache inspection found one `.m4a`, and PID95062 remained alive. No restart, navigation, backgrounding or second Record occurred between start, resize and Stop.
- Accessibility-targeted positioning then showed [full maximum-text Stop, Replay and Delete labels together](04-max-delete-position.jpg). Delete at that text size returned ready with replay/delete disabled; [after Delete](05-max-deleted.jpg). Restoring Text Size3 left the screen [ready without a take](06-default-ready.jpg). Replay was not activated in this case.

This proves bounded active-capture state retention through native text resizing, a resulting take, usable maximum-text Stop/Delete actions, and cleanup. It does not prove continuous acoustic quality, an always-visible recording indicator, screen-reader announcements, touch-only scrolling, phone landscape, tablet/window/English/theme matrices, Android or signed/physical acceptance. The phone configuration is portrait; no landscape claim is made. These six unmodified1972×1368 JPEGs are actual Device Hub window captures, not full-resolution app-only captures or composited layouts.

## Earlier count-positioning probe — still unaccepted

Before the voice case, a supported long-title fixture changed only the first deck name and saved Spanish Barrio Light preferences. The baseline backup's nine application-state fields, deck hash and event payload were compared with the current phone before use. Supported clipboard preview showed48decks/1402cards/10observations; full-state restore and cold PID94829 applied it.

At maximum Text11 with VoiceOver/Capture Keyboard off, a fractional AX-targeted row scroll reached the beginning of the long title. Targeting the following Browse button reached a viewport with the count above the status bar; small reverse scrolling did not reveal the complete count. One reverse attempt used an identifier renumbered by a full-tree refresh; it was rejected as acceptance and fresh targets were used afterward. Neither captured title clicks nor the previously failed captured-app drag was repeated. The Controls menu exposes no scroll action; its exposed Cancel action closed it. This adds route-limit information, not a clipping diagnosis or visual pass. Spanish maximum counts in both themes remain open; do not repeat these adjacent-target fractional calls unchanged.

Supported exact baseline restore and cold PID95062 recovered all eleven original records before voice. No incidental deck open, grade or new event occurred. The host-only fixtures/backups remain outside the repository.

## State protection, cleanup and verification

[Five read-only checkpoints](state.json) show only deck/prefs differences in the fixture. The restored-cold, take-ready and final checkpoints match **all eleven original hashes**,48decks/1402cards/10events, the original plan/session and no journal. [Own-path validation](preflight.json) confirms the exact container; the collector also validates it for each checkpoint. No direct storage writes were used.

[OS/file observations](os.json) record one granted take before Delete, then no microphone row and zero take files after cleanup. App Delete removed the take; supported simulator privacy reset restored the original unasked decision. Text3/Light/VoiceOver off/Capture Keyboard off returned unchanged, with the original Classic Spanish preferences. Back returned Home, the sole simulator shut down, Metro stopped, QA documents were saved/closed and idle TextEdit/Device Hub exited. No unrelated document/app or simulator contents were removed.

[Process/image metadata](verification.json) records the observations above. Run `python3 docs/qa/2026-10-19-active-capture-text/verify-state.py` for passive consistency of saved hashes and metadata; it cannot replay native actions or independently certify historical processes, pixel readability or audio quality. No actual recordings are committed. Required CI evaluates the committed candidate; no broad local product tests are repeated on unchanged source. All five packages and127 unchecked requirements/29overlapping groups remain open.
