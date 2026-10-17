# Quiz large-text acceptance

Baseline `1cd6270`, existing isolated worktree and dedicated iPad mini / iPadOS 26 development fixture. Execute B08.2-B / B08.5-B remaining quiz coverage; keep security deferred and all human/account/device gates explicit.

1. Record native default/maximum landing and existing empty-pool behavior. If needed, grade one QA Study card through normal UI to establish a valid seen-word quiz pool; snapshot the exact baseline afterward.
2. Inspect actual live text changes, quiz options/feedback/completion and native control reachability. Diagnose observed failures before edits. Preserve question, choice, pending saves and learning-event semantics; no unsupported proficiency claims.
3. Apply only a reproduced correction using the established layouts and native measurement approach. Use native failing/passing evidence and meaningful state/pending-write regression tests; do not pretend Jest measures native text.
4. Verify bilingual representative layouts and exact event/counter effects, run full tests/static/content checks, update only evidenced checklist scope, obtain fresh review, merge/push and confirm CI.

Ruling: this is existing-control acceptance and defect correction, not a new feature or visual direction. The plan is the bounded brief; no independent new-subsystem spec is required. The prior merged tree is green (96 suites/932 tests and all CI jobs). No dependency install or simulator rebuild is needed because package/native code is unchanged.

Native RED: live 3→11 on empty quiz leaves region chips, copy and CTA clipped. Back/reopen at unchanged size11 measures correctly. Apply established fontScale subtree invalidation to all four quiz states; preserve screen-level question/answer/locks. Two new accessible-control regressions fail before implementation (missing region and answer roles) and pass after roles/selected/disabled semantics are added.

Second native RED: completion at size11 gives a narrow 220-point two-column stats block, breaking CORRECTAS/FALLADAS into character fragments (`completion-stats-largest-before.png`). Ruling: use full-width vertically stacked stats and horizontal divider at enlarged text, retaining default layout and all score logic. Native before/after verifies text geometry; do not add a Jest style-mirror assertion that cannot measure it.
