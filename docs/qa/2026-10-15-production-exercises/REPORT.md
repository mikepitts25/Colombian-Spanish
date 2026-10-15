# Production exercise foundation — 2026-10-15

B04.3-A implements a versioned deterministic typed-recall/cloze engine with authored accepted variants, hints, correction explanations and optional learning-event provenance. [Authoring contract](../../exercises/AUTHORING.md), [spec](../../superpowers/specs/2026-10-15-production-exercises.md).

## Verification

- 55 suites / 590 tests passed, including 34 new engine/integration tests. Typecheck, lint, formatting, data validation and editorial ledger validation passed; generated review inventory unchanged.
- Initial tests failed because the new engine did not exist. Added edge regressions separately failed for exact-variant correction precedence and contradictory event metadata before correction.
- Fresh independent review found sparse arrays skipping validation and nullable elapsed duration accepted by the legacy-compatible event validator. Both were reproduced with failing regressions and fixed; full suite passed afterward. Legacy nullable event history remains readable.
- Tests exercise canonical/explicit variants, case/Unicode/space/outer punctuation, meaningful internal punctuation and ñ, vowel-accent corrections, empty answers, hint accounting, cloze markers, malformed schemas and attempt identities.
- Integration tests persist one assessed recall event, retry without duplication, retain exercise provenance in a version-3 file capture/parse/restore, and confirm unrelated scheduling, counters, streak and seen-word storage are untouched. Raw answer text is absent from observations.

## Scope and limits

This is reusable engine work, not a completed learner-facing feature. No UI or simulator acceptance is claimed for this package. No real teaching exercise was approved or added to the library. Pack reference checks, editorial release gating, accessible typed-answer UI, keyboard behavior, mission integration and efficacy remain subsequent work. Local event deduplication applies while the ID remains in bounded history.

Implementation `d9687b9` was merged and pushed to main. [GitHub Actions run 38750355516](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38750355516) passed quality/content and independent iOS/Android project generation and production JavaScript bundles. Native UI integration remains open.
