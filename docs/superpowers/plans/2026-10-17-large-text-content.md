# Large-text content corrections

Base563b8e7; master B08.2-B2. Existing observed failures: Home/Settings retain stale native text heights after live Dynamic Type changes; Home due title breaks words at maximum size; fixed80-point Study category cards clip scaled text.

## Contract

Refresh only native scroll-content measurements on fontScale changes, keeping screen hooks/navigation/provider and session state mounted. Home renders a prominent count and separately sized, fully scaled translated due unit at large text, with stacked header/goal rows. Settings rows and backup-preview state remain available. Study landing categories use content-driven heights, full labels and one column at large text; search state stays in the screen and pending grades/sessions are not remounted.

Ruling: these are authorized corrections to existing B08 accessibility behavior, not a new product flow. Cost: font changes reset affected scroll offsets; preserve form/search/backup/session values and pending writes. Do not remount the navigator or screen.

## Tasks

- [x] Reproduce native before states and pass targeted baseline; add preservation regressions for search and backup preview/pending actions across font changes. Native screenshots establish glyph-layout RED; avoid style-mirroring Jest tests.
- [x] Correct the narrow layout/measurement failures. Verify Spanish/English default/large/maximum live transitions, full category actions and underlying learning state. Larger activity/screen-reader/platform acceptance remains open.
- [ ] Full/static/calendar/content checks, one fresh whole-package review; update master/QA, merge/push under standing authorization, verify CI.
