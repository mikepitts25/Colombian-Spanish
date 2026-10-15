# Complete supported local-state backups

Execute inline under the authorized master plan, B11.1/B11.2. Add a version-3 envelope carrying validated preferences, daily progress, canonical streak (including legacy fallback), seen-word history, quiz rounds, notification preferences and the current session pointer, alongside existing decks/events. Capture coherently under the coordinator. Reject malformed state rather than normalizing it silently.

Existing Add new / Replace decks modes retain local supplemental state. A separate explicit Restore app state action replaces supplemental state through the same journal, merges learning events, and requires restarting to reload contexts. Absent source state resets to documented safe defaults so target-device values do not leak into a full restore. OS notification/microphone permission, scheduled OS notifications, recordings and caches are not portable state; restore never grants permission or contacts providers. Reconcile reminders on next launch without permission prompts.

Legacy unversioned/1/2 imports remain supported. Clipboard export remains the existing version 2 for compatibility; version-3 clipboard input uses the same in-app preview. Full queue restoration is not invented; export the session pointer that currently exists.

- [x] Add failing full-state snapshot, validation, legacy, replacement/merge and interrupted-replay tests.
- [x] Implement state schema/parser/snapshot and explicit transactional restore mode.
- [x] Add bilingual preview/confirmation controls, permission-safe reminder reconciliation and restart guidance; test.
- [ ] Full checks, independent review, simulator acceptance, checklist/evidence, merge/push and CI.
