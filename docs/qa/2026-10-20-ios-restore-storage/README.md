# iOS full-state restore under exhausted storage

October20, B12.6-L, source main `dbded520c3bff5327a56eaeda33797e9377e856e`. Existing unsigned Release1.0.1/build2 on own SE3/iOS26 `D5502A06-4858-428C-901C-587B58280F64`. Evidence-only; no product patch, rebuild, Metro, direct learner-record preparation or duplicate broad local suite. Android remains owner-paused.

## Reuse and protected source

Reused [B12.6-K's normally seeded disposable32MiB store](../2026-10-20-ios-storage-save/README.md). Its seven raw values before launch exactly match that packet's second-cold checkpoint:47 decks/1392 cards, one prior QA Hard event, daily1/10/new1 and retained nine-card Travel queue. No onboarding or grading was repeated. The separate original profile remains eleven records/two prior events/daily0/5.

The [guard](store-volume-guard.py) validates the exact own app-container/storage suffix, ownership and filesystem separation, then remounts the existing image over only the AsyncStorage directory. Original files remain underneath. Cleanup terminates the exact installed app before detach; a900-second timeout supplies a fallback. A helper path-adaptation typo failed before mounting and was corrected before the accepted run. No app case or source write occurred during that setup failure. Native Light/Text3, VoiceOver/Capture Keyboard off and app Spanish Classic/System remain unchanged.

## Product-generated full backup

The normal Save backup file → native Save to Files flow creates a new unique local file; the existing older backup is not selected or replaced. [Returned controls](01-saved-backup-controls.png) and [metadata](backup-metadata.json) bind the372,359-byte v3 backup,47 decks/1392 cards/one observation and all nine application-state sections. The provider copy matches the generated cache file byte-for-byte and remains unchanged after import. No host-generated fixture supplies restore input. Full bytes remain host-only at `/tmp/colombian-ios-restore-storage/backup.json`.

Native Import backup file selects the new372KB item. [Full-state preview](02-full-state-preview.png) shows the exact export timestamp `2026-10-20T12:28:30.772Z`,47 decks/1392 cards/one observation and the Restore app state option. Export/picker/preview leave all seven raw values unchanged. These steps set up the new fault case; basic Files acceptance is reused.

## Real exhausted-store failure and same-process retry

The [filler stimulus](set-free-space.py) changes only its disposable filler on the validated mounted filesystem. A host write reaches ENOSPC/errno28, leaving24,576 available bytes on the33,513,472-byte HFS+ volume; the Mac retains more than1GiB free. Native Restore app state then displays [the import error](03-exhausted-restore-error.png): it could not finish and advises retry/restart without resetting the app. [Full AX](restore-error.txt) confirms the preview/action remains available. All seven stored values stay byte-exact and no journal persists. This is the failed first-journal-write restore boundary; no partial replacement or new credit is observed.

Removing only the filler frees32,333,824 bytes **on the same mounted volume**. Retrying Restore app state in the same PID26141 produces [Imported/restart instructions](04-same-process-imported.png). [Before](same-process.txt)/[after](after-retry-process.txt) process records corroborate no restart between error and retry.

The restore produces eleven valid records. Six of the original seven remain raw-exact; the learning-event JSON changes only property order and is parsed-exact. Four previously absent fields materialize their supported defaults: empty daily plan, missions, quiz history and notification preferences. Every restored field matches the backup's full-state semantics, including normalization of absent fields. The existing single event's ID/content, daily1/new1, card schedules and retained queue remain unchanged. [Restore result](restore-result.json) and raw/semantic hashes in [nine checkpoints](state-summary.json) distinguish intentional normalization from progress loss. No new event, grade or learner outcome is credited.

Actual requested cold launch PID27873 loads [Home1/10](05-restored-cold-home.png) and preserves all eleven restored raw values exactly. Cold journal roll-forward was already proved in B12.6-K and is not repeated or newly claimed here. This batch accepts restore-error/same-process retry/full-state normalization/cold preservation.

## Original recovery and resource cleanup

The guard terminates the overlay app before unmounting and verifies its exact executable is absent. [Restoration metadata](store-restored.json) reports terminate/detach success, original filesystem identity and every original storage-file hash preserved. Immediate original restoration and its own actual cold launch PID28098 match all eleven pre-test raw values; [original Home](06-original-cold-home.png) shows0/5. The fixture's QA event is not merged into the original profile. The newly generated provider backup remains as a named QA file; its digest is unchanged.

All UI actions and six unmodified1972×1368 screenshots use CUA; SDK commands supply lifecycle/read-only state and the narrowly bounded filesystem stimuli supply the fault. [186 samples](exclusive-watch.jsonl) observed zero runtime collisions; sampling cannot exclude transients. [Final cleanup](cleanup.json) shows no booted iOS/attached Android runtime, owned QA process/UI tool or mounted QA image. The phone/Device Hub and guard/watch are stopped. No build/Metro/editor was started; other profiles/projects were untouched.

This closes the bounded native full-state restore failure/retry cell. It does not prove whole-device APFS pressure, every write boundary, cloud/provider failure, schema migration, signed distribution or physical-device acceptance. It adds no exhaustive matrix requirement. Existing named UI/OS/release/content gates remain separate; five broad packages/127 unchecked rows/29 overlapping groups still include paused Android and external gates.

Run `python3 docs/qa/2026-10-20-ios-restore-storage/verify.py` for passive consistency/digest checks. It does not mount images, replay UI, prove historical provenance or certify broader release acceptance. Do not run the historical stimuli as routine verification.
