# Deck and card editing reliability implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline.

**Goal:** Repair existing custom-card creation and deck-management save paths, with retained retry intent and usable large-text forms.
**Architecture:** Keep one local pending snapshot/ref per screen, separate from the font-keyed native subtree. Give create operations stable local IDs; the real provider uses the existing durable coordinator to recognize retries after journal recovery and preserve concurrent content/grades. Management operations catch failure and keep rename drafts; destructive actions still require their existing confirmation. Failed reset/delete is never automatically replayed: show uncertainty and require a new deliberate confirmation after inspecting the deck.
**Tech stack:** Existing React Native/Expo, DeckProvider, journaled AsyncStorage and Jest/RNTL.
**Spec:** MASTER_PLAN B02.4-B2 unrelated-editor mutation races and B08.2-B/B08.5-B forms.

## Constraints and review focus

- No security work, accounts, licenses, signing or new subsystem.
- Existing card/deck IDs and grades remain intact. New IDs must distinguish same-clock create intents.
- Failed/recovered creates must not duplicate cards/decks or erase later edits/grades. Missing selected deck must reject, not clear the draft and claim success.
- Pending operations block overlapping writes, modal dismissal and navigation; errors expose recovery and retain their exact payload. Add Card can return to its retained draft after an explicit warning that an unconfirmed change may already be saved; rename Cancel discards the local retry without claiming to undo a committed change.
- Main content and modal forms must scroll at large text/software keyboard sizes, with named controls and at least 48-point action targets. Font changes may reset native focus/scroll but preserve owner draft/intent.
- Native fixture changes must be explicit and bounded; never infer physical/signed/Android/human acceptance from local tests.

### Task 1: Provider create identity/recovery

Files: src/context/DeckContext.tsx; local ID helper; **tests**/context/DeckContext.test.tsx.
Interface: createDeck(name, description?, intentId?) accepts stable optional create identity; addCardToDeck reuses caller card.id as intent identity. Both update provider state from one coordinated mutation result, without a second read after commit.

- [x] Add and run failing real-provider tests for missing target rejection, duplicate card retry after interrupted apply/journal recovery, same-clock separate deck identities, and explicit-ID deck retry preserving later cards/rename.
- [x] Implement stable local identity generation and coordinated create-once behavior; run focused tests green.

### Task 2: Add Card guarded form

Files: src/screens/AddCardScreen.tsx; translations; screen tests.

- [x] Pin repeat-save/new-deck calls, rejected saves with retained fields/identity and successful exact retry, readiness/removed selection and live resizing.
- [x] Use named Pressable actions, snapshot/ref locks, visible retry/error/saving state, stable create IDs and navigation prevention during pending intent. Keep provider-backed selected deck and drafts above keyed content.
- [x] Scroll/keyboard-safe main form and bounded modal content; preserve selection, create draft and pending state on font changes.

### Task 3: Manage Decks guarded form and integration

Files: src/screens/ManageDecksScreen.tsx; translations; screen tests.

- [x] Pin pending rename locks/draft retention/retry, handled confirmed reset/delete failures and pending duplicate confirmation callbacks.
- [x] Guard/catch operations and preserve rename draft/intent; expose error recovery. Keep destructive confirmation and fresh-provider storage behavior.
- [x] Put headers/search in the scrolling list, retain query/draft on native remeasurement, wrap actions and provide scrollable keyboard-safe rename modal.
- [x] Full suite, types/lint/format/data/editorial gates; representative bilingual upper forms and Spanish modals, with canceled drafts and exact cold-state verification. Native saved fixture, software keyboard and full touch/assistive follow-up remain open in MASTER_PLAN.
- [x] Fresh whole-branch review, master checklist update, authorized merge/push and merged validation/CI. Implementation `649618b` merged/pushed; merged 100 suites/985 tests and CI39088071204 all four jobs passed. Board39088071107 succeeded. Native follow-up stays open in B08.5-B8.
