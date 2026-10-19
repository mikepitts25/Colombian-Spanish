# Android docked input, earned study recovery and live appearance

October20,2026; source main `191b6ad`. Reuses the already compiled SDK57 ARM64 development APK with SHA256 `063edd5f14639d85108bee27a916ba71c62fb5c06cfbdaa1cb271c8c82743102`. No product source, dependencies or native build changed. B01.5-B2 and B01.5-C1 close only the observations below; **B01.5/B01.5-B and all five broader QA packages remain open**.

## Working input and actual study

Android Studio Running Devices → Dock Pinned places the emulator in the main window. CUA AX canvas and screenshot-grounded clicks then reach Android correctly, superseding the floating-window input blocker. Studio stayed in Safe Mode without another Gradle build. Existing IDE and React Native notification close controls cleared overlays; no warning suppression or app patch was needed.

The fresh QA profile completed Spanish Classic onboarding: Travel, all regions, five-card daily target. [Progress after onboarding](onboarded-progress.jpg) shows47 decks/1392 cards and0/5. The prepared Travel queue contained ten cards. A settled [real reveal](study-revealed.jpg) showed `maleta` → `suitcase`. Exactly one Hard grade persisted a0.5-day interval/12-hour due, daily1/5/newCount1, streak1, and one self-rated recall event with quality2. The retained session has card0039 and nine remaining IDs. No additional grade was made for cold verification.

An official force-stop followed by Activity start returned [Status ok / LaunchState COLD /1606ms](cold-launch.txt), with new PID2452. [Cold Home](cold-home.jpg) visibly shows1/5 and streak1. All seven saved values match the graded snapshot byte for byte: decks, daily, preferences, last Study session, seen words, streak and learning events. This proves exact persisted queue recovery; it does **not** claim a post-cold visual Study card/resume traversal.

[State summary](state-summary.json) contains per-record SHA256 and decoded QA preferences/daily/session/events. Raw full-deck SQLite snapshots stay host-only. These are read-only observations through official adb/run-as/sqlite3 `-readonly`; no app storage was edited.

## Live Barrio appearance

From the picker, Barrio with System was saved. The [actual System/OS Light picker](barrio-system-os-light-picker.jpg) rendered warm light colors. Studio Device UI Shortcuts then changed the emulator's actual Dark Theme setting. [Android UI mode](os-dark.txt) reports night mode yes; the [same picker became dark](barrio-system-os-dark-picker.jpg) with PID2452 unchanged. This is actual live native appearance evidence for the configuration fix in PR63.

With the OS still Dark, explicitly selecting and saving Claro/Light produced the [light picker](barrio-light-os-dark-picker.jpg). Saved preferences confirm Barrio/System, then Barrio/Light; only preferences changed, while all six learning records remain byte-exact to the cold checkpoint. Save stays on the picker and displays `Tema guardado.`; these are picker captures, **not Home screenshots**. Classic remains available; this batch does not claim a return to Classic, manual Dark, English, theme cold persistence or complete appearance/layout acceptance.

## Resource limits and interruption

The other chat repeatedly started a PyQuest iOS runtime despite the owner's Colombian Spanish priority. Earlier overlaps were detected at inventory boundaries and the own Android runtime was immediately stopped. Those earlier functional observations are not represented as continuously exclusive execution.

For the cold/appearance phase, an [inventory monitor](exclusive-runtime.jsonl) sampled official iOS/Android inventories every two seconds. Initial samples were empty; once Android booted, every sample before the final interruption showed only our Android runtime. This is sampled evidence, not proof that transient overlaps were impossible. On detecting the other iOS runtime at23:38:11Z, the guard verified our AVD identity and [stopped only our emulator](exclusive-abort.json). No other chat or runtime was operated. Remaining simulator checks were stopped rather than restarting into another gap.

Metro8081 was stopped and Android Studio exited. Device Hub/TextEdit remained closed. The dedicated Android QA profile is retained with one event and nine queued cards. Its last OS appearance is Dark and app preference Barrio/Light: **restore OS Light at the next exclusive boot** before new theme cases. The interruption prevented restoration; no other project/device setting was changed. Root unrelated files remain untouched.

## Remaining bounded work and validation

Android practice, voice, local files, remaining appearance/language/accessibility cells and post-cold visual Study traversal remain open. The five consolidated QA packages still contain127 unchecked requirement rows in29 overlapping groups; these new checked children do not close parent requirements. These counts overlap and are not127 coding jobs. Unapproved content/features, skipped security, signed distribution and human/physical gates remain separate.

This documentation/evidence-only batch does not repeat the accepted build,117-suite/1160-test local regression or prior iOS checks. Passive state equality, evidence digests, formatting and checklist-index consistency are checked here; required CI and one fresh final review precede merge. Passive checks support the captured observations and do not replace UI evidence.
