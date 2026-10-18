# Flagged Cards recovery and large text — 2026-10-18

Baseline `48bbe1f`. Repairs existing Flagged Cards failure handling and accessibility under B02.4-B2 / B08.2-B, without changing storage semantics or editorial acceptance.

## Fixes and automated evidence

- Clipboard rejection and clear-all rejection previously escaped the UI. Four focused regressions fail on the old implementation (`red.log`): rejected promises, duplicate export, duplicate confirmed clear. Now a synchronous owner ref guards one operation, disables both actions and blocks navigation while pending. Success follows the awaited clipboard acknowledgement. Failure is visible and permits another deliberate action.
- A failed clear is uncertain. Its error asks the learner to inspect the list; another clear requires a fresh confirmation. No destructive operation is automatically replayed. Clearing flags does not accept editorial content.
- Operation ownership survives font-keyed native content remeasurement. Mounted guards suppress late state changes/alerts; a fifth regression verifies removal during pending copy cannot show a late success alert.
- The header/actions/hint now scroll with the list, actions are named and at least 48 points, large-text controls stack, row numbers can grow and captions use existing readable semantic tokens. Empty wording states that no flags do not confirm translation review, in both languages.

Five focused tests pass; full suite **101 suites /990 tests**. Types, lint, data and editorial-ledger validation pass. The ledger still has all 1,392 cards awaiting human acceptance. Fresh whole-branch review found no Critical/Important issues and its unmount coverage suggestion was added and verified. Failure/pending scenarios use controlled clipboard/provider promises; they do not establish native storage-fault handling.

## Native checks

Dedicated iPad mini A17 Pro / iPadOS26 E66076BE-D9F8-49FB-870F-F29B57C4CA40, existing unsigned SDK57 app and Metro8098. CUA Device Hub used for all UI; app accessibility subtree remained omitted. No app-storage files were written directly.

- Settings→Manage Decks→Review→Flagged opened the existing **20 flagged cards**; no synthetic content or flag changes were needed (`es-default.png`).
- Pressed Copy CSV once. Native alert acknowledged 20 flagged cards (`es-copy-success.png`). This changed the simulator clipboard; no external spreadsheet was opened and no paste/content correction was performed. Native clipboard bytes were not separately read; exact CSV quoting/multiline snapshot is covered by the automated test.
- Text Size3→11 rendered Spanish header, count, readable hint and stacked actions (`es-max-header.png`). A coordinate upward drag with VoiceOver off reached the final row20; full wrapped content and scalable number were visible (`es-max-last-row.png`). No assistive auto-positioning used for that drag; intermediate rows were not individually inspected.
- At default text, opened Clear All confirmation naming20 cards, then selected **Cancel**. Existing flags were preserved; native confirmed clear/failure was not exercised against this library.
- Switched UI to English through Settings and reopened the route. Maximum-text heading/count/actions/hint were readable (`en-max-header.png`). Restored Spanish and native Text Size3 afterward.
- A rapid automated three-Back sequence produced a generic development warning and only returned to Manage Decks. Subsequent separately observed Back navigation returned to Settings and later routes worked. Warning details were not exposed by the banner interaction; broader rapid-navigation diagnostics remain open. Dismissed the overlay before final capture. No product fix is inferred from that limited observation.
- Normal terminate/relaunch returned to Spanish Home; dismissed the known unsigned notification-registration diagnostic. VoiceOver/Capture Keyboard off, native Light/app dark palette unchanged.

## State proof and limits

Run `python3 docs/qa/2026-10-18-flagged-recovery/verify-state.py`. Five read-only snapshots show only the temporary English SRS_PREFS_V1 change, then all **eleven logical key hashes restored through cold launch**. Library/flags, nine-card Weather queue/timestamp, four events, three quiz histories, daily/new counts1, goal5, streak and empty journal remain unchanged. No grading or editorial save occurred. Clipboard contents are outside these app-storage hashes.

Native empty-state rendering, controlled native rejected writes, full touch/assistive/narrow/theme/platform acceptance and the rapid-navigation diagnostic remain open in their broad parents. The empty-state copy is changed without pretending the existing flagged list is empty. Security B01.8-C2g remains blocked and was not retried. Downloadable audio approval, Android licensing, recordings/accounts/signing and physical/human acceptance remain separate.

Prior evidence commit48bbe1f is merged/pushed and its CI39089097184 and board39089097162 succeeded. This batch will be merged/pushed after final evidence review/static checks.
