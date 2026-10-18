# Independent native full-state restore and interrupted recovery

Base b8ecbea. Repeated the previously qualified restore/source-preservation check on fresh installed DABA2821-3619-4F4A-B0C3-54E70B31511F, iPad Pro13/iPadOS26. Actual source Plan Narrow5E9A8854-135A-4675-A437-4EFCA043F656 remained separate. All13 requested-device preflights resolve to the appropriate own primary container. No known alias was operated. CUA performed UI actions; official simctl controlled owned QA app processes and read-only inspection/screenshots. App-storage files were never directly written.

## Real clipboard full-state import

The read-only [builder](build-backup.py) generated a local version3 backup from the actual source store, matching its recorded hashes:48 decks /1,402 cards /ten learning observations /nine application-state fields. All fields were present; no null/default normalization was needed. [Fixture digest and metadata](fixture.json). Native TextEdit Open/Select All/Copy → Device Hub Send Clipboard → actual Settings Import backup/Allow Paste showed the [version3 preview](clipboard-preview.png). Selected Restore app state and verified the [restart acknowledgement](clipboard-restored.png).

All eleven destination logical records then matched the source exactly, immediately and after a normal cold launch. This includes decks, daily plan, missions, preferences, daily counters, streak, seen words, quiz history, saved session, notification preferences and learning events. [Restored Home](clipboard-cold-home.png) shows the pending applied phase and0/5 daily counter carried by this fixture. Device permissions were not imported or changed. This evidence covers real clipboard import; it does not establish the file picker/share/cloud providers.

## Interrupted recovery on the independent destination

The [test-only entry](native-harness.jsx), adapted from the existing October17 harness, ran in a fresh local app copy with current App/src/assets/config/package-lock and a cloned copy of the installed node_modules. Product package main stayed `node_modules/expo/AppEntry.js`. The harness captured a coherent real snapshot, appended ` [independent restore QA]` to synthetic Catch-up QA card0 and set speechRate0.85→0.9. It substituted only the clipboard-read transport and held/faulted preference writes. The actual Settings parser/preview/coordinator, durable journal, AsyncStorage and startup gate ran. Initial unarmed harness preparation left all eleven baseline hashes exact.

1. Staged the test source, opened Settings import preview, armed the hold and selected Restore app state. [Held preview](held-partial.png). The11-entry durable journal existed; the changed deck was already stored, but preference after-image was not. Only deck hash differed from baseline at interruption.
2. Terminated and cold-launched. [Bilingual recovery gate](cold-blocked.png) exposed Retry and no learner providers/Home. Retry while the test fault remained returned to the same gate. Both checkpoints retained the held partial hashes and journal exactly.
3. Allowed test storage and pressed the actual startup Retry. [Recovered Home](recovered.png) loaded; all eleven key hashes matched their journal after-images and the journal was absent. Only the intended synthetic translation and speech rate changed. Plan, missions, daily/streak/seen/quiz state, flags and all ten observations remained exact.
4. Stopped the harness server, restored normal product Expo entry on8098 and cold-launched. All eleven recovered hashes persisted with no QA overlay. Study → Continue displayed [Hola7 / three remaining](normal-resumed.png), preserving the exact queue/session identity and unchanged ten other records; only the normal session timestamp advanced. No grade, mission advance or new observation was submitted.

Source own-path preflights passed before/after its final cold app launch. Eleven source hashes remained exact through cold launch and final shutdown. Its [maximum-text Home screenshot](source-cold.png) is launch evidence, not layout acceptance; the known unsigned notification banner remains outside this check. Source started/ended shutdown. Destination started/ended booted at Text Size3, VoiceOver/Capture Keyboard off, retaining the documented disposable QA marker and0.9 speech rate. Normal Metro entry is restored; no fault harness remains active.

## Validation and scope

Run `python3 docs/qa/2026-10-18-independent-state-restore/verify-state.py` for the15 saved checkpoints and13 preflights. The six existing restore/startup/file test suites pass52 tests. Base b8ecbea passed CI39100867805 (full997-test suite, static/content and both platform generation/bundles) and board39100867813.

Saved evidence verification, full-project formatting, zero-warning lint and whitespace checks pass. Independent review inspected the builder, capture helper, isolated harness, product restore implementation, all eight screenshots and saved invariants with no findings. Normal Metro PID15938 serves the worktree's unchanged `node_modules/expo/AppEntry.js` entry on8098; both isolated harness servers were stopped.

This closes the bounded full-state/interrupted-restore provenance repeat B01.6-B2b. Broader editor/source-protection repeats, complete lifecycle/accessibility matrix, genuine disk exhaustion, physical durability, Android, signing/accounts and human editorial acceptance stay open. Security B01.8-C2g remains blocked and untouched. No product behavior or release acceptance was changed.
