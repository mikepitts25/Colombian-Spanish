# Supported local-state backup acceptance

October 15, 2026. Base `1445ae4`. B11.1-B / B11.2-B2a.

## Delivered behavior

Version-3 file backups coherently capture decks, learning events, preferences, daily progress/goal, canonical streak (with legacy-key fallback), seen-word history, ten recent quiz rounds, notification preferences and the stored session pointer. Validation rejects malformed or unsupported state before any restore writes. Unknown supplemental state fields are rejected; the format does not accept arbitrary storage-key writes.

A full-height, scrollable in-app preview distinguishes Add new cards, Replace decks, Restore app state and Cancel. Only Restore app state replaces supplemental state. Deck/history and supplemental values share one durable journal, with absolute after-images replayed before future storage access. Learning events continue merging so newer retained observations survive. Missing source values restore documented defaults instead of retaining unrelated target values; canonical empty streak prevents legacy-key resurrection. Restart reloads contexts and reconciles reminder schedules through the existing no-permission-prompt launch path.

Legacy unversioned/1/2 file/clipboard imports remain compatible. Clipboard export stays version 2; version-3 clipboard input uses the in-app preview. OS permissions, scheduled OS notifications, downloaded/bundled media and cache files are not part of portable application state. No permission grant or provider call is performed by restore. Saved session pointer does not imply exact full-queue restoration.

## Automated and review evidence

Baseline 49 suites / 496 tests. Final **50 suites / 511 tests passed**, plus TypeScript, ESLint, formatting, data validation and unchanged deterministic inventory (47 decks / 1,392 cards / 1,392 audio entries). New snapshot/restore and UI tests failed before the implementation. Regressions cover all state sections, invalid state rejection, exact/absent values, legacy streak, corrupt source preservation, explicit restore choice, clipboard preview and interrupted replay. Independent review found no actionable findings and passed 72 targeted tests. Follow-up layout-only changes retain the guarded controls and pass Settings' 59 tests.

## iOS simulator evidence

Dedicated iPhone 16 Pro / iOS 26.0 QA simulator, Expo Go 54.0.7. Native Save to Files produced a 375,169-byte version-3 JSON with all seven supplemental sections, 47 decks, 1,392 cards and eight learning events. Native selection opened the preview with all four actions visible after expanding it to use the Settings area. [Preview](01-full-preview.png).

Restore app state completed with explicit restart guidance. [Confirmation](02-restored.png). After terminating/reopening Expo Go, read-only local storage inspection confirmed prefs, daily progress, streak, seen words, quiz history and last session matched the saved file exactly; absent notification preferences became defaults. No pending journal remained. Home retained 3/5 and seven new cards available. This restored the just-exported QA state; no unrelated simulator data was modified.

## Remaining boundaries

Controlled storage failure/replay is automated, not native low-storage interruption acceptance. Android/cloud providers, hardware share flows, native signing/compilation and physical durability remain open. Full-state restore intentionally replaces local counters/preferences and can rewind SRS, while event history merges; do not interpret counters as a reconstructed event ledger. Repeated non-idempotent edits and complete session-queue resume remain separate work. Privacy draft/inventory distinguish version-3 files from legacy clipboard omissions and OS/device state.

Implementation `8ae6250` was merged and pushed to main. [GitHub Actions run 38721570387](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38721570387) passed quality/content and iOS/Android project generation and production JavaScript bundles. Final local verification: 50 suites / 511 tests; iOS file export/app-state restore/restart accepted as documented.
