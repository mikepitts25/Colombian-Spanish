# Preference forms under live text resizing

Base `7f8b40c`, existing B08.2-B/B08.5-B work.

- [x] Reproduce/capture Learning Preferences and Audio Preferences before correction.
- [x] Add meaningful tests for dirty field/selection retention, pending-save locks and preview cancellation across live dimension changes. Native captures prove geometry; tests prove state/action effects.
- [x] Invalidate native measured subtrees without remounting state owners or preview lifecycle effects; retain loading/error/saved and pending behavior. Make Back a 48-point target on learning preferences.
- [x] Verify representative bilingual/default/maximum native form edits, save/cancel/reopen and audio preview/stop; restore fixture preferences and check exact unchanged learning state. Run quality checks, fresh review and checklist update.

Integration: merge/push main after gates and verify resulting CI. No new audio download subsystem, security work, license/account/signing or human editorial/recording acceptance.

Native restoration exposed that the valid default 0.98× was not a selectable radio choice. Include 0.98 among presets and preserve the valid loaded custom rate until another save replaces it. Pin custom 0.9→preset→default 0.98 before correction.

Verification: 100 suites / 959 tests, 13 focused tests, typecheck, lint, format check, data/editorial validation, offline eleven-phase state verifier and independent review passed. Integration follows the owner-authorized main merge/push workflow.
