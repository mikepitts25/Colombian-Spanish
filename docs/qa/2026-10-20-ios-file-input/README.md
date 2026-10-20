# iOS native malformed and oversized backup input

B12.6-M, October20, base main98049e7. Existing unsigned Release1.0.1/build2 on the independently installed iOS26 SE3 `D5502A06-4858-428C-901C-587B58280F64`; no build or Metro. This is real native file selection, not only parser unit coverage.

The explicit disposable product-generated QA document from B12.6-L was guarded by exact device/provider path, filename, uid, original372359-byte size and SHA256. A finally guard temporarily changed only this one document, restoring its original bytes/mode/timestamps after each stimulus or180-second timeout. No learner records were written directly; the older provider backup remained untouched. [Malformed guard](invalid-json-restored.json), [oversized guard](oversized-bytes-restored.json), [checkpoints](checkpoints.json) and [observations](observations.json) retain the boundaries. Full raw snapshots remain host-only under `/tmp/colombian-ios-file-input`.

- Selecting the actual eight-byte malformed `{"kind":` file through the native picker showed **Respaldo inválido** and the unsupported/missing-data message. This does not claim a specific Invalid JSON error string.
- Selecting the actual20,000,001-byte document showed **Archivo de respaldo demasiado grande**, the20 MB/10 million character guidance and **No se cambió ningún dato**. This exercises the file-byte limit, one byte above20,000,000; it does not independently test the separate character-limit boundary.
- After both guards restored the valid document, the same app process opened its normal preview: timestamp12:28:30.772Z,47 decks/1392 cards/1 observation. **Cancel** was selected; no restore/import was applied. The live app's two existing observations remained intact.
- Baseline, malformed error, oversized error, valid preview, Cancel and final actual cold launch all have eleven raw-exact learner records and no journal. Daily stays0/5, same ordinary queue and two prior observations. Initial PID39910, final cold PID42358. Original provider SHA256 recovered exactly. The simulator stopped, monitor ended and unused Device Hub quit.

The first oversized attempt's180-second guard expired before the click during context recovery: the picker retained a stale20 MB label, but selection opened a valid preview. That preview was canceled, and this was explicitly rejected as oversized acceptance. Attempt2 restaged the file under a fresh guard and produced the actual oversized error. The six numbered captures include only the accepted error attempts and valid/cold recovery; observations preserve attempt1 rather than hiding it.

No cloud/provider account, signed candidate, physical storage, OS-wide exhaustion, poor-network or exhaustive input cross-product claim. Broader B12.6 remains open; reuse accepted update/cache/journal/full-restore packets I–L. Android is paused and security skipped.

Run `python3 docs/qa/2026-10-20-ios-file-input/verify.py` for passive recorded-evidence consistency only.
