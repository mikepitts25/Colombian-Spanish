# Deck/card editing reliability and large text — 2026-10-18

Existing Add Card and Manage Decks could report missing-target writes as successful, lose a retained create identity across an uncertain save, overlap pending submissions, and leave rename/reset/delete failures unhandled. Live maximum text also clipped both forms. This bounded batch repairs these paths; it does not complete the broader learning, accessibility or platform matrix.

## Implementation and automated proof

- Coordinated card/deck creates use a stable local create identity. A recovered retry acknowledges existing content rather than overwriting later edits, grades, cards or names. New independent same-clock deck creates remain distinct. No existing IDs are migrated. Missing add/rename targets reject.
- Add Card and new-deck forms retain one exact pending snapshot, block overlapping controls/navigation and expose saving/error/exact retry. Return to editing retains the draft after explicitly warning that the unconfirmed change may already be saved.
- Management retains rename drafts and exact retry intent. Reset/delete catches failures, explains uncertainty and requires inspection plus a fresh confirmation; it never automatically replays a destructive change.
- Main forms and bounded modals scroll; owner state remains above font-keyed content. Named controls have at least 48-point targets. Large-text actions wrap/stack. Deck chooser New deck/Close actions now precede all 47 deck rows.

RED evidence: provider-red.log (four new cases), add-red.log (four), add-recovery-red.log (one), manage-red.log (four), rename-target-red.log (one). Final focused green.log: 3 suites / 44 tests. Final full-suite.log: **100 suites / 985 tests**. Types, lint, project data and editorial-ledger validation pass. All 1,392 cards still await human editorial acceptance. Independent whole-branch review found no Critical/Important issues; final chooser delta also reviewed before integration.

The real provider test interrupts the deck apply after journal creation, recovers through a real grade, makes a later edit, then retries the original card and proves one insertion with preserved grade/edit. Screen tests control provider promises to verify locks, errors and retries. These controlled tests are not native storage-fault injection.

## Native observations

Dedicated iPad mini A17 Pro / iPadOS 26.0 simulator E66076BE-D9F8-49FB-870F-F29B57C4CA40, existing unsigned SDK57 development app and Metro 8098. Other simulators untouched.

- add-es-max-before.png and manage-es-max-before.png reproduce live-text clipping before the fixes.
- add-es-max.png / add-en-max.png and manage-es-max.png / manage-en-max.png show readable maximum-text upper viewports after native Text Size 3→11.
- new-deck-es-max-draft.png shows a retained, wrapped unsaved draft and visible Cancel/Create controls after resizing. Device Hub autocorrect changed attempted synthetic input; the draft was canceled, never saved.
- rename-es-max.png shows the selected existing deck name retained in a maximum-text modal with visible Cancel/Save. Canceled without any write.
- Chooser New deck and Close were visibly reachable at default and maximum text after moving them to the list header.

Native UI was operated through Device Hub. The app accessibility subtree was omitted throughout this attempt; coordinate navigation worked. Wheel scrolling did not move the chooser. Keyboard capture and attempted select-all/paste did not produce the exact requested text. Therefore **native create/card-save/rename-save lifecycle, software-keyboard occlusion, full lower-content touch-only scrolling, and assistive announcements remain open**. No fixture deck/card was written or deleted; automated save tests provide the bounded write evidence. Unsaved drafts are not persisted across process death.

## State restoration

Restored Spanish, native Text Size 3, VoiceOver off and Capture Keyboard off. Native Light appearance/app dark palette unchanged. Normal termination/relaunch returned to Spanish Home; dismissed the known unsigned expo-notifications registration diagnostic. No notification permission requested.

Run `python3 docs/qa/2026-10-18-deck-card-editing/verify-state.py`. Five read-only storage snapshots show only SRS_PREFS_V1 differs during the temporary English check; final two snapshots restore **all eleven logical hashes**. Exact nine-card Weather queue/timestamp, four events, three quiz histories, daily count/new count 1, target 5, 1,392 cards and empty journal are preserved. No grade or learning credit added.

## Remaining scope

Native save/failure/keyboard/touch/assistive flows, narrow phones, Android, themes/windowing, signed/physical interruption and user acceptance remain open. Existing reset/delete provider post-commit read failure can be uncertain; UI requires a new deliberate confirmation, not an automatic retry. Security B01.8-C2g remains blocked by the owner-reported access error; no retry/bypass or security patch. Downloadable audio still awaits written design approval. No accounts/licenses/signing actions taken.

## Integration

Implementation `649618b61843913aba44bad5200a4ddb1d390b73` fast-forward merged and pushed to main. The merged checkout independently passes 100 suites / 985 tests. [CI39088071204](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39088071204) passes quality/content, iOS bundle/project generation, Android bundle/project generation and aggregate validation. [Board39088071107](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39088071107) succeeds. These generated native bundles do not establish Android emulator or physical-device acceptance.
