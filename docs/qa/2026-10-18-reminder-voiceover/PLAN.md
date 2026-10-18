# Reminder switch accessibility investigation

Base `0a226b5`; B08.6-A. Existing dedicated iPad mini QA simulator and Metro 8098. No new product behavior is assumed necessary before reproducing an actual focus/action failure.

- [x] Compare fresh default entry, live maximum resizing and fresh maximum entry accessibility output with visible controls.
- [x] Enable native VoiceOver/keyboard capture and compare actual focus rectangles and navigation actions with inspector output. Avoid changing reminder/OS permission choices during initial focus investigation.
- [x] If a reproducible app defect exists, pin/correct/verify it; otherwise record the supported narrower finding without inventing causality.
- [x] Restore VoiceOver, keyboard capture, text size and fixture preferences; verify read-only learning-state hashes and cold launch.
- [x] Update master checklist, independent review and format/diff checks.
- [ ] Owner-authorized merge/push and CI verification.
