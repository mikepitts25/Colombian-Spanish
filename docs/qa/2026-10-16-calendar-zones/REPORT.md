# Calendar storage integration matrix — October 16, 2026

Scope: B02.6-B1, automated QA only; no product date/storage behavior change.

`npm run test:calendar` launches isolated Node/Jest processes for Europe/Berlin, America/Bogota, America/New_York and Pacific/Auckland. Each process asserts the requested zone through Intl; the host settings/clock are untouched. CI quality now runs this matrix after the full suite. The runner stops with nonzero status on a failed suite or process launch.

| Zone             | Short-day fixture in 2026 | Hours | Long-day fixture in 2026 | Hours |
| ---------------- | ------------------------- | ----- | ------------------------ | ----- |
| Europe/Berlin    | March29                   | 23    | October25                | 25    |
| America/Bogota   | March29                   | 24    | October25                | 24    |
| America/New_York | March8                    | 23    | November1                | 25    |
| Pacific/Auckland | September27               | 23    | April5                   | 25    |

Each zone runs four storage integration cases: short/long-day counts and daily new allowance remain intact until the next local calendar day; target survives rollover; streak advances once per day; legacy UTC midnight instants migrate without losing same-local-day work or awarding another streak/freeze; a fresh learner and a returning learner after absence retain the intended default/saved target. Daily writes are exercised concurrently through the actual durable storage layer with the standard native storage fixture.

**Results:** 16/16 zone-matrix cases passed. Full suite **78 suites / 764 tests passed**; types, lint, formatting, data and editorial-ledger checks passed. Fresh review found no actionable issues and independently ran the matrix successfully. Test-only work did not require an implementation RED cycle.

**Limits:** no live switch between timezone regions, OS clock change, app resume UI, native timezone settings, or physical-device pass is claimed. Legacy ISO instants do not carry the original timezone; migration deliberately interprets them in the current zone. Native fresh/empty/returning/upgrade and broader platform coverage stay open.
