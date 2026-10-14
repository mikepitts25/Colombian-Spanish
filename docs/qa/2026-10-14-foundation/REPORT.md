# Foundation batch — October 14, 2026

Scope: master checklist B01 foundation work, B02.1 AI corrections, and B03.1 native-review inventory. Source reference before implementation: `a233665`; formatting normalization is isolated in `ad3ffff`. This report describes local evidence, with remote CI outcomes recorded in the work log after push.

## Baseline

- TypeScript: passed.
- ESLint: passed.
- Jest: 33 suites / 310 tests passed.
- Formatting: failed in 64 pre-existing files. These were normalized in a separate formatting-only commit.
- Assets: `favicon.png` contained JPEG data despite its extension. Replaced it with a 48×48 PNG derived from the existing app icon; the icon design was preserved.
- Data: 47 decks, 1,392 unique cards and generated audio mappings. Validator now checks actual exported decks and audio-file presence/headers.

The baseline logs in this directory record the initial results; they are not the final verification results.

## Delivered behavior and verification

- CI now runs Jest and the reproducible data validator without installing an extra TypeScript runner or mutating dependency manifests.
- CI generates native projects and creates production iOS/Android JS bundles. The summary explicitly excludes native compilation, signing, device QA, and editorial acceptance.
- Validator regressions exercise the CLI against temporary projects: duplicate IDs, empty libraries/decks, missing text/audio/mappings, duplicate mappings, invalid MP3/PNG headers, and valid read-only inputs.
- Future endings corrected for 127 generated entries. Independent literal fixtures cover regular -ar/-er/-ir and reír forms, existing irregular futures, distinct present tú/vos, and the corrected plancharon spelling. Failures were observed before the fixes, then the targeted tests passed.
- Structural audit of all 187 conjugation entries found 280 tense tables lacking an independent tú form; these remain editorial/UI follow-up, not certified grammar. See `conjugation-audit.txt`. No required yo/vos/él/nosotros/ustedes field was missing in that audit.
- The deterministic review inventory exports all 1,392 cards with examples, metadata provenance, inferred regional claims, and explicit unknown acceptance. The 20 `needs_native` cards are prioritized. Regeneration and CLI tests passed.
- Local production project generation and Hermes bundling passed for iOS and Android after compatible dependency updates. No native compiler or signed application build was executed.

## Dependency audit

`npm audit fix --package-lock-only` applied only compatible updates, followed by `npm ci`. It updated the locked Expo 54 patch dependencies and vulnerable transitive packages without changing the declared product dependency ranges or forcing major upgrades.

Production-dependency audit counts changed from 53 findings (including 2 critical) to 44 (0 critical, 25 high, 19 moderate). The complete installed-tree audit still reports 67 findings (48 high, 19 moderate). These are dependency-tree advisory counts, not a claim of 67 remotely exploitable application paths. Further SDK/navigation upgrades need compatibility review; do not run `npm audit fix --force` blindly. Findings and reachable paths need follow-up under B01.8.

## Simulator and hardware limits

A new dedicated iPhone 16 Pro simulator on iOS 26.0 was created and booted. Cached SDK-54 Expo Go was installed and the local Metro URL was opened. The captured result was the iOS “Open in Expo Go?” confirmation, not the application UI. Native UI automation reported that the Mac was locked and could not unlock automatically. Consequently no onboarding/study/quiz/phrases/settings/restart UI coverage is claimed; B01.4 stays open.

Android Studio exists, but no standard SDK directory or usable `adb`/`emulator`/`sdkmanager` was found. Android emulator coverage stays open. No physical-device testing, native-speaker acceptance, learner pilot, account actions, or publication was performed.

## Final local checks

Final results are recorded in `final-checks.txt` after running all checks on the implementation. CLI/unit evidence does not close the human/device rows of the master plan.

## Integration and remote validation

Functional commit `76c399e` was fast-forward merged into main, retested there (334 tests and all quality/data checks passed), and pushed. [GitHub Actions run 38524675722](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38524675722) passed all four jobs on Linux/Node 22, including both platform production bundles.

The separate [historical Kanban Pages workflow](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38524675860) failed at configure-pages with “Pages site failed / Not Found.” The same workflow had failed before this batch. App CI is independent. No Pages settings were changed or publishing enabled; the follow-up is B01.9.

GitHub also annotated the passing CI with action Node-runtime deprecations and an upcoming ubuntu-latest image migration. These did not fail the run; future workflow maintenance should account for them.
