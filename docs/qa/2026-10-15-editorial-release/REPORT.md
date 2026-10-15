# Editorial release pipeline acceptance

October 15, 2026. Base `4abf7be`. B03.3 / B03.6-A.

## Delivered behavior

A separate version-1 review ledger records draft/reviewed/needs-correction state, stable deck/card IDs, content version, SHA-256 teaching fingerprint and attributed human decisions with date/rationale. Existing learner/editor UI review flags do not create editorial acceptance. The real ledger starts empty; generated inventory schema 3 exposes effective draft state for all 1,392 cards without asserting that no past human review ever occurred.

Teaching-content and deck-context changes invalidate the prior decision, clear effective attribution and propose the next integer version. The exact fingerprint distinguishes intermediate edits. Personal progress/favorites do not invalidate teaching decisions. Filtered JSON export preserves approved IDs/metadata, excludes unreviewed/correction/stale content and rejects an empty release pack.

The app currently still bundles its full development library. A standard EAS production hook checks that actual full deck library and fails while any card lacks current text acceptance. It does not pretend the exported subset is integrated into runtime or delete stored cards. Development/preview and scoped CI native project/JS bundle validation remain available. Manual/OTA/custom build routes require explicit preflight. Human identity/competence, authenticity, audio, grammar outside deck cards and whole-release acceptance are not certified by the validator.

## Verification

Baseline 50 suites / 511 tests. Final **51 suites / 525 tests passed**, plus types, lint, formatting, source data validation and regenerated deterministic inventory. New tests cover empty/unapproved state, selective accepted export, source/deck changes versus schedule changes, unknown/duplicate IDs, invalid schema/decision/attribution/date/version, missing rationale, needs-correction exclusion, empty-pack rejection and actual production/preview hook behavior. Missing implementation and rationale validation regressions failed before their respective changes.

Independent read-only review found no actionable findings, independently passed 14 focused tests and confirmed checked-in inventory equality and all 1,392 drafts. `content:validate-reviews` succeeds; `release:preflight` fails as expected with 1,392 blocked cards. No new simulator acceptance is needed for this tooling-only package; the running development UI is unchanged.

## Human/release boundary

No editor was contacted and no decision invented. The owner/editor must supply actual attribution and accepted text decisions; pilot script selection, region/grammar/audio/rights review and learner acceptance remain open. After a curated subset is selected, runtime integration must handle stored learner content and all non-deck teaching surfaces. Production is deliberately blocked until its actual bundled library passes; the current feature is a release guard, not evidence of a shippable approved library.

Hook implementation follows [Expo's standard lifecycle hooks](https://docs.expo.dev/build-reference/npm-hooks/); those hooks do not run automatically in custom EAS builds. No remote build/account settings or publication were changed.
