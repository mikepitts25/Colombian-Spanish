# Large-text content corrections — October 17, 2026

Base563b8e7; B08.2-B2. Existing iOS27 dedicated QA device, own SDK57 unsigned binary and Metro8098. Before screenshot records severe Home clipping after a live increase. Prior tab QA also records Settings stale text heights and Study fixed tile clipping.

## Correction

Key only Home/Settings scroll content and Study landing content by fontScale so native glyph heights are measured again, without remounting screens, provider, navigation or session hooks. Home separates the prominent due count from a translated, fully scaled unit at large text and stacks crowded header/goal rows. Study large-text categories have full labels, content-driven heights and one column. Decorative row/category emoji do not scale; teaching labels remain uncapped. Settings backup preview and busy guards remain in screen state outside the remount.

## Automated verification

Baseline133 targeted tests passed before new cases. The Home full-unit assertion failed before implementation. Added checks preserve landing search and pending backup-restore guards through font changes; targeted135 cases now included in full suite. The upstream RN Jest mock sets fontScale2; the project's default text fixture now explicitly uses1, with dedicated live-change cases at3 rather than accidentally exercising large layouts in default cases.

Full80 suites/787 tests passed, types/lint and content checks passed. The first full run exposed an unrelated wall-clock assumption in resetDeckProgressById: a reset was required to be less than100ms old when asserted. That test now checks that its timestamp falls between operation start/end, preserving the behavioral requirement. No product storage change. Calendar16 cases across four zones and final formatting passed. A fresh final full run again passed80/787. Existing unrelated act warnings remain.

## Native evidence

The dedicated iPhone18 Pro/iOS27 simulator exercised Spanish and English at default `large`, `accessibility-large`, and maximum `accessibility-extra-extra-extra-large`. Screenshots in this directory show Home, Settings and Study at those sizes. Default and large screens display whole lines after live transitions; maximum Home due units wrap as whole words (both `home-*-max-scrolled.png`). `study-es-max-scrolled.png` shows full category boundaries with the complete two-line Spanish label, while the English maximum initial viewport places category text below the fold. These are representative screen checks, not an exhaustive inspection of every category or setting row.

Native search retained `hola` and five results through a live increase to maximum. Category activation opened Colombian Slang with9 cards; Back returned to landing. Later scrolling gestures also activated a category/region, producing an empty Paisa queue. No grade was submitted: daily1/5, newCount1,2 observations and1392 cards remained unchanged. Consequently this run does **not** establish that the old Business queue survives category selection. That queue was subsequently restored using the app's own previously exported QA backup, with a cold restart; the final state snapshot records the outcome.

File workflow: exported the dedicated simulator's version3 backup through Save to Files, imported that same file into preview, and verified47 decks/1392 cards/2 observations. English preview survived default→maximum; Spanish preview survived maximum→default with the identical export timestamp. Cancel returned to Settings. Pending-restore timing and disabled controls are covered by a controlled regression test, not native fault injection. A later full-state import cleaned up the QA session changes; this is a normal restore, not interrupted-restore acceptance.

Device Hub's background gestures were ignored and fast swipes frequently reached the end of long pages. Raising/activating the window and stopping momentum allowed middle-content inspection. The OS file picker was slow on its first post-reboot load. Neither behavior was treated as an application regression. Default text size and Spanish were restored.

## Boundaries

Font changes intentionally reset affected scroll positions. Search/preview/busy/session state must persist. This batch does not close every activity layout, narrower/landscape/tablet/Android/signed/physical or screen-reader acceptance.

## Fresh review and rulings

One fresh whole-package review found no critical code issue and independently passed4 suites/186 tests. Its important finding was missing native acceptance evidence. The native checks above were completed afterward; the evidence is representative and its limits remain explicit. No second review was dispatched. No deferred minors.

- Ruling: remount only scroll content on font changes; retain screen/provider/navigation/session state. Cost: scroll position resets.
- Ruling: normalize the default Jest fixture to fontScale1 because RN's upstream mock uses2. Cost: large text requires explicit fixtures (new cases use3).
- Ruling: replace an unrelated100ms storage-test freshness assumption with operation start/end bounds. Cost: a wider valid timestamp interval; no product-storage change.
- Ruling: retain the bounded Home/Settings/landing correction scope rather than expanding into every activity, device, orientation or platform. Cost: existing session/region/resume-row maximum-size defects remain under B08.2-B and wider acceptance is still open.
- Ruling: native AX labels plus representative screenshots do not establish physical screen-reader behavior. Cost: hardware reading order/focus and touch interaction remain unverified.
- Ruling: category selection and backup business rules remain unchanged. Cost: selecting another category can replace the saved session; deterministic pending actions are unit-tested.

## Integration

Implementation commit, merged-main verification and CI will be appended after integration.
