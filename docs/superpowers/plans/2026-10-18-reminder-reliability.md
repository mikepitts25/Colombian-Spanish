# Reminder reliability implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Repair the existing reminder preferences and scheduling paths audited in B12.5, including truthful capabilities and live text resizing.
**Architecture:** Serialize notification writes and OS scheduling as one ordered operation, with a result distinguishing scheduled/off/denied/scheduling-error from a failed durable save. Keep screen draft/pending state above font-keyed native content and block edits until load/save completes. Preserve legacy alert fields for backups while removing controls that never scheduled those alerts.
**Tech Stack:** Existing Expo notifications, React Native, durable AsyncStorage, Jest/RNTL.
**Spec:** MASTER_PLAN.md B12.5 reminder-settings audit, B08.2-B and B08.5-B layout coverage. This repairs existing behavior; no custom times/weekdays or new alert subsystem.

## Global constraints

- Skip access-blocked security work; do not accept licenses or change signing/accounts.
- Morning is 08:00 local, rolling seven calendar-day window refreshed on app launch; evening is 21:00 daily. Say this accurately, without claiming delivery.
- Native checks must preserve learning state; physical scheduled delivery/OS interruptions remain open.

## Review focus

- A late startup refresh must not re-enable reminders after a newer disable intent.
- Storage failure must not claim success or silently retain an unsaved optimistic switch.
- Permission denied and scheduling failure must retain saved choices and offer accurate recovery without repeated automatic prompts.
- Load/save, live font changes and navigation must not drop/duplicate a pending intent.
- Unsupported alert/weekday controls must not imply functionality; legacy preference fields must survive supported edits.

### Task 1: Ordered scheduler outcomes

Files: src/services/notifications.ts; **tests**/services/notifications.test.ts.
Interfaces: existing get/save/refresh/schedule exports retained; schedule/save/refresh resolve a typed outcome `scheduled | off | denied | error`. Durable write failure rejects; scheduling failure returns error after best-effort partial cancellation.

- [x] Add failing tests at native/storage boundaries for overlapping scheduling/refresh/disable, queue recovery, denied permissions without reprompt when cannot ask again, durable failure, partial schedule failure, no enabled choices, malformed stored boolean fields, and exact fixed-date morning window.
- [x] Run focused tests and retain expected RED failures.
- [x] Implement one queue around write/read plus schedule; normalize known boolean fields; return outcomes and prevent prompting when no reminders requested.
- [x] Run focused tests GREEN; review result contract before consuming it.

### Task 2: Recoverable truthful preferences screen

Files: src/screens/NotificationsScreen.tsx; src/i18n/translations.ts; **tests**/screens/NotificationsScreen.test.tsx. Correct Settings reminder subtitle to generic accurate requested capability, without claiming actual OS delivery.

- [x] Add failing tests for initial-load lock/retry; pending-save lock, disabled subordinate switches, live-resize retention; durable-error rollback/retry; saved scheduling-error/denied outcome; only supported controls and preserved legacy fields.
- [x] Implement state/ref guards and visible translated status/retry; keep Back usable on errors and disabled only during saving. No navigation-triggered scheduling.
- [x] Remove false alert switches/weekday chevron; use daily/rolling-window copy. Add named switches, minimum 48-point interaction areas, wrapped header/stacked large-text controls, keyed native content.
- [x] Verify focused and full suite, types/lint/format/data/editorial validation.
- [x] Capture representative native Spanish/English default/maximum layouts, no inadvertent storage/learning changes and cold launch; retain permission/delivery limits.
- [x] Fresh independent whole-branch review and checklist/evidence update.
- [ ] Owner-authorized merge/push main, merged full suite and CI verification.
