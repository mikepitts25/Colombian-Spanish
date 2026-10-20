# Android backup storage recovery and measured slow link

B12.6-G adds two bounded native cells on October 20, 2026: cold Home/local backup export under a measured slow connection, and backup export failure/retry under actual guest filesystem pressure. No product change was necessary. Broader B12.6 and all five QA packages remain open.

## Candidate and method

Base main `01b4bb86345e515db7ae3193ab37383f8827cf19`; reused the [previous local preview Release APK and documented same-certificate read-only collection method](../2026-10-20-android-offline-release/README.md). APK SHA256 `8de61593b22646984d3f79b92a89a31cd95f7f2e7f02b6ac2cc178f894b0e8a7`; version 1/1.0.0, ARM64, embedded JavaScript, debug-key signed. This is not a store-distributed candidate. No rebuild, Metro or broad local test rerun.

Only isolated `Colombian_Spanish_Release_QA` (API36/Pixel6) ran; the original QA profile was untouched. Native UI actions/screenshots used CUA through docked Android Studio. SDK commands controlled lifecycle, link shaping and read-only state collection. Same-version Debug replacement was used without launching it to read RKStorage, then the exact Release was reinstalled. No app storage was edited, cleared or uninstalled. Two initial emulator starts lacked Studio attachment and were stopped; authenticated local gRPC attachment succeeded. These setup attempts are not app failures.

The baseline follows an ordinary cold return from the previous staged March date to actual October20. Daily progress correctly refreshed to 0/5 before this packet's baseline; the one previously earned March event and four-card checkpoint remained. No card was graded during these cases.

## Measured slow connection

Wi-Fi was disabled in native Internet settings, leaving the emulator's mobile route active. SDK shaping was EDGE 473600 bits/s up/down with 2000ms minimum/maximum delay. A plain HTTP GET to example.com, with no user payload, confirmed that this route was affected. The [probe implementation](remote-probe.py) keeps stdin open while receiving the response; [results](remote-probe.json) show one HTTP200 sample per condition:

| Condition           | First byte | Total  | Response bytes |
| ------------------- | ---------- | ------ | -------------- |
| Full speed/no delay | 0.134s     | 0.139s | 888            |
| EDGE/2000ms         | 2.094s     | 3.160s | 891            |

This pair establishes an affected link, not a performance benchmark. Earlier local-loopback probes bypassed shaping on both Wi-Fi and mobile; an early remote probe closed stdin too soon and received zero bytes. Those results are not accepted network evidence.

With shaping retained, force-stopped Release started **COLD**, reported 985ms activity launch time, and displayed ordinary Home (one overdue, 0/5). Settings backup export wrote a file and reached the native chooser. The default system image reports **“No apps can perform this action”**; this proves neither recipient handoff nor provider save/read. No Study grading, audio, download or cloud request was exercised. Full speed/no delay was restored before storage testing.

## Actual low-storage error and retry

An explicitly named temporary filler in this isolated guest (`/data/local/tmp/colombian-spanish-qa-storage-20261020.fill`) used fallocate to consume guest blocks, with an AVD identity check, host-free-space guard and 240-second cleanup guard. Host storage was not filled. Initial guest space reached124KiB; Android automatically reclaimed cache, including the earlier unhanded export, and free space rose to1456KiB. The first tap/frame was ambiguous and is not counted as a failure or success.

One top-up of the same filler left **32KiB available** ([measured top-up](pressure-topup.json), [space at error](error-space.txt)). Tapping the actual backup control then showed the Spanish **in-app banner**: “Error de respaldo / No se pudo completar la operación de respaldo. Inténtalo de nuevo.” The concrete filesystem pressure and UI error are observed; the app's underlying errno was not captured, so this packet does not assert a specific ENOSPC exception. The [OS excerpt](storage-log-excerpt.txt) records cache reclamation and storage monitoring.

The guard removed only its own filler at10:26:24UTC, restoring9576956KiB available. Without restarting the app (PID2359 throughout error/retry), native UI retry produced a valid version3 backup and opened the same no-recipient chooser. The [backup metadata](retry-backup-metadata.json) records372343 bytes,47 decks,1392 cards,one event and all nine application-state sections; SHA256 `8025633f99850046513ddf322393547621e7ec9fd92d24d8b46e5555535a3852`. Full library/backup bytes stay host-only. No partial failed export remained in the final cache inventory.

[State digests](state-summary.json) establish all seven raw RKStorage records were byte-for-byte identical at baseline, after both cases and after the final cold Release Home recovery. Daily0/5, one event and the full four-card checkpoint remained exact. The initial cached export was purged by Android under pressure; a cache file alone is not a durable external backup.

## Native captures

All captures are unmodified CUA screenshots.

| Capture                          | Accepted observation                          |
| -------------------------------- | --------------------------------------------- |
| [01](01-slow-home.png)           | Cold Home under the measured link             |
| [02](02-slow-export.png)         | Native no-recipient chooser under the link    |
| [04](04-low-space-error.png)     | In-app backup error at32KiB free              |
| [05](05-export-retry.png)        | Retry reaches chooser after space restoration |
| [06](06-recovered-cold-home.png) | Final cold Home with preserved progress       |

## Restoration and limits

[Restored settings](restored-settings.json) confirm Wi-Fi connected, airplane off, automatic time/timezone enabled, Europe/Berlin, font1.0, unlimited link/zero delay, absent filler and stopped Release. [Cleanup](cleanup.json) confirms704 exclusive-runtime samples with zero observed collisions, no attached Android/booted iOS device and no emulator/Studio/Metro process after shutdown. The isolated profile retains its prior earned event; no original profile or other project's resources were changed.

This closes the named Android cold bundled Home/local export under a slow link and actual low-storage export error/retry cells only. Other low-storage writes/grading/onboarding/restore/journal behavior, actual share recipients/provider errors, downloads/cloud, different-version upgrades, other platforms and signed/physical acceptance remain open. Reuse this evidence rather than repeating these two cells.

Run `python3 docs/qa/2026-10-20-android-storage-network/verify.py` for passive artifact consistency. It does not replay UI or independently prove provenance.
