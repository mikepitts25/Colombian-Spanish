# Compact Passport Implementation Plan

**Goal:** Replace the footer passport with a compact, functional cover at the top of Adventures.
**Architecture:** PracticePassport owns a native collection modal and uses existing adventure state and navigation. Adventures renders the cover before visit cards; Progress reuses it.
**Tech Stack:** React Native, TypeScript, Jest.
**Spec:** ../specs/2026-11-03-compact-passport-design.md

## Constraints

Preserve saves, eligibility, preview labels, themes, English/Spanish and existing visit navigation. Work in the current checkout on a dedicated branch; no release or remote changes.

## Review focus

Empty collection, saved stamps, unfinished visit resume, all visits complete, error/loading and screen-reader dismissal.

## Task 1: Cover and collection

- [x] Add behavior tests for opening/closing, direct start/resume and saved stamps; observe failure.
- [x] Update PracticePassport with the cover, collection modal and next unlocked visit action. Move its Adventures placement. Add localized copy.
- [x] Run adventure tests, typecheck, lint and full tests. Review the diff and any available native preview.

## Verification record

- Watched missing cover interactions fail before implementation (five failures), then pass.
- Full suite after theme inventory update: 127 suites, 1,303 tests and one snapshot passed.
- Code review found no important correctness issues. Added the stamp/loading/error summary to the cover accessibility value after observing its regression assertion fail.
- Final focused verification covers the accessibility change and the theme audit; TypeScript, ESLint and formatting checks also run.
- Native visual/touch verification remains pending: the available computer-use surface could not access Simulator. Stopped the dedicated QA simulator and Metro process started for this attempt. No app data changes, upload, push or release performed.
