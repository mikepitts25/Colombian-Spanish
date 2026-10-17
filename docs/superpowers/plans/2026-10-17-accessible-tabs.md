# Accessible tab navigation and native refresh fixtures

Base a392458. Continue existing B08 large-text acceptance and close the prior B02.6 startup-fixture minor. Reuse managed worktree and iOS27 dedicated QA app.

## Contract

All four translated navigation labels must remain visible and tappable at accessibility text sizes. Use a two-row tab layout when fontScale is at least 1.4, retaining the same destinations, selected semantics and ordinary layout below that boundary. Respect live font-size changes. No font-scale cap or hidden labels. Preserve study state. This bounded fix addresses reproduced clipping; Home content layout, full activity coverage, Android/tablet/signed/physical acceptance remain open.

## Work

- [x] Capture native Spanish accessibility-large clipping before product changes.
- [x] Complete four native startup AppState fixtures (null/active/inactive/background); characterize existing correct implementation without changing it.
- [x] Correct tab wrapping and verify Spanish/English accessibility-large, largest supported size and default-size restoration through native UI. Native screenshots are the layout regression gate; Jest has no text-layout engine, so do not mirror style declarations with tests.
- [ ] Full suite/static/content/calendar checks, one independent whole-package review, update master/QA, merge/push and observe CI.

Ruling: existing B08 text-accessibility correction is authorized, so proceed with two-row layout rather than adding a product flow or seeking another approval. Cost if wrong: taller bottom navigation reduces content viewport at large sizes; scrollability/native evidence must be checked. Do not mark broader accessibility acceptance complete.

Native follow-up: live decrease reproduced stale tab measurements; key the tab pill by fontScale to remeasure, without remounting navigator/screens. Both languages at accessibility-large/maximum and default restoration verified. Original content size large and Spanish restored; queue/counters/events unchanged. Broader Home/Settings/Study content defects remain recorded in QA.
