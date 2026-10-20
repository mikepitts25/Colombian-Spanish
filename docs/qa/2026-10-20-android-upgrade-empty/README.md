# Android package-version update and zero-deck startup

B12.6-H bundles an actual local Android package-version increase with a distinct zero-deck startup/recovery probe. October20,2026, base main `de470f19dafa254e0247f749636b61aafeeb7483`. No product source or schema change. All five broader QA packages remain open.

## Version update result

On the isolated `Colombian_Spanish_Release_QA` API36 Pixel6 profile, baseline version1/1.0.0 held seven records,47 decks/1392 cards,one prior earned event,daily0/5 and a saved four-card Study queue. It exactly matched the prior packet's final state; no new grade was submitted.

Built one successful local ARM64 Release with generated, ignored native metadata changed to **versionCode2 / versionName1.0.1-qa**. [Metadata](build-metadata.json), [APK badging](apk-metadata.txt) and [certificate](certificate.txt) identify the candidate. The JavaScript bundle is byte-identical to version1: SHA256 `ac36fbe217590e4cc457415ac2baccd2b567bccc2ee0cc5a801bd3ff67797227`. Signing uses the same standard local debug certificate, not a store identity.

Official SDK `install -r -t` updated the installed package without clearing or uninstalling data. First version2 launch was COLD,512ms. [Home](02-after-upgrade.png) retained its one pending review and0/5; [Settings](03-version-settings.png) displayed1.0.1-qa/build2. All seven raw stored values stayed byte-exact after update and cold startup. This is package-update preservation with an unchanged schema, not a schema-changing migration, old published-version migration, Play delivery or signed-distribution acceptance.

Build preparation had one immediately interrupted wrong-path setup attempt, a missing SDK-path failure, and an unconfigured Sentry source-map upload failure. The final build used the installed SDK/JDK, preview profile, one worker and disabled automatic source-map upload for local QA. It succeeded in57s with724 cached tasks/42 executed. No new SDK/software/agreement or credentials. No Metro or broad local test suite was run.

## Zero-deck probe: existing seeding policy, not persistent emptiness

Reused the previous product-generated v3 recovery backup unchanged. A distinct disposable fixture changes **only** its decks array to[]; history and all nine state sections are copied unchanged. [Fixture metadata](fixture-metadata.json) records sizes/hashes; full files remain host/device-local. SDK push transported the labeled files into Downloads; this is not a share-recipient save.

Through the actual native document picker, selected the1294-byte empty fixture. [Preview](04-empty-preview.png) showed0 decks/0 cards/one observation. Tapped **Reemplazar decks**, preserving local application-state fields rather than using full-state replacement. Import acknowledged success and suggested restarting if views were stale. Read-only storage then confirmed exactly[] in SRS_DECKS_V3. Five non-deck records stayed byte-exact; the learning-event record retained the same parsed value with JSON property order changed by history merging. No immediate in-memory empty Home is claimed.

After actual COLD version2 startup, [Home](05-empty-cold-seeded.png) showed0 pending,1392 new cards and0/5. Storage contained47 seeded decks/1392 cards; the original learned card's schedule was replaced by fresh seeded content. All six non-deck records retained their parsed values, including the one event and the four-card checkpoint. This matches the [existing startup seed-or-merge policy previously observed on iPad](../2026-10-18-native-empty-library-startup/REPORT.md). **Persistent empty-library support is not established.** This probe does not change that policy or mark that broader requirement complete.

## Recovery and exactness boundary

Selected the372343-byte original backup through the same picker. [Recovery preview](06-recovery-preview.png) showed47 decks/1392 cards/one observation; **Reemplazar decks** restored its original schedules. [Cold Home](07-recovered-cold-home.png) again showed one pending review and0/5. [Six read-only checkpoints](state-summary.json) establish:

| Checkpoint                           | Result compared with baseline                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| After version2 update/cold           | All seven raw records byte-exact                                                                 |
| Immediately after empty import       | Empty deck array; five records byte-exact; event parsed value unchanged                          |
| Cold startup after empty import      | Seeded47/1392; six non-deck parsed values unchanged                                              |
| Original library restored, then cold | All seven parsed values equal; six raw values byte-exact; only event JSON property order differs |

Collection used the previously documented same-certificate read-only Debug transport. Because version2 was installed, SDK `-d` allowed the version1 **debuggable QA** APK replacement without launching it; run-as read the database, then Release2 was reinstalled. No root, direct app-storage edit, clear or uninstall. At the end the original Release1 APK was restored and left stopped; [package record](restored-package.txt) confirms1/1.0.0. The original generated build.gradle was restored. All original learning values are semantically preserved; this packet does not claim final seven-record byte equality.

## Resources and remaining work

All UI actions and seven unmodified screenshots used CUA through docked Studio. The original `Colombian_Spanish_QA` profile was never booted or modified. [219 runtime samples](exclusive-watch.jsonl) observed no competing runtime; sampling cannot exclude transients. [Restored OS](restored-os.json) and [cleanup](cleanup.json) confirm automatic clock/zone, Europe/Berlin,font1.0,airplane off, unlimited/zero-delay networking, stopped app and no running Android/iOS simulator, Studio, Metro or Gradle process. The two labeled import files remain in the isolated profile's Downloads for recovery; host originals are preserved.

Reuse this bounded package-update and Android stored-empty→seeded recovery evidence. Persistent-empty/runtime-empty views, schema-changing upgrades, other languages/themes/platforms, signed store delivery and physical acceptance remain open. No product behavior fix was needed or inferred. Run `python3 docs/qa/2026-10-20-android-upgrade-empty/verify.py` for passive consistency only; it is not a UI replay or independent provenance proof.
