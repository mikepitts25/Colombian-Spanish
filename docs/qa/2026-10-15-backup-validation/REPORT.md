# Backup input validation

Date: October 15, 2026. Base: `ab1e69c`. Scope: B11.2-A, existing clipboard import only.

## Delivered behavior

Before presenting a destructive restore confirmation, the importer validates every deck and card: nonblank IDs/names/prompts/answers, arrays, finite nonnegative scheduling values, integer repetitions, positive ease, supported optional flags/metadata, and legacy conjugation table structure. Deck IDs must be unique; card IDs must be unique across decks because application lookup/history uses global card IDs. It does not coerce or strip valid custom content. Unknown additional fields are preserved.

Legacy unversioned/version-1 backups remain supported, as do version-2 backups with validated learning history. Invalid data cannot reach confirmation or trigger deck/history writes. Clipboard-read rejection shows the existing localized failure alert. Raw input exceeding 10,000,000 JavaScript UTF-16 code units is rejected before JSON parsing with a dedicated English/Spanish size alert. This is a parsing-work guard, not a physical-device memory guarantee.

## Evidence

Baseline passed 41 suites / 390 tests. Twenty-five new malformed/oversized/read-failure cases failed before implementation. After implementation, 51 Settings tests pass, including all three supported backup versions preserving custom fields and a full built-in library import. Tests use mocked clipboard/deck persistence and real in-memory learning-event persistence; rejected inputs preserve an existing observation and never invoke deck writes.

Independent review identified an incompatibility: Add Card can persist empty string tags after a trailing comma. Validation now accepts all string tags without trimming. Three supported-version compatibility tests failed before that correction and pass after it; custom tags, favorites, flags, examples, scheduling, review metadata, and conjugation tables remain intact. A parameterized-test TypeScript inference error was also corrected before final checks.

## Simulator and remaining work

Metro started and the dedicated iOS QA app was reopened, but Device Hub reported that the Mac was locked. No interactive backup-alert acceptance is claimed. Simulator verification remains open. No clipboard fixture was inserted or backup imported on the simulator during this blocked attempt.

This package does not add file export/import, preview, merge/replace choices, preferences/streak backup, atomic multi-key restore, rollback, migration recovery, or interrupted-write recovery. The existing restore still merges history before replacing decks, so a later write failure can leave partial changes; B11.2-B remains open. Physical file/share, reinstall, and hardware validation remain open.

## Final verification and integration

**41 suites / 419 tests passed**, plus TypeScript, ESLint, Prettier, data validation, deterministic editorial inventory comparison, and `git diff --check`. Inventory remains 47 decks / 1,392 cards / 1,392 audio mappings. Independent follow-up review found no remaining actionable findings within scope. Implementation `6e0cbdf` was fast-forward merged and pushed to main. [GitHub Actions run 38678603279](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38678603279) passed all quality/content and iOS/Android project generation and production JS bundle jobs. Those jobs do not compile/sign native binaries or validate hardware.
