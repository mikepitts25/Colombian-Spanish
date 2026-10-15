# Calendar days and remaining local-state mutations

B02.4-B2b / B02.6-B1. Remaining preference/daily/seen-word/streak/quiz read-modify-write helpers can still lose changes across parallel calls or restore. Reuse the durable coordinator, passing its transaction-local access recursively to avoid nested locks. Keep history lock ordering unchanged; these helpers do not append events.

Daily progress currently identifies local midnight by its UTC timestamp. Moving between zones can produce a different midnight instant for the same local date. Store explicit local YYYY-MM-DD labels; migrate legacy ISO instants using the current device zone (the old format did not retain its original zone). Compare streaks using calendar-day ordinals, not elapsed 24-hour periods. Retain target/newCount defaults and old streak fallback. Update portable-state date validation for valid calendar labels and legacy instants.

- [x] Reproduce parallel lost updates across prefs/daily/seen/quiz and pin calendar/DST/legacy fixtures.
- [x] Serialize remaining mutation helpers and add calendar-day normalization without claiming reconstruction of missing historical timezone information.
- [x] Full quality/content checks, independent review, exact evidence/checklist.
- [x] Merge/push and CI. Native timezone switching/real interruption remains separately open.
