# Neighbourhood Missions Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add six connected missions using existing passport stamps.
**Architecture:** Append authored definitions to the current adventure registry; preserve old definitions and state contracts. Resolve next visits using same-mode durable milestones and existing eligibility checks.
**Tech Stack:** React Native, TypeScript, Jest, existing offline mission engine.
**Spec:** docs/superpowers/specs/2026-11-03-neighbourhood-missions-design.md

## Global Constraints

No new achievement system, dependencies, billing changes, acceptance records or releases. Preserve existing mission identities, support rules and portable state.

## Review Focus

Historical fingerprints remain stable; all source references resolve; later visits remain locked without same-mode prerequisites; every new mission can earn exactly one persistent stamp; next-visit navigation names an eligible target.

### Task 1: Content and passport integration

Files: src/adventures/neighbourhood.ts (new authored content); src/adventures/content.ts (registry); **tests**/adventures/content.test.ts and storage.test.ts.

- [x] Pin old fingerprints and test the eight-mission sequence and end-to-end new stamps; run Jest and observe missing-content failure.
- [x] Author six bilingual missions with three warmup source cards and four required tasks each; append definitions without changing old packs.
- [x] Run content/storage tests, including replay and portable restore.

### Task 2: Collection navigation and copy

Files: src/screens/AdventureScreen.tsx; src/screens/AdventuresScreen.tsx; src/adventures/content.ts; src/i18n/translations.ts; **tests**/screens/AdventuresScreen.test.tsx.

- [x] Add failing tests for next visit beyond the original pair and named prerequisite cards.
- [x] Generalize next visit selection and bilingual collection/stamp/lock copy, preserving current passport scheme.
- [x] Run screen tests, full Jest suite, typecheck, lint, formatting and data validation. Record evidence and remaining editorial/device gates.
