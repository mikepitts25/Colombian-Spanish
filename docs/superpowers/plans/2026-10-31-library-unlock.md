# Library Unlock Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Owner authorized integration in the current session.

**Goal:** Integrate a useful free core and a restorable one-time library purchase.
**Architecture:** RevenueCat billing service and context feed centrally filtered DeckContext. A journaled migration preserves existing installation access without changing progress backups.
**Tech Stack:** Expo, React Native, TypeScript, react-native-purchases, Jest.
**Spec:** docs/superpowers/specs/2026-10-31-library-unlock-design.md

## Global Constraints

Ten free starter decks; US$19.99 intended store price; display store-localized price only. No subscription, ads, launch paywall or progress deletion. Native-only verified entitlement, restore, safe missing-config behavior, bilingual UI. Keep existing installation access and custom cards.

## Review Focus

- Fresh launch must not mistake seeded or restored content for pre-upgrade access.
- Purchase cancellation/pending/failure must never grant access or initiate duplicate purchases.
- Revoke access from learning queues without deleting progress; preserve user-created cards.
- Offline/failed refresh must not replace the last known entitlement with a fabricated free result.
- Unconfigured/Expo Go/web must not offer a successful simulated purchase.

### Task 1: Access policy and migration

Files: src/billing/catalog.ts, src/storage/libraryCohort.ts, src/storage/durableStorage.ts, src/context/DeckContext.tsx; **tests**/billing/catalog.test.ts, **tests**/billing/libraryAccess.integration.test.tsx.
Interfaces: accessibleDecks(decks, fullLibrary) returns readable decks; initializeLibraryCohort(tx, hadDecks) returns legacy boolean; DeckContext exposes allDecks and hasFullLibrary.

- [x] Write failing tests for free/paid/custom filtering, fresh vs old journaled migration, restart, backup import and purchased revocation.
- [x] Run focused Jest tests and observe missing behavior.
- [x] Implement policy/migration and connect DeckContext while keeping raw decks in storage.
- [x] Run focused tests to green.

### Task 2: Billing state and purchase/restore

Files: src/billing/service.ts, src/context/PurchaseContext.tsx, App.tsx, .env.example, package files; **tests**/billing/service.test.ts, **tests**/billing/PurchaseContext.test.tsx.
Interfaces: billing service load/purchase/restore/subscribe; usePurchases exposes ready, fullLibrary, product, busy, message, refresh, purchase, restore. SDK active entitlement is authoritative.

- [x] Write failing tests for configured product validation, cancel/pending, restore, revoked entitlement, offline refresh, concurrent actions and stale refresh.
- [x] Run tests to RED, implement native adapter/context, then run to GREEN.

### Task 3: Library UI and release handoff

Files: src/screens/LibraryScreen.tsx, src/components/LibraryLink.tsx, navigation, Study/Settings, translations, notifications; **tests**/screens/LibraryScreen.test.tsx; docs/product/LIBRARY_UNLOCK.md, privacy and roadmap.
Interfaces: Library route available from Study/Settings, library screen consumes access/billing context and actual catalogue.

- [x] Write failing interaction tests for localized price, absent product, restore, sample and unlocked states.
- [x] Implement bilingual accessible screen and links; keep notification previews within free catalogue.
- [x] Run focused tests, whole suite, typecheck/lint/format and data/content checks. Inspect native build compatibility and record account/device gaps.
- [x] Review final diff and tests, fix material issues and document exact verification.

Execution complete for code integration. Account/product configuration, public privacy publication, editorial acceptance and real device/store purchase testing remain release dependencies rather than completed implementation claims. See `docs/qa/2026-10-31-library-unlock/REPORT.md`.
