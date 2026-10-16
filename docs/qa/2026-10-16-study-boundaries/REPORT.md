# External study-session boundaries

Base `c4a5b88`, master task B02.4-B2. This batch fixes demonstrated session ownership/order failures; it does not close the broader relearning, interruption or device audit.

## Reproduced failures

1. A deferred grade of hola completed after the provider selected the Technology deck. Celular initially appeared, then vanished when the old grade replaced its IDs. Controlled test observed RED before the fix.
2. A new deck checkpoint started while the old grade was unresolved. Grading first enters the learning-history coordinator, so a newer direct storage checkpoint must wait to preserve intent order. Controlled ordering test observed RED.
3. Leaving the screen while a checkpoint waited for the old grade allowed that deferred checkpoint to overwrite a later screen's resume pointer. Dedicated unmount test observed RED before adding disposal invalidation.
4. Native baseline: the iOS27 app still held the previous bundle in memory because Metro had exited between turns. Its bounded Travel queue had five members and limits6/5. Selecting Business in Settings → Manage Decks kept that same session ID and limits instead of creating a separate ordinary session. This is retained as pre-fix native evidence, not a fixed-build pass.

## Correction

Track the queue's deck owner, invalidate stale UI/retry work on provider-driven deck changes, and assign a fresh session identity with ordinary limits. Explicit starts/resumes keep their own identity and limits; the selected region is retained. A new checkpoint awaits the active grade settling before writing. Unmount invalidates waiting checkpoints. Existing durable grading and event semantics remain unchanged.

## Current verification

51 StudyScreen tests and the complete 79 suites/777 tests passed, alongside types/lint, calendar 16 and content checks. Added cases cover late success/failure, multiple switches, bounded identity/limits and leaving the screen. One fresh independent whole-package review found no actionable findings. Corrected-bundle native navigation and cold resume passed; integration and CI are recorded below.

## Native boundaries

Dedicated iOS27 device0E1EFA92-01A8-46F6-BAB7-1D20B9F91ED8, own unsigned SDK57 binary, worktree Metro8098. Verify server liveness and cold-reload the bundle before new UI evidence. Deterministic pending-grade timing is covered by controlled tests; no native fault-injection pass is claimed. The existing unsigned notification entitlement warning remains outside this fix. Android/signed/physical and broader scheduler audits remain open.

## Corrected native result

Metro was restarted with IPv4 localhost resolution on port 8098; server status was running and the app was terminated/launched to fetch the corrected bundle. Starting the bounded Travel recommendation produced five remaining cards with limits 6 total / 5 new. Selecting Business through Settings → Manage Decks created a different session identity, nine cards (1800–1808), region all and no inherited bounded limits. Study displayed Business, nine remaining and jefe/a.

After terminating and launching the app again, Study → Continue Business restored the same nine IDs, first card 1800 and exact Business session identity. Daily count/new count stayed 1, target 5, event count 1 and library count 1392. [Read-only state evidence](native-state-check.json), [external switch screenshot](business-external-switch.png), [cold resume screenshot](business-cold-resume.png). No storage files were modified to create these results.

## Integration

Implementation `73b9407` was merged and pushed to main. The merged tree passed all 79 suites / 777 tests. Final worktree types, lint, format and diff checks passed; calendar 16 and content validation passed. [CI38961900481](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38961900481) passed all four jobs, including quality/tests/content and both platform project generation/production JS exports. These export jobs do not establish native Android compilation or signed/physical acceptance. Broader master B02.4-B2 remains open.
