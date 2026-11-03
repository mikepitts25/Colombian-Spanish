# Neighbourhood mission expansion — 2026-11-03

## Scope

Added six bilingual editorial draft missions after the two existing café visits: The bill, please; Breakfast to go; At the fruit stall; Finding the plaza; A taxi across town; Lunch with Nico. All eight use the existing passport stamps, support status, story milestones, preview/accepted separation and portable backups. There is no additional achievement system.

Each new mission contains a scene, two typed tasks, two contextual choices, three optional warmup source cards and a completion scene. All references resolve using only the existing free library. The original two café pack fingerprints remain unchanged, pinned by a regression snapshot created before the content expansion.

Next-visit navigation now follows eligible same-mode prerequisites beyond the original two visits. Locked cards name their prerequisite. The collection and stamp copy now cover neighbourhood visits in English and Spanish.

## Verification

- Baseline: original adventure content/storage/screen tests, 31 tests passed.
- Content tests failed before adding the new missions (two failures: missing visits and sequence), then passed after authoring.
- Navigation tests failed before generalizing the next-visit and locked-card UI (three failures), then passed after implementation.
- Full suite: `npm test -- --runInBand --watchman=false` — 127 suites, 1,284 tests and one snapshot passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm run validate:data` — passed; 47 decks, 1,392 cards and 1,392 audio entries validated.
- Prettier check on changed TypeScript and design/plan documentation — passed.
- `git diff --check` — passed.
- Independent source/content review — no material findings; no files changed by reviewer.

Storage integration walks all eight missions, checks later visits remain locked, verifies accepted mode cannot reuse preview progress, earns supported and unsupported stamps, repeats all visits without duplicates or support downgrades, and exports/restores all eight outcomes. Screen tests exercise the next link after visit two in both languages and the final visit's passport return without a next link. Existing tests cover the original pair, retry recovery, content changes and old backups.

## Remaining evidence boundaries

The six new scripts remain editorial drafts. No human content acceptance was recorded. Existing development/editorial draft visibility remains in force. No native simulator or physical-device interaction/layout checks, build, upload, TestFlight delivery or public release was performed for this expansion. Automated tests do not establish teaching effectiveness or real-world speaking/listening ability.
