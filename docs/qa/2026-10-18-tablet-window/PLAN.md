# Tablet reduced-window acceptance

Baseline `25ab8a0`; existing dedicated iPad Pro 13-inch / iPadOS 26 keyboard QA fixture, completed plan, original Spanish/largest text. No new feature or visual direction proposed.

1. Snapshot baseline, inspect actual native window controls, and attempt reversible window resize using CUA. Distinguish host canvas zoom from a changed app viewport.
2. At default and maximum native text, inspect Home/completed plan, Progress, Study and Settings in the reduced window. Exercise visible navigation and scroll controls without submitting grades or changing learning state. Record actual viewport evidence and tool gaps.
3. Restore full window and original preferences. Compare durable key hashes, queues, events and plan; no duplicate credit or state reset.
4. Fix only an observed reproducible application defect after diagnosis and appropriate regression evidence. Otherwise record acceptance/limits without speculative changes. Update the evidenced checklist scope, review, merge and push. Smaller physical screen, Android, all activities/themes and signed/hardware acceptance remain separate.

After unsuccessful window resizing, restore the original fixture (all eleven durable hashes must match), then create a fresh dedicated iPad mini A17 Pro / installed iPadOS 26.0 simulator. Validate fresh onboarding, default/largest text navigation and representative Study/Progress/Settings, ordinary restart and read-only state comparisons. This adds smaller-tablet evidence; it does not substitute for the still-open reduced-window test.

## Reproduced regression before implementation

Native failing case: fresh onboarding at text size 3 → live size 11 → accessible activation of travel option. Selected row rerendered, but other rows, hero and Next retained old native measurements and clipped labels (`mini-onboarding-live-selection-before.png`). Repeated screenshot remained broken. Terminate/relaunch at unchanged size 11 and select travel: fully measured wrapping and footer, isolating live text-size invalidation rather than a fixed small-tablet constraint. Onboarding, unlike the existing Home/Progress/Settings fixes, does not subscribe to fontScale or replace native measured subtrees. Apply that established bounded invalidation to scroll content and footer, retaining screen-level intent/step/saving state. Native reproduction is the regression check because Jest does not perform native text measurement; existing interaction/recovery tests still guard save/navigation behavior. No speculative visual redesign.
