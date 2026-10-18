# Barrio control consistency — B08.2-B20/B21

The approved foundation’s two deferred polish items now have implementation and independent review on `codex/barrio-control-consistency` (runtime `e72ae87`, test-import cleanup `592971a`). Merged/pushed in [PR12](https://github.com/mikepitts25/Colombian-Spanish/pull/12), merge `3559f49`, after all four candidate CI checks passed (run39126945480).

Quiz Next/Finish uses the existing Barrio pressed/disabled surface and ink. The existing advance guard already prevents duplicate Finish requests; saving state now mirrors that guarded operation, so a held result save also exposes disabled/busy semantics. Failure still retains the same session/answer for deliberate retry. No persistence operation was added. Classic colors remain unchanged.

Home word-of-day, Study search results and Phrases audio actions use the existing monoline asset in Barrio. Classic keeps the original glyph, size and scaling. Home/Study gain translated names containing the actual phrase. Existing callback, route and favorite behavior remains; source-deck schedules and learning credit are unaffected by icon changes. The Home/Study icon surface uses the existing audio surface/ink pair; that actual pair is added to the audit.

## Software and review

- Four real screen regressions were observed RED then GREEN; 4 focused suites / 116 tests pass. Held Finish checks pressed/disabled paint, one result write despite duplicate press, and Classic paint through a live identity change. All three audio route tests cover glyph roundtrip and actual playback callback.
- Full suite: **115 suites / 1,095 tests**, plus types and zero-warning lint. Initial lint caught an unused test import after replacing its helper; removed, then lint/typecheck pass. Existing asynchronous Study `act` warnings remain.
- Source audit: **255 literals / 418 composited pairs / 63 preserved Classic exceptions / zero Barrio failures**. The three added evaluations cover the actual audio surface pair in Classic and both Barrio appearances.
- One independent read-only reviewer found no Critical, Important or Minor issues and independently passed the four focused suites / 116 tests. The reviewer checked Finish rejection/retry/duplicate boundaries, Classic glyph/paint retention, semantic audio backgrounds, names and absence of theme remount keys. Native/assistive/platform acceptance and blocked security were not certified by that review.

Logs are in `software/`. Initial exploratory test runs also exposed a test-helper rerender contract and two test selector/expected-value mistakes; those were corrected before the recorded four-failure RED run. No acceptance was weakened and no tests were disabled.

## Native checks

Reused the already rebuilt unsigned iOS Debug binary on the fresh own-container iPhone SE 3 / iOS26 `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730`, with explicit before/after launch and cold preflights. Only this fresh QA device was operated in this batch; original sources and known aliases were not operated. All UI actions used CUA; storage captures are read-only.

The first attempted 8099 runtime resolved Expo AppEntry through a shared `node_modules` symlink to the previous main checkout. This was detected because Home still exposed the old emoji-only AX name; no new-code native success was claimed from that attempt. Stopped only that new server, replaced the symlink with a local APFS dependency clone, restarted cache-cleared 8099 and relaunched with `-RCT_jsLocation 127.0.0.1:8099`. The new native `Escuchar: tinto` name confirmed the correct checkout; the original normal 8098 server/worktree was preserved.

Observed:

- Classic Home retains its audio emoji; Barrio Light Home word-of-day, Study search `hola` and Weather Phrases show the shared readable audio icon.
- Home’s named play action invoked playback. Phrases retains separately named play/save actions. Study’s native AX representation combines the inner audio name into the result row; full assistive action separation is not claimed.
- Quiz question1/7 `Hola 6` → `Hello 6` records one checked recognition answer. Native Next advances to question2/7 without another observation. Its action was accessibility-positioned; the captured feedback image shows the upper question/options, not the lower Next control. No native held-save/failure injection or pressed-frame capture was performed; those state colors have the real screen held-write regression above.
- Before quiz activity, only the intentional Barrio/Light preference pair differs. After one answer, only preferences, streak and learning-event records differ; exact deck schedules, saved Study queue and the other records remain unchanged. The Next action adds no second observation.
- The first supported import restored ten records, but retained the extra QA observation. Inspection confirmed that every import mode intentionally merges learning history; the failed exact-restore snapshot is preserved as `phone-restore-merges-events-cold`. This is existing behavior, not a control regression.
- Before cleaning this disposable QA app, an exact current-state v3 backup was verified against all 11 records (417,814 bytes, SHA256 `2bf72eb4c97c46040bbc62918476e72a5cb76fde9ff3c7a314bbb3adf7c11950`; metadata in `reinstall-backup.json`). Only the fresh QA app was reinstalled. Supported clipboard import of the preserved original 48-deck / 1,402-card / 10-observation fixture into the empty store, followed by cold restart, restores **all 11 logical records exactly** to baseline (`phone-final-clean-cold`). Final preferences retain the original Classic default/Spanish; OS Light/default text remain unchanged. No direct app-storage writes; original source devices were untouched. Device permissions are not restored by import.

Five screenshots and six logical-state snapshots are recorded. Unsigned notification keychain-entitlement banners recur; some captures retain that debug banner. They are not notification-delivery acceptance. Playback start is not proof of audibility. Dark/maximum-text, tablet, signed, Android and physical/assistive acceptance remain in their broader checklist items.

Run `python3 docs/qa/2026-10-18-barrio-controls/verify-evidence.py` for passive evidence checks. The master checklist tracks integration status and broader remaining AI/human work. Security B01.8-C2g remains access-blocked and was skipped.
