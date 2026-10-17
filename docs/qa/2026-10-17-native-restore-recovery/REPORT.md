# Native interrupted restore — 2026-10-17

B11.2-B2. Base `f753efb`. Existing recovery behavior verified on a real native development client; no product code changed.

## Test boundary

Dedicated iPhone SE3 / iOS26 clone `738E7A96-DCC0-459A-BDC3-EBAC4E6FBA04`, unsigned SDK57 client. Original Editor Recovery fixture preserved. CUA performed UI actions; simctl terminated/launched the native process and captured screenshots. Own app storage was read only for evidence, never directly edited.

The [test-only entry](native-harness.jsx) ran in an isolated app copy, temporarily served on Metro8098. It captured a real coherent version3 backup (48 decks / 1,402 cards / six learning observations), changed one synthetic translation to include `[restore QA]` and speechRate to0.85, and substituted this source at the clipboard-read transport. The real Settings import parser, preview, Restore app state action, coordinator, journal, AsyncStorage and startup gate ran normally. This does not establish real clipboard, file-picker or hardware low-storage behavior. The wrapper is never imported by the product entry.

## Native evidence

1. Settings → Import Backup opened the version3 preview. Armed the preference-write hold and selected Restore app state. Preview actions became disabled. [Held restore](native-held.png).
2. Read-only state confirmed the durable 11-entry journal existed, deck marker was already stored, and preferences still differed from their intended after-image. Thus interruption occurred after some committed data keys, not before the journal.
3. Terminated the native process while the restore promise remained held. Cold launched with the same preference write failing during recovery. The real StorageGate displayed bilingual guidance and Retry, with no learner Home or providers exposed. Pressing Retry while the fault remained returned to that same gate. [Blocked recovery](native-recovery-blocked.png). The journal and all raw key hashes remained identical to the held partial state.
4. Allowed the QA storage transport and pressed the actual app Retry. Home loaded at3/5. Every one of the 11 durable key values matched its journal after-image and the journal was absent. The exact queue, counters, six learning events, plan/mission and streak state remained unchanged; only the deliberate source translation/preferences changed.
5. Stopped the wrapper server, restored normal Expo AppEntry from the worktree on8098, cold terminated/launched, and verified the overlay was absent. Study → Continue showed **Hola3 / seven remaining**. [Normal cold resume](native-normal-cold-resume.png). No grade was submitted. Cold resume refreshes the saved session timestamp; queue/session identity is preserved.

[Five state checkpoints](native-state-check.json) and the runnable [evidence assertions](verify-evidence.py) document the partial/replay/cold sequence. `python3 docs/qa/2026-10-17-native-restore-recovery/verify-evidence.py` passes. Existing restore/startup/file tests: **six suites / 52 tests passed** ([log](targeted-tests.log)). Baseline product was already verified with93 suites/906 tests and successful CI39047838986. Typecheck, zero-warning lint and formatting passed. Independent review reran the evidence verifier and checked the harness, screenshots, boundary claims and unchanged product entry with no actionable findings. No product behavior changed in this package.

The unsigned client's existing notification-keychain banner appeared; signed notification acceptance remains separate. Physical durability, genuine disk exhaustion, real share/cloud providers, Android and signed release-candidate acceptance remain open. This closes the simulator interrupted-restore row, not those device/account gates.
