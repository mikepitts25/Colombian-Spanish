# Audio playback preferences

Bounded B06.1-A: honor the existing saved speechRate for card clips, card fallback and text speech; add a bilingual Settings screen with speed choices, save/retry, a fixed bundled pronunciation preview, explicit repeat/stop, and accurate generated/device-source feedback. Retain replay from existing card buttons. A preview may use an unsaved selection, but the UI labels saving separately. Loop applies only to bundled clips; device speech plays once. Read failure must offer retry without overwriting preferences. Leaving the screen cancels playback. No new network/service, automatic speech, authentic-human label, transcript assessment, downloaded packs or audio quality claim.

Use SDK54's setPlaybackRate and shouldCorrectPitch with conservative 0.5–1.5 saved rate bounds. Read preferences before starting, retain request identity across that async read/seek, and reject stale playback after newer requests or stop. If reading preferences fails during ordinary playback, use the established default without writing preferences. Preserve safe fallback and cleanup on player failure. Source metadata reports the actual selected backend rather than assuming a mapped clip played.

- [x] Failing service tests for saved rates, pitch/loop, fallback identity, read races/stop and failed preference reads.
- [x] Implement playback preference/request guards and an accessible bilingual Settings screen; test load/save/failure/stop/unmount behavior.
- [x] Full verification, one fresh review, regressions as needed, available iOS evidence.
- [ ] Accurate master updates, merge/push and CI.

API reference checked against installed expo-audio 1.1.1 declarations and https://docs.expo.dev/versions/v54.0.0/sdk/audio/ on 2026-10-15. Hardware intelligibility, audio routes/interruption and listening evidence remain open.

Evidence: 65 suites / 688 tests and static/content validation; one fresh review with no actionable issues. iOS save/preview/Stop/bilingual reopen and stored preference evidence recorded in docs/qa/2026-10-15-audio-preferences/REPORT.md.
