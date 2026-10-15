# Mission follow-up practice

B07.5-B1: turn the completed draft mission's unique difficult source IDs into an explicit optional recall-and-reveal activity. The development-only mission gate remains. Use current source cards, display English cue first, reveal Spanish plus example, then move through the small list or return to the completed mission. Skip missing sources and do not offer an empty action. Each new phrase starts hidden. This is self-check practice: no assessment event, mastery claim, daily-counter update or SRS grading. Completed mission checkpoints stay unchanged; optional review position is temporary, so returning/restarting review begins at the first phrase. Daily-plan integration of accepted missions remains separate.

This is bounded continuation of the authorized mission roadmap. Reusing Study's graded deck queue would change scheduling and mix modalities; a small inline optional activity avoids that. No new service, permission, account or language acceptance is introduced.

- [x] Add failing targeted UI tests for reveal, next/reset, exit and unchanged mission/event/daily state.
- [x] Implement bilingual accessible follow-up activity and completion handoff, handling missing source cards.
- [x] Verify full suite/static/content checks, single fresh review and regressions for findings, iOS UI evidence.
- [x] Update master evidence, merge/push and record CI.

Evidence: 64 suites / 677 tests; types/lint/content/inventory checks; iOS Spanish reveal/next/reset/return/reopen and byte-equivalent stored sections; one fresh review with no actionable findings. See docs/qa/2026-10-15-mission-follow-up/REPORT.md.

Merged/pushed `45b3341`; CI 38805709928 passed quality/content and iOS/Android project generation/production JavaScript bundles.
