# iOS current-Release update and native backup-write recovery

October20,2026; B12.6-I. Two remaining iOS cells bundled on one existing SE3/iOS26 QA install: a real app-version/current-code update with retained Study resume, and a real cache-write denial with same-process export retry. No product source, schema, dependency or committed app-version change. Android work is paused at the owner's request; its separate PR78 remains open and is not included here.

## Candidate and protected baseline

Device `D5502A06-4858-428C-901C-587B58280F64` is the existing Colombian Spanish Release Bundle QA phone. Prior passed onboarding/basic Files checks are reused. The original installed unsigned Release bundle was copied host-only for recovery. After its normal actual-date launch, the baseline had11 stored records,47 decks/1392 cards,two prior earned learning events,Classic/System/Spanish,dailyOctober20/count0/new0/target5 and the ordinary Greetings queue0010–0013/current0010. The ordinary date refresh precedes the baseline; no new grade was submitted.

Rebuilt current main `de470f19dafa254e0247f749636b61aafeeb7483` as unsigned Release/ARM64 using the existing generated project/pods/derived data. Only ignored generated Info.plist version metadata temporarily changed from1.0.0/build1.0.0 to **1.0.1/build2**. [Build metadata](build-metadata.json) records executable/plist/embedded-bundle digests; [command/result](build-result.txt) records success with signing/Sentry uploads disabled and two workers. Generated Info.plist was restored after build. No Metro, new software/agreement or account setup. Unlike the separate Android metadata-only probe, this iOS candidate includes current product source changes since the older October19 Release. No schema-changing migration or store-delivery proof follows.

## Update, visible version and retained queue

Official simctl terminate/install/launch replaced the app without removal or data clearing; first new launch PID3118. [Before Home](01-before-upgrade.png) and [updated Home](02-updated-home.png) retain0 pending,1391 new cards,0/5 and the same suggestion. [Native Settings AX](version-settings.txt) reports1.0.1/build2. Once the new app was visibly rendered and Settings/Study navigation completed, **all11 raw stored values remained byte-exact**. This is stronger than the immediate post-launch read alone.

The established accessibility-target scroll exposed the retained session. A coordinate Continue tap opened [buenos días/four remaining](03-resumed-queue.png), matching card0010 and its exact queue/session/limits. Only SRS_LAST_STUDY_SESSION_V1.updatedAt changed. All other checkpoint fields and all ten other raw records stayed exact. No flip, grade, audio or plan action. A subsequent terminate/normal launch PID4016 preserved all11 resumed values exactly. This is update/ordinary-session preservation, not maximum-text touch-positioning or assistive-user acceptance.

## Actual native cache-write denial and retry

The [guard script](cache-guard.py) is a historical QA stimulus, not a product feature or part of passive verification. It resolves this exact live device's own data container, validates containment, checks cache-directory ownership/no symlink, saves its mode and temporarily removes write bits only from `Library/Caches`. It never writes the database or learner records. A180-second finally guard restores the original mode on signal/timeout.

[Applied fault](cache-denied.json): cache mode0755→0555. Native tap on Guardar archivo de respaldo produced the Spanish [in-app error](04-cache-write-error.png): “Error de respaldo / No se pudo completar la operación de respaldo. Inténtalo de nuevo.” [Full AX](cache-write-error.txt) confirms it. This is an actual OS filesystem permission fault, **not low storage, a mocked exception or a cloud/provider rejection**. The underlying app errno was not captured; no specific errno claim is made.

Immediately signaled guard cleanup, which [restored0755](cache-restored.json). Native export retry in the same PID4016 opened the [share sheet with a373KB JSON file](05-export-retry-share.png). No recipient was selected; outside tap dismissed it. [Read-only metadata](retry-metadata.json) confirms a valid372661-byte v3 backup,47 decks/1392 cards,two events and all nine application-state sections; full file bytes remain host-only. This establishes export creation/retry, not a new provider-save acceptance. [Process record](retry-process.txt) corroborates the retained process; no restart occurred between fault and retry.

## Cold recovery and resources

[Eight read-only checkpoints](state-summary.json) show all11 raw values byte-exact from resumed state through the error, successful retry and final cold Home PID5625. [Final Home](06-final-cold-home.png) retains the expected counters/library. No backup import/restore, grading or direct app-storage write. The only baseline-to-final record difference is the normal Continue timestamp; it is deliberately retained.

The upgraded unsigned QA app1.0.1/build2 remains installed, stopped, for future iOS checks. Original installed bundle and new bundle remain host-only under `/tmp/colombian-ios-upgrade/`; this is not a distributed release. Generated Info.plist is restored; native Light/Text3/VoiceOver off/Capture Keyboard off were not changed. Cache permissions are restored exactly. [236 samples](exclusive-watch.jsonl) observed zero competing runtimes; sampling cannot exclude transients. [Final inventory](cleanup.json) has no booted iOS/attached Android simulator, Device Hub, Studio, Metro or active Xcode build. Other QA profiles and other projects were untouched.

All UI actions and six unmodified screenshots use CUA. SDK commands handled lifecycle/build/install/read-only state; the narrowly guarded permission change supplied the fault. No unsigned entitlement warning is treated as proof of notification delivery. The existing simulator-control limitations remain documented; no unchanged failed gesture route was repeated.

## Scope still open

B12.6-I closes this current-Release iOS version-update/ordinary-queue cell and the cache-write-denial/export-retry cell. Broader low-storage writes/restore/journal cases, provider/cloud/network errors, schema-changing upgrades, maximum-text precise touch, accent input, window layouts, other still-unverified named cases, signed delivery and human/physical acceptance remain open. All five QA packages remain open; focus is now iOS, with Android paused. No broad local regression was repeated; required CI and one focused fresh review precede merge.

Run `python3 docs/qa/2026-10-20-ios-upgrade-backup-recovery/verify.py` for passive state/hash/cleanup consistency. It does not build, replay UI or prove provenance. Do not rerun the historical fault script as part of routine verification.
