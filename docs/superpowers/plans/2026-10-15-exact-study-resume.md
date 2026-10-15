# Exact bounded study resume

B02.4-B2c, continuing the authorized master plan. Persist versioned remaining queue IDs/order, region and learning-session identity inside the existing last-session record. Initial checkpoint must save before grading; show retry on failure. Each successful grade already journals the next session pointer with SRS/counters/events; include its exact remaining queue there. Old pointer-only records remain readable. Backup version 3 validates and preserves the new optional queue.

Replace index-over-a-filtered-array with remaining IDs so deletions cannot shift the index past the next card. On resume, preserve order while dropping missing, wrong-region or no-longer-eligible cards; do not fill a saved queue with newly eligible cards. Fresh category/search starts build a fresh bounded queue. Complete the selected batch rather than automatically appending another batch; show session completion separately from caught-up/no-eligible content. Keep normal new-card cap enforcement at grade commit. Do not claim permanent receipts or offline time-zone history reconstruction.

- [x] Failing snapshot validation, exact order/region/session identity, deletion, checkpoint failure/retry and final-queue completion tests.
- [x] Storage snapshot validator and legacy-compatible reads/writes; backup acceptance.
- [x] Study checkpoint, remaining queue, retry, completion and boundary integration.
- [x] Targeted/full checks, review, simulator grade/restart/resume evidence, checklist.
- [x] Merge/push and CI; broader navigation, difficult-mode policy and physical interruption remain separate.

Verification: 54 suites / 556 tests passed; types/lint/format/data/ledger/inventory checks passed. The fresh review identified a stale resume-load error hiding a new checkpoint; a failing regression pinned it, the successful checkpoint now clears it, and follow-up review found no actionable issues. Interrupted grade persistence is replayed with exact queue and one event in a storage regression. iOS evidence captures a seven-card queue, one grade, process restart, exact six-card suffix resume, and completion with an empty queue. Merge/CI evidence will be recorded after integration.

Implementation `8b945db` was merged and pushed to main. [GitHub Actions run 38749492905](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38749492905) passed all quality/content checks and independent iOS/Android project generation and production JavaScript bundles. These do not constitute native compilation or physical-device acceptance.
