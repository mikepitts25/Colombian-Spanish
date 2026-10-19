# Local unreadable-file cancellation and recovery

October 19, 2026, source main `8fb6ffa3`; Package 4 / B12.6-E. Own-path iPad mini A17 Pro / iPadOS 26, SDK 57 development install `DF3686C1-A2E7-4870-B127-A83A8B67541D`, unchanged JS on Metro 8099. No product, native or dependency changes. This bounded check reuses the completed [local Files collision](../2026-10-19-files-collision/README.md) and [reinstall/restore](../2026-10-19-mini-reinstall-restore/README.md) evidence.

## Actual outcome

One disposable product-generated QA backup, `741 2.json`, was temporarily changed from POSIX mode 0644 to 0000 in the mini's actual File Provider Storage. Its bytes were first hashed and copied to a host-only recovery location. The original recovery backup was never changed. A 240-second automatic restoration guard covered the attempt; explicit restoration occurred after about 45 seconds. [Fault metadata](fault.json) records host effective UID 501, actual read rejection with errno 13, and restored mode/hash.

Selecting its visible tile through Settings → Import backup file → native Recents left the [native picker open](restricted-outcome.jpg), without a preview or visible app error, across two observations. This is a staged local unreadable-file result. It does **not** establish the app's rejected-promise alert path, a cloud-provider outage or network/storage-pressure behavior. No native error message or low-level picker error code was captured; host EACCES is not claimed as an app-returned error.

The native picker close button returned to [enabled backup controls](restricted-cancel.jpg). After restoring 0644, selecting the **same file** in a newly opened picker reached the [correct Spanish preview](restored-preview.jpg): exported `2026-10-19T20:51:11.701Z`, 48 decks / 1,402 cards / 11 observations. The [full preview AX](restored-preview.txt) corroborates the timestamp/counts. Cancel returned without applying Restore, Add or Replace. This recovery retry is tied to the fault; basic picker success is not counted again as a new capability.

## Preservation and cleanup

[Six read-only app checkpoints](state.json) preserve all eleven original hashes, 48 decks / 1,402 cards / 11 events and no write journal, matching the final English-editor recovery baseline. No direct app-storage write, grade, session creation or backup import occurred. [Two fresh preflights](preflights.json) resolve the correct current container `47425600-1B02-4C30-AB30-F272312DD80E`. Cold launch changed PID 20293 → 20922 and showed the [Spanish Barrio Dark Home](cold-home.jpg). Its known unsigned-notifications diagnostic banner remains visible; this check does not resolve it. The post-relaunch app AX subtree was absent, so the cold view is screenshot evidence, not an AX-label assertion.

[Final provider inventory](files-after.json) retains the same four names, byte hashes and export times as the prior collision packet; the staged file returns to 0644 with its original SHA-256. Raw backups remain host-only. [Verification metadata](verification.json) includes four unmodified 1972×1368 JPEG hashes and sole-mini booted inventory before shutdown, followed by an empty inventory. The mini, owned Metro and idle Device Hub were stopped. Native Light / Text 3 / portrait / VoiceOver off / keyboard capture off were unchanged. No unrelated app, document or simulator was operated.

## Acceptance boundary

B12.6-E closes only local restricted-file picker cancellation, restored-file retry and exact-state recovery. App-level provider error handling, cloud access, network/low-storage behavior, different-version upgrade, Android, signed builds and physical-device checks stay open. All five packages and 127 unchecked parent/requirement rows in 29 overlapping groups remain open.

Run `python3 docs/qa/2026-10-19-provider-read/verify-state.py` for passive artifact consistency. It does not replay the fault, picker or native UI. This evidence-only update does not repeat the broad local product suite; candidate CI checks the actual committed head.
