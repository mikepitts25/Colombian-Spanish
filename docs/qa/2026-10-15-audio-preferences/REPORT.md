# Playback speed and preview — 15 October 2026

Dedicated Colombian Spanish Fresh QA iPhone 16 Pro simulator, iOS 26.0, Expo Go 54.0.7, local Metro development bundle. Branch `codex/audio-playback-preferences`, base `4eee146`. Not a hardware or signed-candidate result.

Observed UI: Settings opened **Preferencias de audio** in Spanish, loading the existing 0.98 rate. Selected 0.75×, saved, saw success. Enabled explicit clip repeat and previewed `buenos días`; backend result displayed **Fuente: clip generado**. Stop removed the source status. Returned to Settings, switched to English, reopened and saw 0.75× still selected, with repeat reset Off. Compact copy keeps Stop visible on this tested viewport (image 01). The source label reports a successful playback request, not a measured audible-quality or completion result.

Read-only storage confirmed speechRate 0.75, preserved work/Paisa/basic/10-minute/trip-date profile, daily count 1/target 5/newCount 1 and unchanged six total learning observations. Saving speed modifies only that preference; preview is not learning evidence. Saved rate was already a supported backup field, so no new migration or backup schema was introduced.

Automated service/UI checks cover saved clip and text-speech rates, pitch correction, explicit looping, single-play device fallback, invalid controls, failed preference reads, overlapping reads/seek, Stop while pending, stale completion suppression, mutable caller input, load/save failure and retry, separate preview/save, source labels and cleanup. Existing seek-race tests now await the actual seek-start boundary before interrupting, accounting for the new asynchronous preference read. One fresh review found no actionable issues.

Final local suite: 65 suites / 688 tests; types, lint, formatting, data/editorial validation and unchanged generated inventory. API use was checked against installed expo-audio 1.1.1 declarations and [Expo SDK 54 audio documentation](https://docs.expo.dev/versions/v54.0.0/sdk/audio/).

Remaining: phrase-level loop/transcript controls inside a listening activity, transcript-assisted comprehension observations, automatic speech preference behavior, accepted human recordings, downloads, background/interruption behavior, Android native UI, actual speaker/headphone/Bluetooth routes and human speed/intelligibility judgment. Device speech availability/offline quality depends on installed voices; fallback does not promise offline coverage or repeat.
