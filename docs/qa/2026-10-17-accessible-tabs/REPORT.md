# Accessible tabs — October 17, 2026

Base a392458; B08 text-accessibility continuation and B02.6 startup-fixture follow-up.

## Reproduction

Dedicated own iPhone18 Pro / iOS27 simulator 0E1EFA92-01A8-46F6-BAB7-1D20B9F91ED8, existing SDK57 debug binary, worktree Metro8098. At accessibility-large text, four equal columns clipped Spanish tab labels. The before screenshot includes the existing unsigned notification entitlement banner, but clipped labels are visible above it. Home also wraps its oversized due headline poorly; broader content layout acceptance stays open.

## Correction and checks

Navigation wraps into two rows at fontScale >=1.4, keeping all four destinations and their full translated accessible labels/selection semantics. Text scales without a cap; decorative emoji retain their base size to preserve the content viewport. Default text keeps the existing four-column row. Native screenshots verify Spanish/English accessibility-large and maximum-size labels, working Study/Progress/Settings actions and live return to the default four-column row. A second observed failure during live resizing retained stale measured tab geometry and pushed destinations offscreen. Recreating only the tab pill when fontScale changes corrects that; navigation screen state remains outside the remount. Screenshots are the layout gate because Jest does not render native glyph geometry.

Four fixtures explicitly assign native null/active/inactive/background startup values and verify minute refresh or suspension plus active-event catch-up. The original Jest mock supplied a function, so fixture setup uses a restored property descriptor. These characterize correct existing behavior; no product refresh code changed. Relevant hook/navigation tests pass16/16. Full 80 suites / 785 tests, calendar16, types/lint/content passed; final exact-tree full 80/785 and calendar16 also passed, with types/lint/format/diff checks. Unchanged tests still emit act warnings; all suites passed.

## Boundaries

This batch does not complete full-screen large-text, screen-reader, smaller phone/tablet, Android, theme, signed or physical acceptance. Full screen content remains problematic: Home due-title word wrapping, stale native text measurements after live font changes, Settings rows and Study category tiles need dedicated layout corrections. Those are observed open defects, not an accessibility pass. One fresh independent review found no critical/important findings. Its documentation-progress minor is addressed by this final record; integration results are recorded below.

## Evidence and restoration

[Spanish before](spanish-before.png), [Spanish accessibility-large](spanish-accessibility-large.png), [Spanish maximum after cold launch](spanish-maximum.png), [live-size failure before measurement reset](live-size-before.png), [Spanish maximum after live increase](spanish-maximum-live.png), [English accessibility-large live](english-accessibility-large-live.png), [English maximum Progress](english-maximum-progress.png), [English default restored](english-default-restored.png), [Spanish default restored](spanish-default-restored.png).

Simulator content-size category was restored to its original large; interface language restored to Spanish. No grading occurred in this batch. Read-only [state evidence](native-state-check.json) retains daily/new count1, target5, two events,1392 cards and the exact Business eight-card queue/session identity.

## Review rulings

- Existing screen-content clipping remains open; fixing every screen is separate B08 work. Cost: those screens still need large-text corrections.
- Smaller phone, landscape, tablet, Android, signed and physical acceptance remains open because no corresponding native evidence was collected. Cost: these configurations remain unverified.
- Screen-reader focus continuity during live size changes remains open; accessible labels/selection in source do not establish assistive-technology behavior. Cost: that focus behavior remains unverified.
- Full activity/study usability with the smaller viewport remains open; tab navigation and preserved session identity do not establish every exercise's usability. Cost: those interactions need their own acceptance pass.

## Integration

Implementation `67a0151` merged/pushed to main. The merged tree passed 80 suites / 785 tests. [CI39008778017](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39008778017) passed all four jobs, including quality/tests/content and both platform project generation/production JS exports. Export success is not Android native compilation or signed/physical acceptance. B08.2-B1 and B02.6-C1 are complete; B08.2-B2 explicitly tracks observed screen-content defects.
