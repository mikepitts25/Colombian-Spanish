# Production exercise engine implementation

Spec: `docs/superpowers/specs/2026-10-15-production-exercises.md`. Sequential inline package, no new dependencies or services.

- [x] Pin normalization, schema, hint and cloze boundaries with failing engine tests.
- [x] Implement deterministic schema validation and answer assessment; retain ñ and accents.
- [x] Add optional exercise provenance to learning-event validation and construct assessed recall events without storing answer text.
- [x] Verify persistence/retry, old/new backup-compatible history and untouched scheduling/counters.
- [ ] Run full checks, fresh review, update B04.3-A evidence, merge/push and record CI.

UI/mission integration and reviewed authored teaching content remain subsequent packages. No simulated learner efficacy or native-device coverage is claimed for a pure engine.

Final review: fixed sparse-array acceptance and nullable new elapsed duration. Both regressions failed before correction; full suite 55/590 passed after. No deferred minor findings or design deviations. Backup capture/parse/restore covers exercise provenance. Static/content checks passed with unchanged generated inventory. Merge/CI pending.
