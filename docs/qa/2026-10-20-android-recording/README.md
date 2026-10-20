# Android already-granted microphone cancellation fix

October20,2026; base main `c9402c3`. This fixes the diagnosed permission-loop defect left open by PR65. It does **not** close Android capture/Stop/Replay/Delete or any of the five broader QA packages.

## Reproduced cause and minimal change

The same installed SDK57 development APK and dedicated API36 AVD were reused, with fresh JS processes against current Metro. Temporary diagnostics recorded controller entry, permission return and AppState transitions, without recording audio or learning content. On Record with the microphone already granted, the [actual native trace](granted-request-trace.json) shows requesting → background → active → permission granted → idle. The permission Activity backgrounds the app even when granted, causing the existing safety handler to cancel capture. This establishes why repeated taps stayed Ready; it was not a missing grant.

The voice service now reads `getRecordingPermissionsAsync()` first and returns an existing grant directly. Ungranted access still uses the explicit permission request. Permission failures still reject; no fallback grant, automatic background recording, permission reset or lifecycle-handler change was introduced. Opening the screen still does not request access. Returning from a first permission prompt can still require an explicit retry because real background transitions remain safety cancellations.

A regression simulates Android's request-induced background event through the real VoicePractice controller/service boundary. The old code [fails to begin capture](regression-red.txt); the fix makes the same test pass. A second case preserves explicit request/denial for ungranted access. [All three focused voice suites pass:29 tests](focused-green.txt), including existing background suspension and cleanup cases. Typecheck and lint pass. No broad local suite, passed iOS cells or native rebuild was repeated; CI supplies the required full regression.

All temporary tracing was removed before testing the final runtime. The only product change is the permission preflight in the voice service; no controller, screen, theme, storage, dependencies or native permission config changed.

## Native boundary and host failure

The normal fixed process initially showed the existing saved-progress Retry screen while a read-only SQLite snapshot was being collected. Retry recovered Home without resetting data. The cause of that startup observation was not diagnosed; concurrent database inspection is not treated as proof of a product defect. Subsequent native reads should wait for settled Home. No recovery/reset success beyond the visible Retry is inferred.

With the fixed normal source, Record now reaches [Preparing microphone](fixed-preparing.jpg), rather than canceling itself back to Ready. That is the bounded native improvement established here. No settled Recording state or take was observed.

The emulator then hung and exited. A [sanitized macOS crash summary](host-crash-summary.json) records the QEMU hang detector/segmentation fault and a thread in CoreAudio input initialization. Studio additionally logged hanging QEMU main/CPU threads. This is host-emulator evidence, not an Android app crash or proven audio quality.

One changed workaround was attempted: disable only this AVD's `hw.audioInput` as described in [Android's official emulator troubleshooting](https://developer.android.com/studio/run/emulator-troubleshooting). That restart also explicitly reported a hanging QEMU thread and never connected to adb. It was terminated; the original AVD config was restored byte-for-byte. No unchanged recording crash loop, SDK update, new agreement, system microphone permission or audio device change was attempted. Native capture/Stop/Replay/Delete stays open pending a working emulator audio route or device evidence; do not repeat this host-audio route unchanged.

## State, resource and remaining-work limits

The [runtime inventory](runtime-inventory.jsonl) sampled both platforms every two seconds: empty or our dedicated Android runtime only, no collisions. Sampling does not prove that transient overlap was impossible. Both device inventories were empty before boot; no other runtime was operated. Host audio workaround configuration is restored, and the owned emulator/Metro/Studio/monitor processes are stopped.

Learning storage was read only, not edited; no new grade was submitted. No final post-crash state snapshot or Spanish/permission restoration was established. The last known profile remains English/Barrio Light with the retained one-event/nine-card session; recheck saved state and microphone permission after a stable cold boot. Cache-only trace diagnostics may remain on the dedicated AVD, but final runtime source contains no diagnostics and no raw recording is committed.

B01.5-B6 closes the already-granted permission cancellation defect and its regression, with native progress only through Preparing. The broader Android row stays open for actual capture lifecycle, authored practice, provider export/restore, language/theme/accessibility and other named cases. Existing PR64/65 evidence is reused. Security remains skipped, unapproved features remain gated, and signed/human/physical acceptance is separate.
