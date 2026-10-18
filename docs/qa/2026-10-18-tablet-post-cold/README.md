# Tablet post-cold Home follow-up — B08.2-B22/B23

Runtime `3b9b62b` corrects a reproduced maximum-text Home clipping defect and clarifies existing backup behavior in both languages. Integration remains pending.

## Reproduction and correction

On fresh own-container iPad mini / iPadOS26 `F9BC32B5-9591-4CEA-9363-707D3A7E204D`, Barrio Dark / Spanish / OS Light, changed native Text Size3→11. A coordinate drag `[1100,960]→[1100,370]` in Device Hub reached lower Home content. `home-max-lower.png` shows the original right-clipped “Ver todos los decks”. The row placed two unbounded children side by side at maximum scale.

The correction reuses the existing stacked-header layout at large text, lets both children shrink at other sizes and gives the large-text browse action a minimum48-point height and button role. Colors, fonts, theme identity and navigation callback remain. No learning/storage behavior changed. These reversible layout/copy changes use existing tests and direct native reproduction; no implementation-mirroring style tests were added.

Restarted only the new8099 Metro server cache-cleared, then explicitly preflighted/terminated/launched the tablet app on that runtime. Initially Device Hub showed the rendered app but exposed no app AX subtree and coordinate dragging did not move content. Selecting another device and returning did not repair it. Standard Simulator was unavailable in the local tool/app inventory. Device Hub Controls→Home then a coordinate tap on the QA app icon restored the app AX subtree and touch response. This establishes a practical recovery path; the underlying attachment/foreground cause was not established. Cold-launch data checks remain distinct from immediate input readiness.

After that reopen, the same coordinate drag reached `home-max-lower-fixed.png`: full heading, subtitle and complete browse label. A coordinate tap `[850,801]` opened Study's category/search browser. No queue was started, answered or graded. A coordinate Settings tab tap worked; one Settings drag did not move its content, so full Settings touch-scrolling acceptance remains open. Restored native Text Size11→3 afterward.

## Backup wording

All three restore choices already share the learning-history merge path; replacing supplemental app state does not erase newer observations. The preview previously said “both modes”. Spanish and English now say every option merges history and keeps newer local observations. This changes explanation only; existing destructive/recovery boundaries remain intact.

Native clipboard preview initially reported an empty simulator clipboard. Sent the preserved phone QA fixture through Device Hub's supported clipboard action, allowed paste, and verified the new Spanish explanation with all three choices (`backup-preview-es.png`). Cancelled the preview without restoring. Returned Home. English was source/review checked, not claimed as a native capture.

## Validation and limits

- Four existing Home/Settings/backupRestore/portableBackup suites:122 tests pass, independently rerun by a read-only reviewer. No Critical, Important or Minor findings.
- Types, zero-warning lint and formatting pass; full suite:115 suites/1,095 tests. Candidate CI and final integration results are recorded with publication.
- Source color audit unchanged:255 literals,418 composited pairs,63 preserved Classic exceptions,zero errors.
- Three read-only state snapshots:48 decks/1,402 cards/11 observations, all11 logical record hashes identical before, after fixed cold launch, and final default-text Home. Own-container checks before/after each launch. No journal. The saved Barrio/Dark pair remains exactly as it was; original source devices/aliases were not operated.
- Reviewer declined independent native/coordinate verification (handled here); full matrix, assistive technology, signed builds, Android and security were outside this scoped review and remain open. Security B01.8-C2g was skipped. Home touch success does not establish full route/platform/physical acceptance. Existing unsigned notification-entitlement banners were dismissed before the corrected capture.

Run `python3 docs/qa/2026-10-18-tablet-post-cold/verify-evidence.py` for passive snapshot/image checks. This bounded check advances the tablet matrix; it does not close B08.5-B or B05 keyboard/activity coverage.
