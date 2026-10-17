# Learner fixture coverage

Base: `7c8afbe`. Scope: B12.1 fixture establishment, not platform acceptance.

- [x] Add a repeatable 100-deck / 10,000-card returning-library fixture through the real provider, grade transaction and portable backup. Include due/new/future/difficult cards and long Unicode content. Assert exact preservation across remount, one grade and restore.
- [x] Map every named B12.1 fixture to concrete assertions and native OS/build evidence; add a focused command. Leave untested native scale/performance and device gates open.
- [x] Run focused/full quality checks, request fresh whole-branch review and update checklist.

Integration: merge/push main after these gates; verify the resulting CI separately.

No production behavior change is planned. Existing behavior may pass the characterization tests initially; do not manufacture a product fix. No simulator storage injection, security work, license acceptance or audio subsystem implementation. The existing dedicated mini simulator remains available for normal UI checks, but this batch does not claim native 10,000-card performance.
