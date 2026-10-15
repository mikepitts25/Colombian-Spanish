# Calendar and local-state coordination

October 15, 2026. Base `c71a43f`. B02.4-B2b / B02.6-B1.

## Reproduced defects and delivered behavior

Parallel preference patches, daily count/new-count/target changes, seen-word records and quiz rounds lost independent updates with split reads/writes. These controlled regressions failed before the fix. Each mutation now reuses one durable coordinator transaction, explicitly passing transaction-local access to its helpers instead of acquiring a nested lock. Mutable caller preference patches and quiz arrays are snapshotted before queueing. History lock ordering is unchanged; these helpers do not append learning events.

Timestamp-only generated quiz IDs could collide under the same clock value. A fixed-time regression reproduced that failure. Generated IDs now use the existing unique session-ID helper; explicit caller round IDs remain deduplicated. Concurrent streak sessions earn a daily freeze once.

Daily progress now identifies the device's local calendar date as YYYY-MM-DD rather than the UTC instant of local midnight. A timezone offset change on the same local date no longer creates a different key. Streak comparisons use calendar ordinals, including DST/leap transitions. Legacy ISO dates remain readable and migrate to a calendar label while preserving same-day count/target/newCount. Portable-state validation accepts both formats and rejects invalid calendar labels.

## Verification

Baseline 51 suites / 525 tests. Final **53 suites / 539 tests passed**, types/lint/format/diff checks, source data validation, editorial ledger validation and unchanged deterministic editorial inventory. Fixtures exercise Berlin, Bogotá and Auckland in fresh Node processes, spring/autumn DST, leap-day comparisons, invalid dates, legacy migration, next-day reset, queued caller mutation, generated quiz ID collision, journal failure and concurrent streak freeze behavior.

Independent review found no actionable findings and passed 99 targeted tests; additional final coverage implements the review's optional fixed-time ID, queued input and concurrent streak suggestions. The full suite above includes those additions.

## iOS simulator

Dedicated iPhone 16 Pro / iOS 26.0, Expo Go 54.0.7. The new bundle loaded the existing QA data and retained Home's 3/5 daily goal, streak two and seven new cards available. Read-only native storage inspection confirmed the migrated record `{date: '2026-10-15', count: 3, target: 5, newCount: 3}`. [Screenshot](01-migrated-progress.png). No simulator clock/timezone settings or unrelated devices were changed.

## Limits

Legacy records did not store their original zone; an old ISO instant is interpreted in the current device zone, not reconstructed from missing information. Daily counts follow the current local date and reset when that date changes, including travel/clock changes; this is not a cross-device/timezone abuse ledger. Native timezone switching, broad lifecycle/clock scenarios, hardware interruption and exact queue resume remain open. Absolute replay protects committed intents; generic mutation helpers do not gain permanent retry receipts, so callers must not blindly repeat an uncertain non-idempotent increment. Grading retains its separate stable attempt identity.

Calendar/storage implementation `073f279` passed [GitHub Actions run 38723557623](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38723557623), including quality/content and iOS/Android project generation/production JavaScript bundles. Final local suite: 53 suites / 539 tests; iOS migration retained saved totals.
