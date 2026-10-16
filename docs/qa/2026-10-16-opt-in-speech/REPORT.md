# Opt-in flashcard pronunciation — 2026-10-16

B06.1-B2 exposes the existing `autoSpeak` preference in bilingual audio settings, default Off, saved together with speed. The text explains the exact trigger: reveal a flashcard answer. Opening Study, restarting/resuming and returning to foreground never request automatic speech. Preferences/preview do not play merely from enabling or saving the switch. Preview remains explicit. A reachable Stop action sits beneath either card face.

An explicit reveal prepares a cancellable request and only executes it when the flip finishes. Stop, another flip, card change, blur, background and unmount invalidate pending reads/playback. Manual pronunciation remains available and cancels any earlier automatic request. Failed optional speech leaves the card usable. Playback continues to use the shared saved-speed service; learning events, SRS and daily counts are untouched.

## Verification

- Initial tests failed for the absent switch/playback/Stop. Targeted tests then passed. Full regression initially exposed incomplete navigation/audio mocks in `StudyScreen.test.tsx` and `HomeWorkload.integration.test.tsx`; those mocks now include real lifecycle scheduling and Stop. All 70 suites / 725 tests passed after repairs. Types, lint, formatting, data/editorial checks and unchanged inventory export passed. Existing Study tests emit an asynchronous act warning; no test failures remain.
- A fresh whole-package review found an animation race: Stop during reveal could be followed by speech at animation completion, and flipping back did not cancel an unresolved read until its animation ended. Both were reproduced with failing tests, then fixed by creating/invalidation of requests at the explicit flip interaction. Final suite includes both regressions; no repeated review loop was used.
- Tests cover default silence, saved opt-in, one request per reveal, ordinary rerenders, Stop, flip-back, blur, background/foreground, unmount, animation completion and unchanged grading callbacks. Settings tests cover save/reopen, unsaved selection, failure/retry and no preview on enable.

## Native simulation

Dedicated iPhone 16 Pro / iOS 26 / Expo Go 54.0.7 (`121168CB-C271-4202-AC19-94F8DAE7B8B1`): settings showed Off at the existing 0.75× speed, enabled and saved successfully; Study resumed the Business queue, revealed manager from gerente and kept Stop plus all four grading controls visible. Stop was actionable. Cold process restart and reopening settings retained On/0.75×. Restored Off and saved it after QA. Home remained 0/5; no grading was performed.

These checks validate native UI, persistence and layout. Automated tests verify the speech requests/cancellation; simulator observation does not establish audibility, intelligibility, hardware route/interruption acceptance or real screen-reader usability. Physical B06.5 and accepted human recordings remain open.
