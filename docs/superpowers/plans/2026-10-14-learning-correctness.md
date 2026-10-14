# Learning correctness — second AI implementation batch

**Goal:** Correct conjugation rendering and record quiz recognition without altering flashcard recall schedules or claiming unmeasured mastery.

**Scope:** Existing offline conjugation, quiz, storage, and progress flows. Implements B02.1-C and bounded parts of B02.2/B02.3/B02.5; broad scheduler transactions, human editorial acceptance, listening/speaking assessment, and device QA remain separate.

**Architecture:** A versioned local learning-history envelope keeps at most 5,000 observations. Stable event IDs make retries idempotent within retained history; serialized writes avoid concurrent lost appends. Modality and evidence source stay explicit; legacy card repetitions are not converted into historical events. Quiz responses use this history instead of `recordAnswer`; flashcard grading remains unchanged in this batch. Quiz recognition is reported separately from the flashcard daily review goal.

**Constraints:** Preserve existing card/scheduling/user-edit data and existing backup compatibility. Do not silently overwrite corrupt/unknown-version event history. Do not infer missing tú forms or claim native review. No new providers, accounts, or paid API calls.

## Task 1: Conjugation display

- [x] Test and correct normal and compact modal triggers.
- [x] Show tú and vos in separate rows; show localized unavailable text for missing data. Label usted and third-person plural accurately.
- [x] Verify against real data and keep native editorial acceptance open.

## Task 2: Learning history

- [x] Add validated schemaVersion=1 events with stable ID, card/deck/session identity, optional mission ID, modality, outcome, evidence source, timestamp, and nullable hints/duration.
- [x] Test concurrent writes, duplicate/conflicting IDs, write failure/retry, bounded retention, invalid data, and unsupported/corrupt stored state.
- [x] Preserve absence of prior evidence. Add recognition history to backup export and compatible restore without silently deleting legacy data; full atomic backup recovery stays in B11.

## Task 3: Quiz recognition

- [x] Record checked recognition attempts with stable prompt identity and measured duration; remove flashcard scheduler and daily flashcard-counter mutation.
- [x] Guard double submissions, persist before feedback, allow retry on save failure, and use an explicit next/finish action instead of a stale timeout.
- [x] Use current card translations instead of stale seen-word text; avoid duplicate answer choices. Wider distractor quality stays B04.
- [x] Exercise actual answer outcomes, scheduler isolation, retries, and unmount/navigation boundaries.

## Task 4: Honest progress and refresh

- [x] Replace “mastered” with due-review counts; explain scheduling counts and recognition evidence separately.
- [x] Show recorded quiz accuracy or an honest empty/unavailable state, without mixing listening/speaking/recall evidence.
- [x] Refresh existing Home/Progress stats on focus and foreground; handle unmount and errors. Full midnight/timezone/device coverage remains B02.6.

## Verification and integration

- [x] Full tests, types, lint, formatting, data/inventory checks, production platform JS bundles.
- [x] Independent read-only code review, update master checklist with precise partial/full completion.
- [x] Merge and push main under the user's standing instruction; verify GitHub CI. Keep device/human tasks open.

**Execution record:** Targeted failures were observed before each correction; the final suite passed 372 tests. Review found duplicate answer meanings; regression tests and a text-level deduplication/unusable-pool fix resolved it. An additional delayed-write regression closed the newly focused-screen read race. Wider semantic distractor quality, transactional study grading, and physical/native validation remain outside this bounded batch. See the dated QA report for exact guarantees and limits.
