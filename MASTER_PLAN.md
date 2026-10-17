# Colombian Spanish — Master Plan and Checklist

> **For agentic workers:** Execute one bounded work package at a time. Use the applicable execution workflow; do not start parallel agents without user authorization. This is the authoritative roadmap, not authorization to publish, purchase services, or contact people.

**Goal:** Help learners understand and handle everyday life in Colombia through accurate regional content, enjoyable missions, listening, speaking, and efficient personalized review.

**Architecture:** Build on the existing Expo / React Native app and its offline local storage. Connect existing study tools through a shared learning-event model and guided missions. Add network services only for capabilities that need them, with offline alternatives and explicit data handling.

**Tech stack:** Expo SDK 57, React Native, TypeScript, React Navigation, AsyncStorage, expo-audio, expo-speech, expo-notifications, Jest, React Native Testing Library, GitHub Actions, EAS.

**Brief:** Product assessment and user request in this chat on October 14, 2026. Major new subsystems get a focused design and implementation plan when selected; do not predesign the entire roadmap or invent future interfaces now.

**Last updated:** 2026-10-17. **Status:** Foundation, learning correctness, recoverable draft missions, follow-up practice, audio preferences and initial accessibility batches merged/pushed with successful CI. iPhone/iPad simulator evidence is recorded. Remaining AI implementation and human/device gates are tracked below; the roadmap is not all complete.

## How to use this checklist

- This file owns priorities, dependencies, and completion. Older plans remain historical references; `PROJECT_HUB.md` and `APP_STORE_CHECKLIST.md` must point here.
- Every task has a stable ID. Keep IDs when moving tasks. Add new tasks under the appropriate bundle.
- Check a box only after its stated result is verified. An implementation can finish while native review or device validation remains open; record those separately.
- For each completed task record the commit or artifact, verification command/results or screenshots, date, and any limitation in the work log below.
- Take one bundle or its named subpackage per implementation session/PR. Include its tests, documentation, migrations, and error states in that same package.
- If blocked, name the missing input and continue independent tasks. Mocked services and draft content can unblock development, but do not count as production verification.
- Scope is prioritized, not a promise to build every later idea. Reassess after the first mission pilot.

## Ownership and evidence labels

| Label          | Who/what can do the work                                                                                                                                       | What completion establishes                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **AI**         | AI can inspect, code, write tests, analyze data, draft content, create assets, and document results.                                                           | A verified artifact or automated result; not human learning effectiveness.                                     |
| **SIM**        | AI can build/run and exercise an iOS simulator or Android emulator when tooling and controls are available.                                                    | Simulated layout, navigation, state, permission flows, lifecycle, and supported OS behavior.                   |
| **H-PRODUCT**  | Product owner supplies a preference or business decision and accepts the experience. AI prepares concrete options first.                                       | Decisions about audience, scope, budget, brand, pricing, and release. No hardware inherently required.         |
| **H-LANGUAGE** | Qualified Colombian speakers/editors review language and regional claims; human performers supply authentic recordings.                                        | Naturalness, meaning, register, regional credibility, and accepted human audio. No specific phone required.    |
| **H-LEARNER**  | Representative learners try the experience and provide consented feedback.                                                                                     | Actual comprehension, usability, motivation, and learning outcomes. Remote testing is possible.                |
| **DEVICE**     | Physical target hardware is required for reliable validation. AI may operate a connected device; a person may need to handle it or judge real-world sound/use. | Hardware, OS integration, and field evidence that simulation cannot establish reliably.                        |
| **H-ACCOUNT**  | Account owner provides account access, verifies identity, accepts terms, manages billing/signing, and authorizes publication where needed.                     | External account and release prerequisites. AI can prepare or automate supported steps with authorized access. |

Multiple labels mean shared work, not that a human must do the coding. A physical device does not automatically imply manual testing; automation can cover much of a connected device run. Conversely, native-language judgment and learner research need people even if no physical device is involved.

## Baseline already present — extend rather than rebuild

Source inspection found 47 decks / 1,392 unique cards, examples and generated pronunciation mappings for every card, modified SM-2 scheduling, daily new-card limits, quizzes, regional filters, onboarding, a phrasebook, favorites, custom cards, streak freezes, reminders, backup, and language selection. These are inventory findings, not a claim that all flows pass QA. Twenty seed cards explicitly request native review; missing review metadata is not proof that other content has never been reviewed.

Environment inspection found `xcrun` and booted iOS simulators. No `adb` was found on PATH. Do not alter unrelated simulators; create/select a dedicated app test device. Android setup and access to physical hardware remain unverified. No full baseline checks or app runs were performed while creating this plan.

## Global constraints

- Preserve existing IDs, custom cards, favorites, scheduling data, and user edits across upgrades; migrations require backup/restore coverage.
- Keep core study, saved phrases, and downloaded content usable offline. Clearly distinguish downloaded, generated, and network-dependent capabilities.
- Never equate recognition, unaided recall, listening, speaking, or session attendance with the same learning evidence.
- Do not market generated voices as human native recordings or unreviewed regional claims as verified.
- Keep English/Spanish interface support; test larger text, screen readers, reduced motion, and non-color feedback.
- Track provider costs and data flows before introducing paid/network AI features. Keep credentials out of the client.
- Verify current store/platform requirements when preparing a release; old checklist values are not authoritative.

## Review focus across bundles

| Failure condition                                                    | Expected behavior                                                         | Owning bundles          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| Upgrade, corrupt import, interrupted write, duplicate event          | No silent progress loss or double-counting; safe recovery                 | B01, B02, B07, B11      |
| Midnight, timezone/DST change, app resume                            | Daily caps, streaks, plans, and displayed progress remain consistent      | B02, B04, B05, B12      |
| Offline, partial download, provider timeout                          | Useful offline path, recoverable state, and honest availability           | B06, B07, B09, B11, B12 |
| Denied microphone/notification permission, audio interruption        | No dead end or crash; retry/settings and alternate practice are available | B06, B09, B12           |
| Regional ambiguity, acceptable alternate answer, accessibility needs | No false certainty; appropriate alternatives and accessible interaction   | B03, B04, B06, B08, B09 |

## Bundle map and order

Sizes describe engineering breadth, not elapsed-time estimates. Human review, account setup, and recordings can add waiting time.

| Bundle | Deliverable                                          | Priority / size              | Dependencies                       | AI can start now?       | Human / hardware gate                           |
| ------ | ---------------------------------------------------- | ---------------------------- | ---------------------------------- | ----------------------- | ----------------------------------------------- |
| B01    | Trustworthy baseline and CI                          | P0 / M                       | None                               | Yes                     | Account access only if remote builds need it    |
| B02    | Correct learning state and evidence                  | P0 / L                       | B01 baseline                       | Yes, after baseline     | Native review for language fixtures             |
| B03    | Content trust and editorial pipeline                 | P0 / M + ongoing             | None; coordinate B02               | Yes                     | Colombian editors and recording rights          |
| B04    | Better quizzes and practical grammar                 | P1 / M                       | B02; reviewed B03 content          | Design/fixtures now     | Native review of answers/explanations           |
| B05    | Personalized daily plan and workload                 | P1 / M                       | B02                                | Design now              | Product choice and learner feedback             |
| B06    | Listening and regional audio                         | P1 / L                       | B02, B03                           | Player/fixtures now     | Accepted recordings and real-device audio       |
| B07    | Mission engine and first complete mission            | P1 / L                       | B02, B04, B05; B06 for audio pilot | Outline/schema now      | Native/editorial and learner pilot              |
| B08    | Visual system and accessible navigation              | P1 / L                       | B01; coordinate B05/B07            | Audit/proposals now     | Product acceptance; accessibility/device checks |
| B09    | Speaking and voice-note missions                     | P2 / L                       | B06, B07; B11 if hosted service    | Prototype with fixtures | Voice validation, devices, provider budget      |
| B10    | Stories and meaningful rewards                       | P2 / M                       | B07, B08                           | Drafts now              | Native/editorial and learner feedback           |
| B11    | Data portability, optional sync, service foundation  | P1 backup / P2 services / L  | B02 for event migrations           | Backup audit now        | Account/provider choices if services enabled    |
| B12    | Hardware, lifecycle, performance, release regression | P0 baseline / continuous / M | Testable builds; feature bundles   | Test harness now        | Physical supported platforms                    |
| B13    | Learning effectiveness and pilot research            | P1 / M + ongoing             | B02 events; B07 pilot              | Protocol/fixtures now   | Representative learners and editor              |
| B14    | Pricing, store preparation, launch                   | P2 / M                       | Pilot decision; B03/B12 gates      | Drafts now              | Owner/accounts; physical release checks         |
| B15    | Conditional expansion and experiments                | Later / variable             | Pilot findings                     | Research only           | Demand evidence and feature-specific gates      |

**Recommended path:** B01 → B02 → B04/B05 → B06/B07 → B13 pilot → expand. B03 editorial preparation and B08 design can progress alongside this sequence without requiring parallel agents. B11 backup reliability and B12 baseline checks should begin early. Launch scope can exclude B09, optional sync, payments, and B15.

## B01 — Trustworthy baseline and CI

**Package:** development environment + meaningful checks + reproducible simulator launch. **Main files:** `package.json`, `jest.config.js`, `.github/workflows/ci.yml`, `app.json`, `eas.json`, `__tests__/`.

- [x] **B01.1 [AI]** Record current `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test -- --runInBand` results; separate existing failures from new failures. Check asset validity and audio-file references.
- [x] **B01.2 [AI]** Add the Jest suite to CI; make data validation reproducible without changing the lockfile during CI.
- [x] **B01.3 [AI]** Replace the fake successful build check with a real appropriately scoped native validation/build job; report skipped/unavailable builds honestly in PR summaries.
- [x] **B01.4 [AI, SIM]** Establish a dedicated iOS simulator workflow and capture launch, onboarding, study, quiz, phrases, settings, and restart evidence.
- [ ] **B01.5 [AI, SIM]** Locate/install supported Android tooling if available, document the actual environment constraint if not, and establish an emulator workflow without treating iOS success as Android success.
  - [x] **B01.5-A [AI]** Reinspect the Mac: Android Studio and bundled JDK 21 exist; SDK, platform tools and project emulator are absent. Record an actionable setup path. [Environment evidence](docs/qa/ANDROID_TOOLCHAIN.md).
  - [ ] **B01.5-B [AI, SIM, H-ACCOUNT]** Obtain SDK license authorization, install verified tooling/system image, create a dedicated emulator and run native flows. Agreement question is pending; no acceptance or Android runtime pass is claimed.
- [x] **B01.6 [AI]** Document repeatable commands, fixture reset, screenshots, and build artifacts. Preserve user data and unrelated simulator sessions.

- [x] **B01.7 [AI]** Record the dependency audit and apply compatible locked dependency updates without a forced major upgrade. See the dated foundation report for before/after counts.
- [ ] **B01.8 [AI]** Triage remaining dependency advisory paths and implement a separately verified SDK/navigation upgrade where required; the current audit still has high findings.
  - [x] **B01.8-A [AI]** Trace remaining advisory roots and consumer/input paths; document compatible fixes, no-patch paths, and separately testable migration packages. See the dependency-triage report.
  - [x] **B01.8-B [AI]** Apply the compatible brace-expansion 5.0.12 lockfile patch without changing product dependency ranges; audit now reports 66 total / 43 production-tree findings, zero critical.
  - [ ] **B01.8-C [AI, SIM]** Complete supported Navigation/Expo/test-tooling migrations or upstream backports, re-audit, and verify native flows. No-patch findings remain tracked rather than assumed resolved.
    - [x] **B01.8-C1 [AI, SIM]** Migrate coordinated Navigation 7, explicit nested/pop return actions and header API; verify real-router reuse, full suite, iPhone/tablet flows and remove decoder path. Audit 62 total / 39 omit-dev, zero critical; high findings remain. [Report](docs/qa/2026-10-16-navigation-seven/REPORT.md).
    - [ ] **B01.8-C2 [AI, SIM]** Complete separately verified Expo/RN/Jest and remaining no-patch advisory migration/backports with native flows. Navigation migration does not close these paths.
      - [x] **B01.8-C2a [AI]** Scope the current Expo Metro config to patched PostCSS 8.5.30; reproduce/fix out-of-tree source-map disclosure tests and preserve normal transforms. Audit 61 total / 38 omit-dev, 0 critical; remaining findings stay open. [Report](docs/qa/2026-10-16-postcss-patch/REPORT.md).
      - [x] **B01.8-C2b [AI, SIM]** SDK54→55 aligned package/runtime migration: clean 766 tests/calendar 16, both exports/prebuild and native iOS compilation/QA passed; fresh review found no blockers, merged/pushed `5a1693a`, CI38889781746 passed. [Report](docs/qa/2026-10-16-sdk55/REPORT.md). Subsequent SDK migrations and remaining advisory paths are tracked below.
      - [x] **B01.8-C2c [AI, SIM]** SDK55→56 checkpoint→57 aligned migration, TS6/native Jest tooling and Xcode27 scene support. Clean 771 tests, calendar 16, both exports/prebuild, native iOS compilation, saved-data upgrade on iOS26 and fresh/cold-resume on iOS27 passed. Audio/recording cleanup and native Files backup round-trip verified; exact queues/counters retained. Complete-peer audit64 full/41 omit-dev, zero critical; SDK58+ and remaining advisories stay open. [QA](docs/qa/2026-10-16-sdk57/REPORT.md).
      - [x] **B01.8-C2d [AI]** Scope Xcode3.0.1 to patched CommonJS UUID11.1.1; verify buffer bounds, project-ID compatibility, strict install, actual iOS project generation and both production exports. Re-audit; remaining roots stay open. [QA](docs/qa/2026-10-17-xcode-uuid/REPORT.md).
      - [x] **B01.8-C2e [AI]** Remove Istanbul’s sprintf-js advisory chain with an exact-parent js-yaml 4 migration; preserve real YAML config loading; strict clean install, 91 suites/892 tests with coverage, independent review and CI39042396347 passed. Full audit 56→51, omit-dev 28 high, zero moderate/critical; braces/node-forge remain open. [Evidence](docs/qa/2026-10-17-nyc-yaml/REPORT.md).
- [ ] **B01.9 [AI, H-PRODUCT, H-ACCOUNT]** Decide whether to restore or retire the historical Kanban Pages deployment. Its previously failing workflow now reports successful deployment on October 16 pushes without an agent configuration change. Owner should confirm the intended publication scope; no Pages/account setting was changed in these batches.

- [x] **B01.10 [AI]** Replace deprecated action runtimes in app CI with official Node 24 actions pinned to release SHAs; keep npm checks on Node 22 and pin Ubuntu 24.04. Verify the actual GitHub Actions run after push.

**Current evidence:** [Foundation report](docs/qa/2026-10-14-foundation/REPORT.md), [development commands](DEVELOPMENT.md). B01.4: interactive iOS 26.0 / Expo Go 54 smoke evidence captured through Xcode 27 Device Hub; see the dated iOS report. This does not establish signed native-release, audio-quality, or hardware acceptance. B01.5: Android Studio found, but SDK/ADB/emulator setup is missing; emulator workflow remains open.

**Exit:** checks have recorded results, CI no longer claims an unperformed build passed, and platform launch evidence or a specific tooling blocker is recorded.

## B02 — Learning correctness, progress, and event history

**Split into reviewable packages:** B02-A conjugations; B02-B learning events/migration; B02-C scheduler/session/progress behavior.

**Main files:** `src/data/conjugations.ts`, `src/types.ts`, `src/utils/srs.ts`, `src/context/DeckContext.tsx`, `src/storage/storage.ts`, study/quiz/progress/home screens, relevant tests.

- [ ] **B02.1 [AI, H-LANGUAGE]** Correct future-tense generation and audit the remaining tense/pronoun tables. Add independent expected-form fixtures including `hablaré`, `comeré`, irregular futures, and region-sensitive forms; have an editor validate the reference set.
  - [x] **B02.1-A [AI]** Correct 127 generated future-tense entries and the plancharon typo, with independently specified regression fixtures for regular/irregular forms and present tú/vos.
  - [x] **B02.1-B [AI]** Structurally audit all 187 entries and record missing independent tú forms in the dated QA report.
  - [x] **B02.1-C [AI]** Correct the panel's tú/vos fallback and remaining independently verified tense/pronoun defects; add relevant regression tests.
  - [ ] **B02.1-D [H-LANGUAGE]** Have a qualified editor accept the reference set and remaining grammar guidance. AI tests do not establish native acceptance.
- [x] **B02.2 [AI]** Define and persist versioned learning events with card/mission ID, modality, timestamp, outcome, hints, and duration where measurable. Make event writes retry-safe and bound history growth.
- [ ] **B02.3 [AI]** Separate recognition, recall, listening, and speaking evidence; prevent an easy multiple-choice success from automatically asserting unaided recall mastery. Preserve old progress without inventing missing historical evidence.
  - [x] **B02.3-A [AI]** Record quiz recognition separately, keep flashcard schedules/counters unchanged, identify modalities/evidence explicitly, and preserve legacy data without invented history.
  - [x] **B02.3-B1 [AI]** Record self-rated flashcard recall observations (including optional quality) alongside the recoverable grading commit; no measured unaided recall claim.
  - [ ] **B02.3-B2 [AI]** Connect assessed listening/speaking observations when those features exist.
    - [x] **B02.3-B2a [AI]** Generated listening observations preserve media/content identity and distinct transcript/model assistance, without SRS grading.
    - [ ] **B02.3-B2b [AI]** Connect speaking observations when a validated speaking exercise exists.
- [ ] **B02.4 [AI]** Audit session queue stability, grading during rapid interactions, daily new-card caps, relearning, resume, and cross-deck behavior. Pin actual failures with regression tests.
  - [x] **B02.4-A [AI, SIM]** Reproduce and fix card skipping when eligible queues shrink, guard overlapping grade submissions, and save the next resume card; verify controlled regressions and iOS simulator behavior.
  - [x] **B02.4-B1 [AI]** Commit grade schedule/counters/seen-word/streak/event/next pointer through a durable journal; deduplicate retained attempts, enforce concurrent new-card caps, preserve provider state on pre-commit failure, guard unresolved Study boundaries, and freeze Difficult practice membership with save retry.
  - [x] **B02.4-B2a [AI, SIM]** Serialize fresh deck reads, editor/management mutations and seed merging with grades/restores through the durable coordinator; pin concurrent lost updates, validate before writes, preserve malformed data and offer startup retry.
  - [x] **B02.4-B2b [AI]** Serialize preference/daily/seen-word/streak/quiz mutations with grading/restores, retain queued input snapshots and generate distinct quiz IDs; pin parallel lost updates and write failure.
  - [x] **B02.4-B2c [AI, SIM]** Persist the exact bounded remaining study queue, region and session identity; gate initial grading on checkpoint success, retry failed checkpoints, filter unavailable resumed cards without refilling, and verify grade/restart/resume/completion on iOS.
  - [x] **B02.4-B2d [AI, SIM]** Make onboarding goal/preferences a recoverable intent; retain setup on save failure with bilingual retry, guard pending controls/rapid submission, and verify a fresh iOS direct-study handoff.
  - [x] **B02.4-B2e [AI, SIM]** Isolate provider-driven deck switches from late grades, retries and deferred checkpoints; invalidate waiting checkpoints on unmount. Pin six regressions, and verify fresh deck identity/limits plus exact cold resume on iOS27. Full 79 suites / 777 tests passed. [QA](docs/qa/2026-10-16-study-boundaries/REPORT.md).
  - [x] **B02.4-B2f [AI]** Exercise the real Study/provider/storage boundary under concurrent editorial patches, card insertion and rename in both invocation orders; verify exact remaining queue, provider/store consistency, remount/resume and interrupted-grade journal recovery with no duplicate credit. Three integration tests and a queue-rebuild mutation check passed; full 92 suites/895 tests. [QA](docs/qa/2026-10-17-study-editor-integration/REPORT.md). Native editor navigation/OS interruption remain in B2.
  - [x] **B02.4-B2g [AI, SIM]** Fix editorial Save & Next skipping the immediate successor when saving removes the current filtered row. Four real-provider regressions failed before correction; retained-row controls pass. iOS unreviewed saves 0→1→2 preserve the active exact seven-card Study queue through navigation and cold restart, with unchanged scheduling/counters/events. Full 92 suites/901 tests, fresh review and CI39044015771 passed; implementation `3c7c5a9` merged/pushed. [QA](docs/qa/2026-10-17-review-filter-advancement/REPORT.md).
  - [x] **B02.4-B2h [AI, SIM]** Retain one exact editorial save intent/draft across slow writes, failure, journal recovery and live font changes; block conflicting controls/native Back, retry without duplicate submission and advance once. Native iOS fault injection verifies held/rejected writes, Back, visible largest-text Retry and cold persistence with unchanged Study queue/counters/events. Full 93 suites/906 tests and independent review passed. [QA](docs/qa/2026-10-17-editor-save-recovery/REPORT.md). Process-death unsaved drafts and broader OS/device acceptance remain separate.
  - [ ] **B02.4-B2 [AI, SIM]** Complete exact full-queue resume, broad relearning/cross-deck and external-navigation audits, unrelated editor mutation races, OS interruption and simulator/device acceptance.
- [x] **B02.5 [AI]** Replace the three-repetitions “mastered” claim with an explicitly defined, evidence-based progress model. Keep estimated and measured abilities visibly distinct.
- [ ] **B02.6 [AI, SIM]** Refresh Home/Progress after study and app resume; verify empty library, fresh install, returning learner, midnight, timezone changes, and upgrade fixtures.
  - [x] **B02.6-A [AI]** Add/test focus, foreground, and local-date refresh with cancellation, stale-response protection, and a Home integration regression.
  - [x] **B02.6-B1 [AI, SIM]** Use local calendar-day labels, preserve same-day legacy counts/target/new budget, compare streak calendar days, verify DST/three-zone fixtures and actual iOS stored-state migration without resetting totals.
  - [x] **B02.6-C [AI, SIM]** Keep Home/Progress due-now counts current within a focused day; skip background timer reads and retain foreground/stale-result guards. Four added cases and full 80 suites / 781 tests pass; native grade/navigation/foreground totals and exact queue retained. [QA](docs/qa/2026-10-17-focused-due-refresh/REPORT.md).
  - [x] **B02.6-C1 [AI]** Close prior startup-state fixture gap with explicit native null/active/inactive/background values, timer suspension and active catch-up; restore RN mock descriptor after each case. No product refresh behavior changed.
  - [ ] **B02.6-B [AI, SIM]** Complete timezone/DST, fresh/empty/returning-user and upgrade coverage, then capture native simulator evidence.
    - [x] **B02.6-B1 [AI]** Add CI integration matrix in Berlin/Bogotá/New York/Auckland: 23/25-hour day boundaries, daily counts/new allowance/target, streaks, same-local-day legacy ISO migration and fresh/returning storage. 16 cases pass. [QA](docs/qa/2026-10-16-calendar-zones/REPORT.md).
    - [ ] **B02.6-B2 [AI, SIM]** Verify live zone changes, native refresh, full fresh/empty/returning/upgrade flows and platform evidence; matrix results do not establish these.

**Batch evidence:** [Second correctness report](docs/qa/2026-10-14-learning-correctness/REPORT.md). Learning history stores at most 5,000 observations and deduplicates retained IDs. Conjugation editorial acceptance and full study transaction/session audits remain open.

**Exit:** known conjugation defects are corrected; data survives migration; practice modes no longer inflate one shared mastery claim; queue/progress behavior is tested.

## B03 — Content trust and editorial production

**Package:** machine validation and review workflow first; human review batches follow independently. **Main files:** `src/data/decks/`, `src/utils/register.ts`, `src/utils/regions.ts`, review screens, audio manifest/generation script, new editorial artifacts.

- [x] **B03.1 [AI]** Export a review inventory with stable IDs, text, examples, translations, tags, register, regional claims, audio provenance, and review status. Prioritize the first mission and the 20 `needs_native` cards.
  - [x] **B03.1-A [AI]** Export the complete deterministic 1,392-card inventory; prioritize explicit native-review requests and vulgar/flirty material, with source/audio provenance.
  - [x] **B03.1-B [AI]** Prepare the exact first-morning mission review packet, SHA-256 script fingerprint and four source anchors in `docs/editorial/first-morning-mission-draft.json`; its status remains unreviewed and it does not approve the pilot script.
- [x] **B03.2 [AI]** Add explicit regional metadata supporting shared/multiple regions rather than relying solely on inferred deck/tag matches; retain compatible filtering and migrations.
- [x] **B03.3 [AI]** Define reviewed/draft/needs-correction states, reviewer attribution, content versions, and a release filter. Automated validation checks completeness and contradictions; it does not certify authenticity.
- [ ] **B03.4 [H-LANGUAGE, AI]** Review the first mission, grammar fixtures, common phrases, slang/register, and regional claims; AI applies reviewed corrections and adds regression fixtures.
- [ ] **B03.5 [AI, H-LANGUAGE]** Prepare recording scripts and speaker briefs; recruit/record through human-led arrangements, obtain appropriate rights/consent, and review pronunciation. Maintain generated versus human audio provenance.
  - [x] **B03.5-A [AI]** Prepare the recording/review handoff brief and provenance guidance in `docs/editorial/README.md`.
  - [ ] **B03.5-B [AI, H-LANGUAGE]** Select exact pilot scripts, obtain human performance/rights and editorial acceptance, then integrate accepted recordings.
    - [x] **B03.5-B1 [AI]** Prepare the exact first-morning draft line sheet, variants, roles, recording/take manifest and acceptance handoff in `docs/editorial/FIRST_MORNING_RECORDING_BRIEF.md`.
    - [ ] **B03.5-B2 [H-LANGUAGE, H-PRODUCT]** Revise/accept the script and arrange human performances/rights; supply recordings and real acceptance evidence.
    - [ ] **B03.5-B3 [AI]** Validate supplied files/manifests and integrate accepted audio with accurate provenance.
- [ ] **B03.6 [AI, H-LANGUAGE]** Review the remaining library in batches, prioritizing usage and risk. Quarantine unresolved teaching content from the release rather than marking it approved.
  - [x] **B03.6-A [AI]** Exclude draft/correction/stale deck cards from reviewed-pack exports and block standard production EAS builds while bundled deck text lacks current attributed acceptance; do not invent approvals.
  - [ ] **B03.6-B [H-LANGUAGE]** Supply actual qualified decisions and accept the selected release library.

**Exit:** released teaching content has traceable editorial status; pilot content and audio are accepted; unresolved content is excluded or explicitly gated. Do not block unrelated UI coding while waiting for recordings.

## B04 — Quizzes and contextual grammar

**Package:** assessment improvements + short contextual explanations. **Main files:** `src/screens/QuizScreen.tsx`, conjugation components/data, learning-event integration, new exercise utilities, tests.

- [ ] **B04.1 [AI, H-LANGUAGE]** Generate plausible distractors with unique answer text and one unambiguous best answer; validate synonyms, alternate regional forms, and grammatical categories.
  - [x] **B04.1-A [AI]** Exclude/deduplicate normalized correct/distractor meaning text and prevent scoring a quiz with only one distinct meaning.
  - [ ] **B04.1-B [AI, H-LANGUAGE]** Improve semantic plausibility and validate synonyms/regional/grammatical alternatives; literal deduplication is not editorial acceptance.
- [x] **B04.2 [AI, SIM]** Offer a small first-session practice experience before ten words have been seen; handle sparse regional pools without duplicate or impossible questions.
- [ ] **B04.3 [AI]** Add unaided production/reverse-recall and cloze exercises, with explicit accepted variants and informative corrections. Keep modality-specific results.
  - [x] **B04.3-A [AI]** Add a versioned offline typed-recall/cloze assessment engine with explicit variants, authored hints/corrections, strict normalization and assessed recall provenance; verify retries, backup preservation and unchanged SRS/counters.
  - [ ] **B04.3-B [AI, SIM, H-LANGUAGE]** Integrate reviewed exercise packs, reference/release checks and an accessible learner player; verify keyboard, correction, hints and completion on simulators.
    - [x] **B04.3-B1 [AI, SIM]** Add the development-gated first-morning player for typed recall/cloze, hints, corrections, explicit retry, assistance evidence and recoverable completion; validate source references and iOS interaction.
    - [ ] **B04.3-B2 [H-LANGUAGE, AI]** Accept exact authored exercise variants/corrections and integrate accepted release content; widen platform/accessibility checks.
- [ ] **B04.4 [AI, H-LANGUAGE]** Add short reviewed grammar explanations attached to useful phrases; cover requests, questions, pronouns, and past events in the pilot's scope.
- [ ] **B04.5 [AI, SIM]** Verify correct/incorrect/hinted responses, accents, punctuation, empty pools, repeated attempts, and learning-event integrity.
  - [x] **B04.5-A [AI, SIM]** Verify short unhinted correct/incorrect and repeat rounds, actual scores, zero/sparse pools, recognition-only events, unchanged flashcard goal, reachable completion controls, and next-question scroll reset.
  - [ ] **B04.5-B [AI, SIM]** Complete hinted/accepted-variant, accent/punctuation, expanded accessibility/layout, and platform coverage as those exercise capabilities are added.

**Exit:** first-time learners can practice; questions test meaningful distinctions; each exercise records the appropriate evidence.

## B05 — Daily guidance and efficient workload

**Package:** onboarding continuity + daily planner + calmer Home. **Main files:** onboarding/home/study screens, `src/storage/prefs.ts`, queue utilities, translations, tests.

- [ ] **B05.1 [AI, H-PRODUCT]** Prepare a concrete starting audience and journey: default proposal is an adult with beginner/basic Spanish preparing for everyday life in Colombia. Make level self-report adjustable; validate the proposal in the pilot.
- [x] **B05.2 [AI]** Use purpose and region throughout recommendations, with editable preferences and a general-content fallback. Include optional trip date and available study time.
  - [x] **B05.2-A [AI, SIM]** Add a bilingual Settings editor for purpose, region, self-reported level, 3/5/10-minute time and optional calendar trip date; preserve unrelated state and version-3 backups, with retry and iOS save/reopen evidence.
  - [x] **B05.2-B1 [AI, SIM]** Rank Home review suggestions by due priority and saved purpose/region, with general fallback and level/time-bounded workload; verify foreground changes and iOS direct handoff.
  - [x] **B05.2-B [AI, SIM]** Consume these preferences in bounded recommendations with general fallback, preserving daily-cap and exact-resume behavior.
  - [x] **B05.2-B2 [AI, SIM]** Carry the saved region into new-card selection with preferred-region priority and general fallback; share recommendation/queue eligibility, preserve due reviews and exact resume, and allow explicit filter overrides. [Evidence](docs/qa/2026-10-17-regional-daily-queue/REPORT.md).
- [ ] **B05.3 [AI]** Build 3/5/10-minute plan options combining due review, a small amount of new material, and one applied activity. Use initial duration estimates, then calibrate with measured session times.
  - [x] **B05.3-A [AI, SIM]** Use saved 3/5/10-minute preference for a bounded flashcard review with initial level-sensitive estimates and small new-card caps; preserve exact bounded resume and validate sparse-content estimates.
  - [ ] **B05.3-B [AI, SIM]** Add the applied-activity phase, complete plan progression and duration calibration; a bounded flashcard review does not close the parent.
    - [x] **B05.3-B1 [AI, SIM]** Measure foreground/focused actionable Study time, journal immutable timing with each grade, and calibrate bounded review estimates from a recent median after sufficient sessions. Verify background exclusion, bilingual native estimates and exact cold resume. [QA](docs/qa/2026-10-17-review-duration/REPORT.md).
    - [ ] **B05.3-B2 [AI, SIM]** Add one applied phase, durable whole-plan progression/resume, and activity-specific duration calibration; honor editorial availability and preserve review-only fallback.
      - [x] **B05.3-B2a [AI]** Add strict durable plan identity/phase/exact-queue storage; atomically link grades to review advancement, retain replay/restore safety, and include optional portable plan state. [QA](docs/qa/2026-10-17-durable-daily-plan/REPORT.md).
      - [ ] **B05.3-B2b [AI, SIM]** Wire Home/Study and the available authored applied activity to this contract, complete the linked applied phase, calibrate its active timing, and verify whole-plan restart/errors/layouts. Contract storage alone does not close B05.3-B2.
        - [x] **B05.3-B2b1 [AI, SIM]** Connect Home → exact bounded Study → one development-gated authored written reply → durable completion, with explicit end, guarded pending writes/retry, production review-only fallback and iOS cold resume. [QA](docs/qa/2026-10-17-daily-plan-flow/REPORT.md).
        - [ ] **B05.3-B2b2 [AI, SIM]** Measure active applied-response time, calibrate activity-specific estimates, and finish wider lifecycle/layout/platform validation; remaining acceptance below does not close B05.3-B2b.
          - [x] **B05.3-B2b2-A [AI, SIM]** Measure actionable foreground response segments, commit completed-run samples with mission/plan, retain unknown interrupted timing, and calibrate Home/fresh plan estimates by current content version after five valid runs. Verify active/background/cold-feedback completion on iOS. [QA](docs/qa/2026-10-17-applied-active-timing/REPORT.md).
          - [ ] **B05.3-B2b2-B [AI, SIM, DEVICE]** Finish broader English/Spanish narrow/tablet/large-text and OS/navigation interruption checks across the whole plan; native Android and signed/physical acceptance remain separately gated. This remains actionable for available iOS surfaces.
            - [x] **B05.3-B2b2-B1 [AI, SIM]** Guard parent End during player writes (including player unmount), preserve answer/pending identity through live text-size reflow, and put recovery actions inside the response scroll. Reproduce/fix largest-text tablet clipping and narrow fixed-footer crowding; verify narrow cold/language/navigation feedback and completion with unchanged counters. [QA](docs/qa/2026-10-17-plan-layout-lifecycle/REPORT.md).
            - [ ] **B05.3-B2b2-B2 [AI, SIM]** Finish tablet software-keyboard behavior and remaining iOS matrix gaps. Unlocked checks passed tablet hardware-keyboard entry, accent feedback and assisted completion, plus narrow largest-text completed-screen touch scrolling and Home return; see the B1 report. Remaining checks are AI simulator work, not hardware-only work.
              - [x] **B05.3-B2b2-B2a [AI, SIM]** Tablet software-key touch entry, live default-to-largest text draft preservation, keyboard dismissal/scroll access, accent feedback cold resume, assisted completion and Home return passed on iPadOS 26. [Native evidence](docs/qa/2026-10-17-native-scroll-keyboard/REPORT.md). Full-button visibility with the keyboard open at largest text, accent-key popup entry and broader matrix remain open.
- [x] **B05.4 [AI, SIM]** Separate reviews due, new cards available, and today's bounded plan; provide catch-up after absence without resetting progress or flooding the learner.
  - [x] **B05.4-A [AI, SIM]** Separate studied reviews due now, fresh library cards, and remaining daily new-card allowance; verify English/Spanish Home and count changes after study.
  - [x] **B05.4-B1 [AI, SIM]** Keep due reviews first and cap the selected flashcard batch after absence; show a separate bounded suggestion and preserve its limits on restart and explicit region changes.
  - [x] **B05.4-B [AI, SIM]** Add familiar-only catch-up after a recorded study gap of seven calendar days, within existing timed bounds; refresh the policy at Start across midnight, preserve exact active plans and separate new availability. Verify bilingual iOS start, two-card boundary and cold exact resume without resetting unselected schedules or introducing new cards. [QA](docs/qa/2026-10-17-absence-catch-up/REPORT.md). Broader platform/layout and pilot acceptance remain in their own gates.
- [ ] **B05.5 [AI, SIM]** Make the main Home action start/resume the recommended activity directly; verify preference changes, timezone changes, and no-content states.
  - [x] **B05.5-A [AI, SIM]** Start the selected due/new deck directly after refreshing the provider budget; cover foreground preference/day changes, empty library, exhausted cap, and read-failure retry in automated tests. Verify direct start on iOS.
  - [ ] **B05.5-B [AI, SIM]** Complete purpose/region/time-aware recommendations, broader resume/timezone scenarios, and platform coverage.

**Exit:** one clear next action consistently reflects the learner's preferences and time budget; the whole library is not presented as overdue work.

## B06 — Authentic listening and regional audio

**Split:** B06-A player/exercises with fixtures; B06-B reviewed audio integration and device checks. **Main files:** `src/services/tts.ts`, audio components/manifest, prefs, new listening screens/content, tests.

- [x] **B06.1 [AI]** Implement replay, phrase looping, transcript reveal, supported speed controls and explicit provenance; honor saved audio preferences. Current generated player is verified; accepted human speaker integration remains B06.3.
  - [x] **B06.1-A [AI, SIM]** Honor saved speed for card clips and device/text fallback; add bilingual Settings speed selection/save, generated pronunciation preview, explicit repeat/Stop and honest backend labels, with stale-request cancellation and failure recovery.
  - [x] **B06.1-B [AI, SIM]** Integrate listening controls and verify automatic speech preferences.
    - [x] **B06.1-B1 [AI, SIM]** Generated listening draft: replay/loop/Stop, saved/explicit speed, hidden transcript, durable transcript assistance, strict bundled playback prerequisite, separate evidence and cold-restart checks. [Report](docs/qa/2026-10-16-listening-practice/REPORT.md).
    - [x] **B06.1-B2 [AI, SIM]** Add opt-in reveal-triggered flashcard speech and Stop; preserve silence on open/resume, cancel stale reads/animated reveals, save/reopen settings and verify phone layout. [Report](docs/qa/2026-10-16-opt-in-speech/REPORT.md).
- [x] **B06.2 [AI]** Support listening without initially showing the Spanish text; record comprehension separately from transcript-assisted answers. Generated draft player/evidence and iPhone restart checks verified; authentic recordings remain B06.3.
- [ ] **B06.3 [AI, H-LANGUAGE]** Integrate accepted phrase and dialogue recordings with speaker/region metadata; support multiple speakers without claiming one voice represents a whole region.
- [ ] **B06.4 [AI, SIM]** Add downloadable audio packs with size/status, cancellation, integrity checks, storage recovery, and offline playback. Do not depend on device TTS for promised offline audio coverage.
- [ ] **B06.5 [AI, DEVICE]** Verify speaker/headphone/Bluetooth playback, mute/volume behavior, speed/intelligibility, interruptions, app background/foreground, and offline restart on actual supported phones.

**Exit:** one reviewed listening set works offline, records honest evidence, and has both automated/player checks and real-device audio results.

## B07 — First complete mission and reusable mission engine

**Split:** B07-A content schema/player; B07-B first mission integration. **Main files:** navigation, types, new mission content/player/state modules, daily-plan integration, learning-event storage, tests.

- [ ] **B07.1 [AI, H-PRODUCT]** Define the first mission: “Your first morning in Medellín,” including its outcome, required phrases, completion criteria, and assisted alternatives. Resolve its focused design before coding the new subsystem.
  - [x] **B07.1-A [AI]** Document the focused technical design and exact text-first draft, with greeting, polite request, unavailable-item alternative, thanks, restricted variants and honest completion labels.
  - [ ] **B07.1-B [H-PRODUCT, H-LANGUAGE]** Accept the experience and exact language before production release/pilot.
- [x] **B07.2 [AI]** Create a versioned mission format for scenes, dialogue, choices, exercises, outcomes, prerequisites, and media references; validate IDs/assets and reject broken branches.
- [ ] **B07.3 [AI, SIM]** Build an accessible player with deterministic branching, hints, retry, save/resume, completion, and offline support. Start with authored branches.
  - [x] **B07.3-A [AI, SIM]** Implement the bundled text-first draft player, exact checkpoints, atomic event/state recovery, duplicate/stale command guards, safe load/save errors, bilingual feedback/completion and backup compatibility; verify the café flow and cold restart on iOS.
  - [ ] **B07.3-B [AI, SIM]** Expand native accessibility, small/tablet and Android checks; validate offline cold launch in the actual candidate and integrate media playback with B06.
- [ ] **B07.4 [AI, H-LANGUAGE]** Assemble reviewed content: hear an exchange, understand it, choose or produce a reply, handle an unavailable item, and complete the practical outcome.
- [ ] **B07.5 [AI]** Feed difficulties back into personalized practice without duplicating events, unfairly penalizing hint use, or changing unrelated card scheduling.
  - [x] **B07.5-A [AI]** Collect unique difficult source IDs per run and show follow-up phrases; keep authored hint and model-answer assistance distinct and leave SRS/daily counters unchanged.
  - [ ] **B07.5-B [AI, SIM]** Provide an explicit follow-up practice handoff and connect accepted mission activity to daily guidance.
    - [x] **B07.5-B1 [AI, SIM]** Add optional difficult-phrase cue/reveal/example practice from completion; verify hidden-answer resets, return/reopen and unchanged runs/events/SRS/daily state.
    - [ ] **B07.5-B2 [AI, SIM]** Connect accepted mission activity and follow-up to personalized daily guidance.
- [ ] **B07.6 [AI, SIM, H-LEARNER]** Verify all branches and interrupted sessions, then run the B13 learner pilot. Speaking can be an optional later enhancement; do not block the first pilot on B09.

**Exit:** one complete mission links comprehension, response, feedback, and subsequent review; scripted technical checks and actual learner findings are recorded separately.

## B08 — Visual identity, navigation, and accessibility

**Split:** B08-A tokens/components; B08-B Home/navigation; B08-C activity/progress screens. **Main files:** `src/styles/theme.ts`, navigation, shared components, screens, translations, assets.

- [ ] **B08.1 [AI, H-PRODUCT]** Prepare concrete visual directions using a real mission and existing screens; choose a coherent direction with Colombian settings/people and appropriate asset rights.
- [ ] **B08.2 [AI]** Define light/dark semantic tokens, typography, spacing, consistent icons, focus/pressed/disabled states, and accessible reusable controls. Replace tiny navigation labels and excessive competing accents.
  - [x] **B08.2-A [AI, SIM]** Increase bottom-tab labels/targets and expose selected tab semantics; add explicit 48-point flashcard audio action and system Reduce Motion support for card/stack transitions with live preference handling.
  - [x] **B08.2-B1 [AI, SIM]** Keep translated tab labels visible at accessibility text sizes using two rows and refresh native tab measurements on live font changes. Spanish/English large/maximum/default checks and actions verified on iOS27; broader screen content remains open. [QA](docs/qa/2026-10-17-accessible-tabs/REPORT.md).
  - [x] **B08.2-B2 [AI, SIM]** Correct observed Home/Settings text remeasurement after live Dynamic Type changes, Home due-title wrapping and fixed Study category tile clipping. Preserve navigation, exercise state and pending saves; capture both languages at default/large/maximum sizes. Corrected and checked on iOS27; representative bilingual default/large/maximum evidence and precise limits are in [QA](docs/qa/2026-10-17-large-text-content/REPORT.md). Broader activity layouts remain under B08.2-B.
  - [x] **B08.2-B3 [AI, SIM]** Correct Study session/region/grading/flashcard and resume-row large-text clipping while retaining active face, queue and pending writes; verify representative bilingual default/large/maximum layouts. [QA](docs/qa/2026-10-17-study-large-text/REPORT.md).
  - [x] **B08.2-B4 [AI, SIM]** Correct Difficult Words and conjugation large-text scrolling, preserve current face/tense and pending grades, reveal the next difficult card after a successful save, and replace misleading fixed intervals with scheduler previews. Representative bilingual iOS checks; broader device coverage stays open. [QA](docs/qa/2026-10-17-difficult-conjugation/REPORT.md).
  - [ ] **B08.2-B [AI, SIM]** Complete theme/token/control consistency, focus/pressed states and large-text/platform layout coverage.
- [ ] **B08.3 [AI, SIM]** Implement mission-led Home and clear access to practice, explore, saved content, and profile/settings; preserve existing features and navigation entry points.
- [ ] **B08.4 [AI, SIM]** Give flashcards, listening, missions, and speaking distinct useful layouts. Present actual learned abilities and next actions in Progress.
  - [x] **B08.4-A [AI, SIM]** Exclude inactive flashcard answers from accessibility focus, include active phrase/example in named flip controls and guard interrupted/stale swipe animations without grading a later card.
  - [ ] **B08.4-B [AI, SIM]** Complete activity-specific layouts, long/large text and evidence-based Progress next actions.
    - [x] **B08.4-B1 [AI, SIM]** Show retained checked/self-rated attempts separately by modality, assisted/unknown assistance counts, explicit history limits and working recognition/flashcard actions; preserve quiz-only metric and remove inactive Share. iPhone navigation and actual saved totals checked. [QA](docs/qa/2026-10-16-progress-evidence/REPORT.md).
    - [ ] **B08.4-B2 [AI, SIM]** Complete broader layouts/large text, platform checks and personalized next actions after accepted activity integration.
- [ ] **B08.5 [AI, SIM]** Capture representative iPhone/Android and supported tablet layouts in both languages/themes, including large text, long content, reduced motion, and narrow screens.
  - [x] **B08.5-A [AI, SIM]** Capture initial dark-theme iPhone and 13-inch iPad mission/audio/Study layouts, including Spanish mission keyboard, landscape and English audio controls; record exact coverage and limits.
  - [ ] **B08.5-B [AI, SIM]** Expand to Android, smaller tablets/narrow views, both themes, long/large text and full activity coverage.
- [ ] **B08.6 [AI, DEVICE, H-LEARNER]** Verify real screen-reader navigation, tap comfort, daylight readability, and accessibility preferences; obtain feedback from people who use relevant assistive features where possible.

**Exit:** consistent implemented screens have screenshot evidence and accessible flows; visual attractiveness and practical usability have human feedback.

## B09 — Speaking feedback and voice-note missions

**Split:** B09-A record/replay; B09-B evaluated feedback service; B09-C optional conversational extension. **Main files:** new recording/speaking modules, permissions/config, mission integration; server-side service if selected.

- [ ] **B09.1 [AI, H-PRODUCT, H-ACCOUNT]** Compare device-local and hosted recognition/feedback against latency, cost, regional handling, retention, and privacy requirements. Use fixtures until a provider/budget is selected.
  - [x] **B09.1-A [AI]** Prepare official-source Apple/Android local and Azure/Google hosted shortlist, exact regional/retention limits, cost/latency evaluation and fixture-first implementation contract. [Decision packet](docs/speaking/OPTIONS_AND_EVALUATION.md). No provider selected or performance result invented.
  - [ ] **B09.1-B [H-PRODUCT, H-ACCOUNT, AI]** Select scope/provider/budget/retention; supply authorized account and consented recordings as needed, then run the measured device/service comparison.
- [ ] **B09.2 [AI, SIM]** Implement permission request/denial/recovery, record/replay/delete, recording indicators, interruption handling, and a non-speaking alternative.
  - [x] **B09.2-A [AI, SIM]** Development-only local self-check: bounded one-take recording/replay/delete, cancellation/retry controller and native fixtures, explicit permission/denial/settings path, unscored text alternative; production permission blocks. [QA](docs/qa/2026-10-16-local-voice-practice/REPORT.md). Actual capture is not established by fixtures.
  - [ ] **B09.2-B [AI, SIM, DEVICE]** Verify granted capture/replay/delete and interruptions in an authorized development client, both platforms and physical audio routes; validate signed production permission exclusions before enabling any release scope.
    - [x] **B09.2-B1 [AI, SIM]** Authorized native iOS development-client capture/Stop/replay/delete,30-second auto-stop and Back cleanup; zero retained recording files and unchanged learning counts verified. [SDK55 QA](docs/qa/2026-10-16-sdk55/REPORT.md).
    - [ ] **B09.2-B2 [AI, SIM, DEVICE]** Android, OS interruptions/settings changes, routes/audio quality and actual signed-production exclusions remain separate.
- [ ] **B09.3 [AI, H-LANGUAGE]** Define feedback for task completion, intelligibility, and phrasing. Do not equate transcription accuracy with phonetic pronunciation scoring; validate any scores against editor-rated recordings.
  - [x] **B09.3-A [AI]** Draft separate task/intelligibility/phrasing/transcript/assistance rubric, cannot-assess behavior, held-out and disagreement evaluation. [Rubric](docs/speaking/OPTIONS_AND_EVALUATION.md#draft-feedback-rubric).
  - [ ] **B09.3-B [H-LANGUAGE, H-LEARNER, AI]** Accept task/rating definitions, supply independent recordings/ratings and evaluate actual model feedback before enabling assessed speaking claims.
- [ ] **B09.4 [AI]** If hosted, keep keys server-side; add consent, authentication as appropriate, rate/spend limits, timeout/retry/cancel, retention/deletion, and safe logs. Verify offline behavior.
- [ ] **B09.5 [AI, H-LANGUAGE]** Add an authored voice-note scenario with a short message, learner response, relevant follow-up, one useful correction, and targeted review.
- [ ] **B09.6 [AI, DEVICE, H-LEARNER]** Evaluate real microphones, Bluetooth/headsets, quiet/noisy environments, accents, hesitations, weak connectivity, interruptions, and permission changes on both shipped platforms.

**Exit:** feedback is understandable and evaluated against human judgments; hardware and failure paths pass. Open-ended AI conversation remains optional until this works well.

## B10 — Enjoyment, stories, and rewards

**Package:** mission-linked rewards and one short story arc; avoid multiple unrelated game systems.

- [ ] **B10.1 [AI, H-PRODUCT]** Choose a small passport/stamp system tied to demonstrated mission outcomes, with clear assisted versus independent completion.
- [ ] **B10.2 [AI, H-LANGUAGE]** Create recurring characters and a short culturally grounded story arc; validate humor, register, and representation.
- [ ] **B10.3 [AI]** Implement rewards, optional celebrations, reduced-motion behavior, retry consistency, and personal-best challenges without duplicate rewards or progress loss.
- [ ] **B10.4 [AI, SIM]** Integrate rewards into mission completion and Progress; keep streak recovery supportive and accessible.
- [ ] **B10.5 [H-LEARNER, AI]** Test whether stories/rewards improve willingness to practice and learning performance; reduce or remove elements that distract or pressure people.

**Exit:** one enjoyable story/reward loop supports practical learning and has pilot feedback.

## B11 — Backup, optional sync, and service foundation

**Split:** B11-A backup/restore reliability now; B11-B optional account/sync later; B11-C hosted infrastructure only if needed. **Main files:** storage/context, settings, new backup/sync modules, server code if selected.

- [x] **B11.1 [AI, SIM]** Make backup export/import usable as a file with clear dates/content, validation, safe merge/replace, preview, and recovery. Preserve custom cards, edits, favorites, event history, and preferences.
  - [x] **B11.1-A [AI]** Include versioned recognition history in clipboard backups; retain legacy import support, validate incoming events, and merge without deleting newer observations. Full file-based/atomic recovery work remains open.
  - [x] **B11.1-A2 [AI, SIM]** Add dated JSON file export/import, size and schema validation, in-app counts/date/limitations preview, guarded additive merge or deck replacement, safe share-file lifetime, and iOS Expo Go save/import/cancel acceptance. Preferences, streak, seen-word and full-state migration remain open.
  - [x] **B11.1-B [AI, SIM]** Add validated version-3 supported local-state snapshots and explicit journaled app-state restore, legacy compatibility and safe absent-state defaults; verify iOS save/import/restore/restart. OS permissions, scheduled notifications and caches are not portable state.
- [ ] **B11.2 [AI]** Test corrupt/oversized/old backups, partial writes, duplicate IDs, migration failure, and interrupted restore; never silently wipe existing progress.
  - [x] **B11.2-A [AI]** Validate clipboard backup deck/card structure, scheduling and optional fields, unique deck/card IDs, supported versions/history, and input size before confirmation or writes; preserve valid legacy content and handle clipboard-read errors.
  - [x] **B11.2-B1 [AI]** Add serialized durable restore journaling, replay before app storage access, startup recovery/retry, conflict validation before writes, and failure-injection tests for interrupted deck/history restore.
  - [x] **B11.2-B2a [AI]** Validate supplemental state, preserve corrupt source state, migrate legacy streaks and replay interrupted full-state restore under failure injection.
  - [ ] **B11.2-B2 [AI, SIM]** Complete simulator interrupted-restore acceptance. Hardware/file-share validation stays separate.
  - [x] **B11.2-C [AI, SIM]** Reverify native clipboard success/import-cancel alerts and file export/picker/preview/cancel with the new profile and bounded queue fields; compare unchanged local state and retained source.
- [ ] **B11.3 [AI, H-PRODUCT]** Decide whether cross-device demand justifies optional accounts. Keep local learning available without an account.
- [ ] **B11.4 [AI, H-ACCOUNT]** If enabled, implement secure auth, per-user access, sync conflicts, offline queues, deletion/export, and recovery; configure production services through authorized accounts.
- [ ] **B11.5 [AI, DEVICE]** Verify backup through real share/file flows; if sync exists, test two physical devices, reinstall/recovery, conflicting offline edits, and interrupted connectivity.
- [ ] **B11.6 [AI, H-PRODUCT]** Inventory all diagnostics/network data, validate crash-reporting redaction and sampling, and update privacy disclosures to match actual behavior.
  - [x] **B11.6-A [AI]** Audit runtime/developer data flows, test a JavaScript diagnostic allowlist, disable automatic traces/sessions/native/log collection in this configuration, and correct the repository technical privacy disclosure.
  - [ ] **B11.6-B [H-PRODUCT, H-ACCOUNT, DEVICE]** Supply the public contact, verify actual signed-build envelopes and configured service retention/access/IP handling, and accept the release disclosure/store forms.

**Exit:** B11-A can ship independently. Account/sync/service tasks are conditional and remain unchecked until deliberately selected and verified.

## B12 — Physical-device and release regression matrix

**Package:** maintain one repeatable test script and evidence matrix; rerun affected cases for each candidate. AI writes the script, builds, diagnoses, and fixes failures. Device access and sensory judgments may require a person.

- [ ] **B12.1 [AI, SIM]** Establish fixtures for fresh/returning learners, large libraries, difficult cards, empty filters, corrupted data, long text, and upgrades. Record tested OS versions and build identifiers.
  - [x] **B12.1-M [AI, SIM]** Replace the Settings placeholder with actual native version/build, distinct Expo Go host labels and localized unknown handling; remove the inactive store action. Native Spanish/English label matches binary 1.0.0/build1.0.0. [QA](docs/qa/2026-10-16-native-build-metadata/REPORT.md).
- [ ] **B12.2 [AI, DEVICE]** Test a physical iPhone on each promised support boundary; cover an older/lower-performance supported device and a current device where feasible. Record gaps explicitly.
- [ ] **B12.3 [AI, DEVICE]** Test physical Android hardware if Android ships, including a lower-performance supported device and relevant vendor battery restrictions. Emulator results are supplementary.
- [ ] **B12.4 [AI, SIM, DEVICE]** Test tablets if advertised/supported by the release; app configuration currently enables iPad support. Either validate the supported layout or deliberately narrow support.
  - [x] **B12.4-A [AI, SIM]** Establish dedicated iPad Pro 13-inch / iPadOS 26 simulator smoke: fresh onboarding, Study flip, draft mission typing/feedback/rotation/restart and English audio preview/Stop/save.
  - [ ] **B12.4-B [AI, SIM, DEVICE]** Complete smaller-tablet, window/multitasking, large-text, theme, accessibility and signed-candidate/hardware validation; refine wide layouts.
- [ ] **B12.5 [AI, DEVICE]** Verify audio/microphone routes, interruptions, permissions changed in OS settings, actual scheduled reminders, notification taps, and app background/termination behavior. Audit reminder settings against implemented behavior, including the rolling word-of-day window.
  - [ ] **B12.5-C [AI, SIM]** Verify narrow Study grading interval labels and touch access around the bottom tabs in the catch-up cold-resume capture, including scrolling, safe areas and larger text. Reproduce persistent clipping before proposing a fix; preserve grading. [Evidence](docs/qa/2026-10-17-absence-catch-up/cold-resume-es.png).
    - [x] **B12.5-C1 [AI, SIM]** Default-text touch scrolling exposes all four grading interval labels above bottom tabs. Largest-text Good/Easy are visible and a real Good touch produces exactly one grade without changing the linked plan. [Evidence](docs/qa/2026-10-17-native-scroll-keyboard/REPORT.md). Largest-text Again/Hard inspection remains in C.
- [ ] **B12.6 [AI, DEVICE]** Verify airplane-mode cold launch, downloaded content, poor network, low storage, file sharing, reinstall with backup, and upgrade without progress loss.
- [ ] **B12.7 [AI, DEVICE]** Measure startup, scrolling, memory, battery/thermal behavior, and storage on hardware; set budgets from the baseline and pilot needs, then track regressions.
- [ ] **B12.8 [AI, SIM, DEVICE]** Run end-to-end regression against the actual signed release candidate, not only Expo Go or a development build. Record accessibility checks and crash results.

**Exit:** all shipped-platform critical cases pass on the named candidate, or a specific scope reduction removes the unsupported capability. “Simulator passed” alone cannot close physical-device rows.

## B13 — Learner pilot and effectiveness

**Package:** research protocol + first mission pilot + findings and prioritization. Human participation is necessary; AI can prepare, analyze, and implement responses.

- [ ] **B13.1 [AI, H-PRODUCT]** Define success measures before the pilot: first-session completion, time to useful outcome, hint usage, delayed unaided recall, comprehension of a new speaker, and success in a new scenario. Treat numeric targets as hypotheses until baseline data exists.
  - [x] **B13.1-A [AI]** Prepare the dated pilot protocol, explicit measures/denominators, missingness/assistance rules, audience hypothesis, readiness and data-handling decisions; no recruitment or outcomes claimed.
  - [ ] **B13.1-B [H-PRODUCT]** Accept the candidate, audience, collection/retention arrangements and predeclared feasibility criteria before recruitment.
- [ ] **B13.2 [AI, H-LANGUAGE]** Prepare equivalent pre/post/transfer tasks and delayed checks (for example, the next day and one week later); avoid simply repeating the memorized quiz.
  - [x] **B13.2-A [AI]** Prepare parallel/transfer/delayed task specifications, scoring rubric and an empty observation template; label materials unaccepted and keep human language/audio review open.
  - [ ] **B13.2-B [H-LANGUAGE, AI]** Author/accept exact Spanish prompts, variants, equivalent forms and novel-speaker assets, then integrate reviewed corrections.
- [ ] **B13.3 [H-PRODUCT, H-LEARNER]** Recruit a small directional pilot, initially around 5–8 people spanning beginners and learners with basics; obtain consent and agree on appropriate data collection. This sample is not proof of broad efficacy.
- [ ] **B13.4 [H-LEARNER, AI]** Observe independent first use and complete delayed checks; record confusion, pronunciation feedback problems, accessibility needs, motivation, and actual task performance.
- [ ] **B13.5 [AI]** Analyze modality-specific events and qualitative findings; distinguish usability results from learning effects and retention metrics.
- [ ] **B13.6 [AI, H-PRODUCT]** Select fixes and expansion scope from evidence. Update this master plan before multiplying missions or introducing major paid AI features.

**Exit:** pilot findings identify what worked, what failed, study limitations, and the next investment decision.

## B14 — Commercial and store readiness

**Split:** B14-A positioning/assets/disclosures; B14-B payments if selected; B14-C release preparation/publication.

- [x] **B14.1 [AI]** Refresh official-source competitor evidence and positioning; correct unsupported exclusivity/efficacy/voice claims, counts and conditional store copy. [Analysis](COMPETITIVE_ANALYSIS.md), [report](docs/qa/2026-10-16-market-positioning/REPORT.md). Candidate/editorial/account acceptance stays separate.
- [ ] **B14.2 [AI, H-PRODUCT]** Prepare concrete free/core/paid options and cost scenarios. Consider a paid offline library and separately limited hosted AI; select pricing only after pilot feedback and cost analysis.
  - [x] **B14.2-A [AI]** Prepare free companion, paid offline library and optional capped hosted-practice options, explicit scope/tradeoffs, cost formulas and labeled sensitivity scenarios. [Owner decision packet](docs/product/COMMERCIAL_OPTIONS.md). No pricing/vendor/entitlement selection is implied.
  - [ ] **B14.2-B [H-PRODUCT, H-ACCOUNT]** Supply actual production/support/provider/storefront inputs and pilot evidence, then choose scope, budget and pricing.
- [ ] **B14.3 [AI, H-ACCOUNT]** If charging, implement entitlements and restore purchases; configure products/accounts through authorized access. Verify sandbox purchase, cancellation, refund/revocation, offline entitlement, and reinstall flows on physical devices.
- [ ] **B14.4 [AI, H-PRODUCT]** Update privacy policy, data disclosures, support/deletion flows, recording consent, and age/content suitability against actual shipped features and slang content. Obtain specialist review if a concrete unresolved requirement needs it.
- [ ] **B14.5 [AI, SIM]** Generate screenshots and preview material from the actual app at current store-required formats; verify current submission requirements rather than reusing obsolete device-size lists.
- [ ] **B14.6 [H-ACCOUNT, AI]** Resolve developer accounts, identity/agreements, signing, production configuration, and distribution access. AI prepares builds/metadata; owner-only account actions remain explicit.
- [ ] **B14.7 [AI, DEVICE, H-PRODUCT]** Close B03 release-content gates, B12 candidate checks, and blocking pilot findings. Prepare rollout, migration recovery, monitoring, and support instructions.
- [ ] **B14.8 [H-PRODUCT, H-ACCOUNT, AI]** Review the concrete candidate and authorize submission/publication. Submit through supported authorized tooling; record store outcome and any rejection follow-up.

**Exit:** chosen release scope is accurate, tested, supportable, and explicitly authorized for publication. This planning request does not publish the app.

## B15 — Conditional experiments, not launch blockers

Select these only after B13 indicates value. Each needs its own outcome, scoped design, acceptance criteria, cost assessment, and evidence before completion.

- [ ] **B15.1 [AI, H-LEARNER]** Personal language collection: save something encountered in daily life, preserve context, review the explanation, and practice it later.
- [ ] **B15.2 [AI, H-LANGUAGE]** Regional comparisons using several reviewed speakers and contextual notes, avoiding one-to-one dialect stereotypes.
- [ ] **B15.3 [AI, H-LEARNER]** Trip-date preparation and downloadable destination packs after the basic daily planner proves useful.
- [ ] **B15.4 [AI]** Evaluate FSRS against the existing scheduler using suitable review history, retention calibration, workload, and safe migrations. Do not claim improved learning from an algorithm swap alone.
- [ ] **B15.5 [AI, H-LANGUAGE, H-ACCOUNT]** Native-speaker video and licensed media after rights, production cost, accessibility, downloads, and demand are established.
- [ ] **B15.6 [AI, H-LEARNER, DEVICE]** Open-ended AI conversation after structured speaking feedback proves reliable and its running cost is understood.

**Deferred by default:** tutor marketplace, public social feed, competitive leagues, AR/VR, formal certification, and expansion to multiple countries. Reopen only with a demonstrated learner need and a viable operating model.

## Human work to arrange early

| Needed input                         | Concrete deliverable AI can prepare first                              | Who is actually needed                                              | When it blocks                              |
| ------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| Regional content and grammar review  | Prioritized spreadsheet/JSON, proposed corrections, reference fixtures | Colombian editor(s) familiar with relevant regions                  | Release of affected teaching content        |
| Authentic human audio                | Scripts, recording brief, file naming, review player, rights checklist | Consenting speakers and audio reviewer                              | Human-audio claims and accepted audio pilot |
| Learner research                     | Testable build, tasks, consent copy, observation template              | Representative learners and someone arranging participation         | Effectiveness/usability conclusions         |
| Hardware access                      | Installable build, automated/manual script, expected results           | Access to supported iPhone/Android/tablet; human handling if needed | Physical-device validation                  |
| Brand, scope, provider cost, pricing | Concrete options, examples, measured tradeoffs                         | Product owner                                                       | Dependent choices only                      |
| External accounts and release        | Ready build, metadata, configuration instructions                      | Account owner, store review process                                 | Account-only actions and publication        |

None of these requires the owner to implement application code. Content review and pilot recruiting can be arranged while AI completes foundation work. Do not contact reviewers or learners without explicit authorization.

## Definition of done for every implementation package

- [ ] Selected task IDs and acceptance criteria are stated in the change description.
- [ ] Existing data and backwards compatibility are preserved or a tested migration is provided.
- [ ] Relevant automated checks pass; baseline failures and unrun checks are disclosed.
- [ ] Changed UI flows have simulator/emulator evidence on the platforms actually exercised.
- [ ] Required human/editorial and physical-device checks are individually recorded, not inferred from automated tests.
- [ ] Network/permission/error/offline states relevant to the package are verified.
- [ ] This checklist and supporting docs reflect delivered behavior and unresolved work.

## Work log

Append one row per completed package; link longer evidence from the row. Keep implementation, editorial acceptance, and hardware sign-off distinguishable.

| Date       | Bundle/task IDs | Status           | Commit / artifact | Verification and platform                                                                     | Human/device work still open                      |
| ---------- | --------------- | ---------------- | ----------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 2026-10-14 | Master plan     | Document created | `MASTER_PLAN.md`  | Source/config/test inventory and local tooling inspected; no implementation or app QA claimed | All implementation and release checks remain open |

### First AI implementation batch — 2026-10-14

B01.1/B01.2/B01.3/B01.6/B01.7 are verified locally; B02.1-A/B, B03.1-A, and B03.5-A are complete subpackages with their parent human/editorial tasks still open. See `docs/qa/2026-10-14-foundation/REPORT.md` and `docs/qa/2026-10-14-foundation/final-checks.txt`. Code review found no blockers; the minor stale-inventory concern was addressed by regenerating and comparing the checked-in inventory in CI. Native project generation/JS bundling is not native compilation or device testing. Functional changes were fast-forward merged and pushed to `main` at `76c399e`. [GitHub Actions run 38524675722](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38524675722) passed on Linux/Node 22, including quality/content checks and independent iOS/Android project generation and JS bundles. Main was retested locally after merging: 36 suites / 334 tests passed, plus types/lint/format/data checks. The historical Kanban Pages deployment failed independently due to missing repository Pages configuration; see B01.9. No website publication was enabled.

| Date       | Bundle/task IDs                            | Status                    | Commit / artifact                                    | Verification and platform                                                                           | Human/device work still open                                                                                                      |
| ---------- | ------------------------------------------ | ------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-14 | B01.1/2/3/6/7; B02.1-A/B; B03.1-A; B03.5-A | Merged and pushed to main | `76c399e` (functional batch), `ad3ffff` (formatting) | 334 tests; local checks; Linux/Node 22 CI run 38524675722 passed; production iOS/Android JS bundles | Interactive iOS QA, Android SDK/emulator setup, native/editorial acceptance, physical-device checks; remaining AI tasks stay open |

### Second AI correctness batch — 2026-10-14

B02.1-C, B02.2, B02.5, B02.3-A, B02.6-A, B04.1-A, and B11.1-A were merged and pushed to `main` at `e6bbc56`. [GitHub Actions run 38528081242](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38528081242) passed on Linux/Node 22, including all quality/content checks and independent iOS/Android native project generation and production JS bundles. Main was also retested locally after merging. See [the report](docs/qa/2026-10-14-learning-correctness/REPORT.md) for the event schema, regression evidence, and explicit limits. The full suite passed 372 tests across 40 suites. Recognition is now separate from flashcard scheduling; flashcard event production and broader session/transaction safety remain open.

### iOS simulator retry — 2026-10-14

Historical attempt: the owner confirmed the Mac was unlocked. CoreSimulator boot, Metro startup, Expo URL dispatch, and screenshot capture worked, but the old UI entry point was unavailable. The initial diagnosis blamed missing `Simulator.app`; this was corrected after identifying Xcode 27 Device Hub, and later interactive checks succeeded. The display still showed the first-open Expo Go confirmation. B01.4 and screen/restart checks remain open; no app-flow acceptance is claimed. See the foundation QA report for the exact retry evidence.

### Dependency triage and CI maintenance — 2026-10-14

B01.8-A/B and B01.10 delivered in `306f114`, merged and pushed to main. [GitHub Actions run 38594812008](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38594812008) passed all quality/content, iOS/Android project generation, production JS bundle, and artifact-upload jobs; B01.8-C remains open. See [the dependency report](docs/qa/2026-10-14-dependency-triage/REPORT.md) and its exact audit snapshot. Full tests remain 40 suites / 372 tests. No simulator, physical-device, native signing, or editorial acceptance is claimed.

### iOS smoke and study-queue corrections — 2026-10-14

B01.4 and B02.4-A passed 40 suites / 376 tests, static/data checks, independent follow-up review (29 Study-screen tests), and corrected iOS single-grade/restart checks. They have dated screenshots and regression evidence in [the iOS smoke report](docs/qa/2026-10-14-ios-smoke/REPORT.md). The Xcode 27 setup guidance now correctly uses Device Hub. Broader study persistence, daily-cap/planner behavior, actual audio acceptance, Android, and physical-device checks remain open.

Implementation `0f9811e` was merged and pushed to main. [GitHub Actions run 38620447936](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38620447936) passed all quality/content checks and iOS/Android project generation and production JS bundles. Interactive evidence remains specifically iOS 26.0 / Expo Go through Device Hub; Android bundling is not Android emulator coverage.

### Early quiz practice — 2026-10-14

B04.2 and B04.5-A are complete with [dated regression and simulator evidence](docs/qa/2026-10-14-early-quiz/REPORT.md). Learners can start after one studied word; rounds remain capped at ten, and recognition stays separate from flashcard progress. A simulator-discovered clipped completion action is now scrollable, with each question starting at the top. Semantic distractor quality and full platform/accessibility/release checks remain open.

Implementation `041e109` was merged and pushed to main. [GitHub Actions run 38623220871](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38623220871) passed all quality/content and iOS/Android project generation and production JS bundle checks. Final local verification: 40 suites / 380 tests, types/lint/format/data/inventory checks, and iOS short-round interaction.

### Home workload and direct study — 2026-10-15

B05.4-A and B05.5-A are complete with [regression and iOS simulator evidence](docs/qa/2026-10-15-home-workload/REPORT.md). Home separates studied reviews due now from the fresh library and daily new-card allowance, and opens the selected study session directly. A fresh provider-budget read is required before starting; failed reads show a retryable error. Spanish simulator inspection also caught and verified a corrected clipped streak badge. The bounded timed planner, personalized recommendations, broader timezone/resume scenarios, Android interaction, and physical-device acceptance remain open. Implementation `b593e03` was merged and pushed to main. [GitHub Actions run 38677765924](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38677765924) passed quality/content and iOS/Android project generation and production JS bundle jobs. Final local verification passed 41 suites / 390 tests plus types/lint/format/data/inventory checks. These bundles do not constitute native compilation or physical-device acceptance.

### Backup input validation — 2026-10-15

B11.2-A adds pre-write validation for corrupt deck/card data, duplicate IDs, unsupported versions/history, and oversized clipboard input, with legacy custom-content compatibility and clipboard-read error handling. See [the evidence and limits](docs/qa/2026-10-15-backup-validation/REPORT.md). B11.1/B11.2 remain open for file-based restore and recovery from partial/interrupted writes. Simulator interaction was blocked by the Mac lock during this batch; automated checks do not substitute for it. Implementation `6e0cbdf` was merged and pushed to main. Final local verification: 41 suites / 419 tests plus types/lint/format/data/inventory checks. [GitHub Actions run 38678603279](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38678603279) passed quality/content and independent iOS/Android project generation and production JS bundle jobs.

### Recoverable backup restore — 2026-10-15

B11.2-B1 adds a durable after-image journal for deck/history restore, replay before app storage access, serialization with event writes, and a startup recovery/retry screen. See [the report](docs/qa/2026-10-15-restore-recovery/REPORT.md). This is roll-forward recovery, not a native database transaction. Full-state/file-based backup, simulator interruption acceptance, and hardware durability remain open.

Implementation `80a2982` was merged and pushed to main; [GitHub Actions run 38679345816](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38679345816) passed quality/content and iOS/Android project generation and production JS bundle jobs. Local verification passed 44 suites / 438 tests and static/content checks.

### Explicit region membership — 2026-10-15

B03.2 supports declared shared/multiple region membership, filtering and localized quiz labels, compatible legacy inference, stored metadata preservation during seed updates, backup validation and schema-2 editorial inventory provenance. See [the report](docs/qa/2026-10-15-region-metadata/REPORT.md) and [authoring guidance](docs/editorial/REGIONS.md). Existing library regional claims remain unverified pending B03 editorial acceptance; explicit declarations are not native-review sign-off.

Region implementation `4b33a55` passed [GitHub Actions run 38679733478](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38679733478) with 44 suites / 448 tests locally and all static/content checks.

### Diagnostic data and privacy accuracy — 2026-10-15

B11.6-A adds tested JavaScript error redaction and a code-backed data inventory, and corrects outdated network/storage/clipboard claims in the repository privacy draft. No service settings were changed or public policy published. B11.6-B owner/account/signed-device checks remain open. See [the report](docs/qa/2026-10-15-diagnostics-privacy/REPORT.md).

### Recoverable flashcard grading — 2026-10-15

B02.3-B1 and B02.4-B1 add one recoverable grade intent covering scheduling, daily counters, seen words, streak, self-rated recall evidence and the next-card pointer. Study and Difficult practice preserve attempt identity through retry and no longer increment a second independent counter. See [the report](docs/qa/2026-10-15-transactional-grading/REPORT.md). Exact queue restoration, broad external-navigation/editor races and physical/OS interruption checks remain open.

Diagnostics implementation `3f55dbf` was merged and pushed to main. [GitHub Actions run 38680261404](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38680261404) passed quality/content and iOS/Android project generation and production JS bundle jobs. Final diagnostics baseline: 45 suites / 453 tests.

### File backups and renewed iOS acceptance — 2026-10-15

B11.1-A2 delivers file-based deck/card/event backup with explicit preview and additive merge. Simulator testing caught and fixed a picker-to-alert presentation race and an existing invalid native Alert import masked by the Jest mock. See [the report](docs/qa/2026-10-15-file-backups/REPORT.md). Full-state backup, interrupted restore acceptance, Android provider behavior and physical-device acceptance remain open.

Grading implementation `1a329d6` passed [GitHub Actions run 38681070946](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38681070946). Renewed iOS simulator checks confirmed one grade, daily/new-card totals and persisted self-rated event after process restart; exact queue and interruption work remains open.

Implementation `1e98e24` was merged and pushed to main. [GitHub Actions run 38712206939](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38712206939) passed quality/content and independent iOS/Android project generation and production JavaScript bundles. Native compilation/signing and device acceptance are still separate gates.

### Atomic deck edits — 2026-10-15

B02.4-B2a fixes reproduced lost grades and overlapping editor updates by committing each deck mutation from current stored data inside the durable coordinator. Startup merge failures retain the existing data and show retry. See [the report](docs/qa/2026-10-15-atomic-deck-edits/REPORT.md). Full-queue resume, external-navigation/UI refresh races, preference/counter writers and physical interruption remain open.

Implementation `23ef29d` was merged and pushed to main. [GitHub Actions run 38719896046](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38719896046) passed quality/content and independent iOS/Android project generation and production JavaScript bundle jobs. This does not establish native compilation/signing or physical-device acceptance.

### Supported local-state backup — 2026-10-15

B11.1-B and B11.2-B2a add a version-3 file snapshot with preferences, daily counts/goals, streak, seen words, quiz history, notification preferences and saved session pointer. A distinct app-state restore mode journals all supported state together; card-only modes retain local state. See [the report](docs/qa/2026-10-15-complete-backups/REPORT.md). OS permissions, caches, complete queue restoration and physical/native interruption remain separate.

Implementation `8ae6250` was merged and pushed to main. [GitHub Actions run 38721570387](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38721570387) passed quality/content and iOS/Android project generation and production JavaScript bundles. Final local verification: 50 suites / 511 tests; iOS file export/app-state restore/restart accepted as documented.

### Editorial release pipeline — 2026-10-15

B03.3 / B03.6-A add a separate attributed decision ledger, exact teaching fingerprints/version candidates, stale-review invalidation, filtered reviewed-pack export and standard production EAS deck gate. The empty real ledger produces 1,392 effective drafts; development remains usable. [Workflow](docs/editorial/RELEASE_WORKFLOW.md), [report](docs/qa/2026-10-15-editorial-release/REPORT.md). This is machine enforcement, not invented human acceptance; grammar/audio/mission review and any future filtered-pack runtime integration remain separate.

Editorial implementation `7ad5265` passed [GitHub Actions run 38722545095](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38722545095), including 51 suites / 525 tests locally, ledger/inventory checks and iOS/Android project generation/production JavaScript bundles. The expected editorial production gate remains closed pending actual human decisions.

### Calendar and local-state coordination — 2026-10-15

B02.4-B2b / B02.6-B1 close reproduced preference/daily/seen-word/quiz lost updates, serialize streak effects, replace timestamp-only quiz IDs and use calendar-day identities for daily totals/streaks. [Report](docs/qa/2026-10-15-calendar-storage/REPORT.md). Legacy instants lack their original zone, so migration uses the current zone; native timezone switching, broader resume/clock behavior and exact session queues remain open.

Calendar/storage implementation `073f279` passed [GitHub Actions run 38723557623](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38723557623), including quality/content and iOS/Android project generation/production JavaScript bundles. Final local suite: 53 suites / 539 tests; iOS migration retained saved totals.

### Exact bounded study resume — 2026-10-15

B02.4-B2c preserves the remaining queue and session identity through grading, backup and restart, with checkpoint retry and distinct batch completion. [Report](docs/qa/2026-10-15-exact-study-resume/REPORT.md). Final local verification: 54 suites / 556 tests, types/lint/format/data/editorial checks and unchanged generated inventory. Independent review found a stale read-error state; its regression failed before correction and passed afterward. iOS resumed the exact six-card suffix after process termination and finished it with an empty saved queue. Broader external navigation, difficult-mode policies and physical/native interruption remain open.

Implementation `8b945db` was merged and pushed to main. [GitHub Actions run 38749492905](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38749492905) passed all quality/content checks and independent iOS/Android project generation and production JavaScript bundles. These do not constitute native compilation or physical-device acceptance.

### Production exercise engine — 2026-10-15

B04.3-A adds the deterministic typed-recall/cloze foundation, explicit variants/hints, accent corrections and assessed recall provenance without changing card scheduling. [Report](docs/qa/2026-10-15-production-exercises/REPORT.md). Final verification: 55 suites / 590 tests plus static/content checks; review findings reproduced and corrected. UI, reviewed exercise content and simulator acceptance remain open under B04.3-B.

Implementation `d9687b9` was merged and pushed to main. [GitHub Actions run 38750355516](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38750355516) passed quality/content and independent iOS/Android project generation and production JavaScript bundles. Native UI integration remains open.

### Onboarding save recovery — 2026-10-15

B02.4-B2d fixes silent onboarding save failure, commits setup together and blocks navigation until acknowledged success. [Report](docs/qa/2026-10-15-onboarding-recovery/REPORT.md). Final suite: 57 / 602 tests; static/content checks and fresh independent review passed. A dedicated fresh iOS simulator reached Travel directly with the selected goal and consistent stored setup. Native low-storage/physical interruption and broader planner work remain open.

Implementation `c77550b` was merged and pushed to main. [GitHub Actions run 38751487389](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38751487389) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.

### Editable learning preferences — 2026-10-15

B05.2-A provides an adjustable local profile with version-3 backup support and bilingual Settings navigation. [Report](docs/qa/2026-10-15-learning-preferences/REPORT.md). Final suite: 59 / 624 tests; static/content checks and independent review passed. iOS validated invalid/valid dates, keyboard dismissal, save and English reopen without changing daily counters. Personalized recommendations and timed plans remain open.

Implementation `6276835` was merged and pushed to main. [GitHub Actions run 38752944117](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38752944117) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.

### Preference-aware bounded Home review — 2026-10-15

B05.2-B1 / B05.3-A / B05.4-B1 connect the editable profile to due-first review suggestions with small fresh-card limits, sparse-workload estimates and exact bounded queue persistence. [Report](docs/qa/2026-10-15-bounded-home-review/REPORT.md). Final suite: 60 / 646 tests and static/content checks. Review's resumed-limit regression was reproduced and fixed. iOS verified eight-card Business handoff, one grade, exact seven-card restart/resume, and retained limits after an explicit region change. Applied activity, calibration, trip-aware planning and wider platform/device gates remain open.

### Learner pilot preparation — 2026-10-15

B13.1-A / B13.2-A deliver a [draft protocol](docs/pilot/PROTOCOL.md), [editorial task specifications](docs/pilot/TASK_BANK.md) and empty observation CSV. Measures separate independent/assisted performance, modalities, usability, delayed checks and transfer, with explicit denominators/missingness and no fabricated outcomes. Product acceptance, reviewed exact language/audio, candidate readiness and actual participant work remain open. This preparation does not establish learning efficacy or initiate recruitment/data collection.

Implementation `0c32322` was merged and pushed to main. [GitHub Actions run 38754924531](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38754924531) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.

Pilot preparation `e914e89` was merged and pushed to main. Document formatting and local links passed; observation CSV has 22 unique columns and zero participant records. No functional code or data-collection behavior changed.

### Renewed backup alerts and file preview — 2026-10-15

B11.2-C passed on the unlocked fresh iOS QA simulator: clipboard success/import-cancel alerts, local Files save, version-3 preview and cancellation, including current learning profile and bounded queue limits. [Report](docs/qa/2026-10-15-backup-alerts/REPORT.md). Export/source matched at 372,299 bytes; all seven local sections remained exactly unchanged after cancellation and no journal remained. QA-only documentation; interruption/hardware and remaining AI implementation tasks stay open.

### First offline draft mission/player — 2026-10-15

B03.1-B / B04.3-B1 / B07.1-A / B07.2 / B07.3-A / B07.5-A add a versioned authored engine and recoverable bilingual text-first café mission behind the development gate. [Report](docs/qa/2026-10-15-offline-mission/REPORT.md). The [exact editorial packet](docs/editorial/first-morning-mission-draft.json) remains unreviewed. Separate recall/recognition events preserve model-answer assistance; mission attempts do not grade flashcards or increment their daily goal. Optional mission backup state accepts older seven-field app-state files. Fresh review findings were pinned with failing tests and fixed: partial input/timing survives hints, and settled checkpoint failure permits exit. Simulator evidence covers accent feedback, cold restart, retry, hints, incorrect-choice repair, cloze, assisted completion and Spanish reopen. Authentic listening, human acceptance, follow-up practice, wider accessibility/platform and signed candidate checks remain open.

Final local verification for this package: 64 suites / 676 tests passed, plus types, lint, formatting, data validation, editorial ledger validation and unchanged generated library inventory. The two review regressions passed after fixes.

Implementation `dc50ec6` was merged and pushed to main. [GitHub Actions run 38805168069](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38805168069) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles. These are not native compilation or release-candidate acceptance.

### Optional mission follow-up practice — 2026-10-15

B07.5-B1 adds a bilingual recall-and-reveal self-check for difficult phrases, without assessment events or SRS/daily changes. [Report](docs/qa/2026-10-15-mission-follow-up/REPORT.md). Local verification passed 64 suites / 677 tests plus static/content checks. A fresh review found no actionable issues. iOS confirmed cue/reveal/example/next/return/reopen; four stored sections matched exactly. The mission remains a gated editorial draft and accepted-content daily planning remains open.

### Exact first-morning recording handoff — 2026-10-15

B03.5-B1 adds the [draft line sheet and speaker/editor brief](docs/editorial/FIRST_MORNING_RECORDING_BRIEF.md), tied to the exact mission fingerprint and source IDs. It covers alternate takes, continuous exchange order, file/manifest delivery, human acceptance and subsequent AI integration. No performer was contacted, no audio commissioned/generated and no approval fabricated. Human editorial/performance/rights and hardware/learner gates remain open.

Implementation `45b3341` (optional mission follow-up) was merged/pushed. [GitHub Actions run 38805709928](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38805709928) passed quality/content checks and iOS/Android project generation and production JavaScript bundles. Recording brief `4eee146` was merged/pushed after formatting, local-link, exact fingerprint/variant and seven-unique-line-ID checks; it is documentation only.

### Saved playback speed and pronunciation preview — 2026-10-15

B06.1-A adds saved speed support, explicit preview looping/Stop, generated-versus-device backend labels and protected asynchronous preference/seek playback. [Report](docs/qa/2026-10-15-audio-preferences/REPORT.md). Final local checks: 65 suites / 688 tests, static/content checks and unchanged generated inventory. Fresh review found no actionable issues. iOS verified Spanish save, generated preview/Stop and English reopen at 0.75× without learning-counter/event changes. Integrated listening/transcript controls, auto-speech, human audio and physical audio-route/intelligibility gates remain open.

Implementation `4e1eb54` (audio preferences) was merged/pushed. [GitHub Actions run 38806930672](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38806930672) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.

### Navigation/flashcard accessibility and reduced motion — 2026-10-15

B08.2-A / B08.4-A add readable named/selected tabs, inactive-face exclusion, explicit audio controls and system reduced-motion handling. [Report](docs/qa/2026-10-15-motion-accessibility/REPORT.md). Final local verification: 66 suites / 700 tests and static/content checks. Review identified mutable native swipe state being reset before animation completion; a failing right-swipe regression proved the wrong grade and the fix captures the grade synchronously. iOS verified active-face AX changes and OS Reduce Motion On/Off interaction. Real screen-reader/hardware, native swipe, wider layouts and full theme work remain open.

Implementation `2da944e` (navigation/card accessibility and Reduce Motion) was merged/pushed. [GitHub Actions run 38808238773](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38808238773) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.

### Initial dedicated tablet simulation — 2026-10-15

B12.4-A / B08.5-A add [iPad Pro 13-inch smoke evidence](docs/qa/2026-10-15-tablet-smoke/REPORT.md): fresh Spanish onboarding, Study flip, mission keyboard and correct feedback, landscape, exact feedback after process restart and English audio preview/Stop/save. The saved mission has one observation and revision 2; no duplicate or flashcard grade was introduced. Device Hub AX loss after rotation/restart was worked around using current screenshots. Smaller tablets/windowing, large text/themes, wide-layout polish, real accessibility, audio hardware and signed-candidate validation remain open. QA-only documentation; functional baseline remains 66 suites / 700 tests.

### Generated listening draft and evidence — 2026-10-16

B06.1-B1 / B06.2 add a development-only three-phrase listening player with hidden transcripts, durable playback requirements, replay/loop/Stop, saved/explicit speeds and separate transcript/model assistance. [Report](docs/qa/2026-10-16-listening-practice/REPORT.md). Final local suite: 69 / 716 tests plus static/content checks and unchanged review inventory. Fresh review found no actionable issues. Dedicated iPhone simulation verified all three clips, transcript reveal, exact feedback after cold restart, next-item resets and assisted completion; storage confirms exactly three listening events and no flashcard grading. Auto-speech, accepted human audio, physical intelligibility/routes, Android runtime and signed-candidate checks remain open.

Implementation `fdd28f1` (generated listening draft) was merged/pushed. [GitHub Actions run 38853611768](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38853611768) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.

### Opt-in reveal-triggered pronunciation — 2026-10-16

B06.1-B2 closes the current generated player/audio preference work with explicit opt-in speech after flashcard answer reveal and reachable Stop. [Report](docs/qa/2026-10-16-opt-in-speech/REPORT.md). Final verification: 70 suites / 725 tests plus static/content checks. Review found two animation cancellation races; both were reproduced and fixed before the final suite. iPhone verified switch/save, revealed-card/Stop/grading layout, cold-restart persistence and restoring Off. Human audio, physical route/intelligibility, platform expansion and the remaining roadmap AI packages stay open.

Implementation `57c8bc8` (opt-in card speech) was merged/pushed. [GitHub Actions run 38854193384](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38854193384) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles.

### Current market positioning and truthful release preparation — 2026-10-16

B14.1 refreshes [competition](COMPETITIVE_ANALYSIS.md), README and conditional store copy using official evidence, current code and accepted-release boundaries. [Report](docs/qa/2026-10-16-market-positioning/REPORT.md). Removed unsupported exclusivity, accent/efficacy, pricing, rating/privacy and stale count assumptions. Added current mission/listening privacy disclosures. Fresh document review found one broken official documentation link, corrected before merge. Content preflight still correctly blocks all unaccepted cards. B01.5-A also records installed Android Studio/bundled Java versus missing SDK/emulator; SDK license authorization and actual Android testing remain open. No publication or agreement acceptance occurred.

### Coordinated Navigation 7 and explicit return behavior — 2026-10-16

B01.8-C1 removes the Navigation 6 decoder chain and adopts explicit nested/pop return semantics. [Report](docs/qa/2026-10-16-navigation-seven/REPORT.md). Final suite: 71 / 726 tests with static/content checks and unchanged inventory; fresh review found no actionable findings. iPhone verified cold start, Quiz-to-Study, exact eight-card resume, Stop/tab focus, manager-to-Home and retained listening completion. Tablet verified Quiz-to-Study, Home and exact saved mission feedback. Audit now reports 62 total / 39 omit-dev findings, zero critical; remaining SDK/test-tooling and native/hardware gates stay open.

Implementation `0c4b312` (Navigation 7) was merged/pushed. [GitHub Actions run 38855643836](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38855643836) passed quality/content checks and independent iOS/Android project generation and production JavaScript bundles. Native signing and physical acceptance remain separate.

### Speaking options and evaluation preparation — 2026-10-16

B09.1-A / B09.3-A deliver an [official-source shortlist and draft feedback/evaluation contract](docs/speaking/OPTIONS_AND_EVALUATION.md), separating strict local recognition, hosted transcription and independently validated task/intelligibility feedback. Provider/budget, accepted prompts/recordings/ratings and actual device/latency/cost evaluation remain open. No provider configured, audio uploaded or score invented. Document review found no actionable findings; formatting and local links passed.

### Local voice self-check preview — October 16, 2026

B09.2-A adds a development-only, local one-take practice screen without assessment or learning credit. Whole-package review found retry-after-failed-Stop and native auto-timeout duration-reset defects; regression tests reproduced and fixed both. Final verification: 75 suites / 754 tests, types/lint/format/data/editorial-ledger checks pass. All 1,392 cards still await qualified current acceptance. iPhone simulator permission denial, text alternative and clean return verified; capture, physical routes and signed-client validation remain explicit work.

### Progress evidence — October 16, 2026

B08.4-B1 separates checked recognition/recall/listening/speaking attempts from self-ratings and exposes assisted/unknown counts without inferring lifetime mastery or speaking assessment. Existing quiz-only evidence remains distinct. Fresh review found no actionable issues; 76 suites / 757 tests and types/lint passed, native iPhone Quiz/Study actions verified. Voice preview `acd2baf` CI38857476897 passed all quality/content and project-generation/bundle jobs.

Progress batch `d6361f3` merged/pushed to main; [CI38886271710](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38886271710) passed all quality/content and iOS/Android project-generation/JS-bundle jobs.

### PostCSS remediation — October 16, 2026

B01.8-C2a removes the PostCSS advisory through an exact-parent same-major patch override, with actual disclosure RED→GREEN and normal map/transform compatibility tests. Final checks: 77 suites / 760 tests, types/lint/format/content and both platform production JS exports passed. Full audit remains 61 findings; supported Expo/RN/Jest migrations and remaining upstream advisory paths are not closed.

### Calendar integration matrix — October 16, 2026

B02.6-B1 delivers 16 storage checks across four isolated timezone processes, now in CI. Full suite 78 suites / 764 tests, types/lint/format/content checks passed; independent review confirmed fixtures and runner. PostCSS batch `71b048e` merged/pushed; [CI38886863213](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38886863213) passed quality/content and both platform project-generation/JS-bundle jobs.

Calendar matrix `fde0735` merged/pushed to main; [CI38887199615](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38887199615) passed quality/content,16-zone cases and both project-generation/JS-bundle jobs.

### Native build metadata — October 16, 2026

B12.1-M replaces the placeholder build with native API values and distinguishes Expo Go host identity. Three regressions observed RED→GREEN; all 79 suites / 769 tests, types/lint/format/content checks pass. Native iOS Spanish/English labels match the compiled binary. Fresh review found no actionable issues. SDK55 `5a1693a` [CI38889781746](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38889781746) passed every quality/content and iOS/Android project-generation/JS-bundle job.

Native metadata package `caaf612` [CI38890240877](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38890240877) passed all quality/content and iOS/Android project-generation/JS-bundle jobs.

### Expo SDK57 native migration batch

B01.8-C2c validates the SDK56 checkpoint and SDK57 final build, with 79 suites/771 tests and both platform production exports. A fresh review found no actionable issues; simulator testing separately exposed a mission action-key warning, fixed with observed RED→GREEN coverage. iOS26 retained the exact nine-card Business queue, daily1/5 and one event through upgrade and Files restore. A fresh iOS27 app completed onboarding, one grade, restart and exact nine-card resume. Recording Stop/replay/delete,30-second limit and Back cleanup left zero recordings; microphone revoked afterward. Android native/signed/physical/editorial gates and remaining dependency findings are still open. [Evidence](docs/qa/2026-10-16-sdk57/REPORT.md).

SDK57 integration follow-up: first CI install rejected an incomplete peer lock created under this Mac's inherited global `legacy-peer-deps=true`. Project configuration now enforces normal peer resolution; Worklets' required Metro config is explicit, and complete audit snapshots supersede the earlier partial counts. Global npm preferences were not changed. Correction `ef5833d` merged/pushed; [CI38955215294](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38955215294) passed all four jobs. Strict clean installs and771 tests passed both in the worktree and merged main; native iOS27 also cold-launched against the complete graph.

B02.4-B2e closes demonstrated external-deck identity/limits and late-grade/checkpoint ownership failures. Six new regressions pass; iOS27 confirms nine Business cards with fresh identity and exact cold resume, preserving counters/events/library totals. Implementation `73b9407` merged/pushed; merged suite 79/777 and [CI38961900481](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38961900481) passed all four jobs. [Evidence](docs/qa/2026-10-16-study-boundaries/REPORT.md). Deterministic pending-grade timing was tested through controlled tests; native fault injection, broader relearning, Android and physical-device gates remain open.

B02.6-C corrects same-day due-count drift in mounted Home/Progress screens using the existing minute timer, with background suspension and foreground catch-up. Four added cases; full/merged 80 suites / 781 tests and calendar 16 pass. iOS27 verifies grade/navigation/foreground/idle integrity and an unchanged eight-card resume checkpoint. Implementation `a4a05d4` merged/pushed and [CI39001364728](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39001364728) passed all four jobs. [QA](docs/qa/2026-10-17-focused-due-refresh/REPORT.md). Minor deferred: explicit native startup AppState fixtures. Live timezone, broader fresh/empty/returning/upgrade, Android native, signed and hardware acceptance remain open.

B08.2-B1 / B02.6-C1: translated large-text tabs now wrap into two rows, and native text measurements reset on live font-scale changes without remounting screens. iOS27 Spanish/English maximum/default/live navigation and unchanged eight-card queue/counters/events verified; four startup AppState fixtures close the previous coverage minor. Full/merged80 suites /785 tests, calendar 16 and [CI39008778017](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39008778017) all four jobs pass. Implementation `67a0151` merged/pushed. [QA](docs/qa/2026-10-17-accessible-tabs/REPORT.md). B08.2-B2 tracks observed Home/Settings/Study content defects; smaller/landscape/tablet/Android/signed/physical, screen-reader focus and full reduced-viewport activity acceptance remain open.

B08.2-B2 corrects live text remeasurement in Home/Settings/Study landing, separates the large due count/unit and expands category labels into full-width tiles. Implementation `879173c` merged/pushed; full and merged80 suites/787 tests, static/content checks, calendar 16 and [CI39022477969](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39022477969) all four jobs passed. [QA](docs/qa/2026-10-17-large-text-content/REPORT.md) records representative bilingual default/large/maximum screenshots, retained search/backup preview, normal backup restore and exact recovered QA session/counters. Scroll positions reset on font changes. Every activity/row, session/region/resume maximum layouts, narrow/landscape/tablet/Android runtime, signed/physical and screen-reader acceptance remain open.

B05.2-B2 completes the preference-aware recommendation contract together with B05.2-A/B1: the existing editor includes purpose, region, level, available time and optional trip date; Home and Study now agree about eligible fresh cards. Final local verification passed 81 suites / 811 tests, types/lint/calendar/content checks, and independent review. iOS verified a three-minute general-content fallback, explicit All override, and exact cold resume without grades; the original QA fixture was restored and compared. Applied activities/calibration (B05.3-B), wider catch-up (B05.4-B), and timezone/platform acceptance (B05.5-B) remain open. Trip urgency is not implemented by this change. [Report](docs/qa/2026-10-17-regional-daily-queue/REPORT.md).

B05.2 regional queue implementation `e985aa9` is merged/pushed. The merged main tree passed 81 suites / 811 tests. [CI39029832429](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39029832429) passed all four quality/native-project/JS-bundle/summary jobs; the checklist board deployment also passed. Broader AI implementation and genuine human/account/device gates remain open.

B05.3-B1 supplies measured review pacing without new storage keys or invented legacy timings. 83 suites / 824 tests passed with static/content/calendar checks. Fresh independent review identified Android interaction blur; a regression and persistent blur/focus tracking fixed it. Actual iOS testing then exposed unsupported Android-only subscriptions, corrected with a failing/passing iOS regression. A fresh dedicated iOS27 fixture produced five grades across two sessions, excluded background time, displayed calibrated English/Spanish estimates, and retained the exact three-card queue/limits after restart. Applied phase and whole-plan timing/progression remain open under B05.3-B2. [Report](docs/qa/2026-10-17-review-duration/REPORT.md).

B05.3-B1: Implementation `b5c0217` was merged and pushed to main after the merged tree passed 83 suites / 824 tests. [GitHub Actions 39031013262](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39031013262) passed all four quality/content, iOS/Android project-generation and production-JS-bundle, and summary jobs. [Checklist board deployment 39031013246](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39031013246) passed. Native Android runtime, signed builds and physical-device acceptance remain separate. B05.3-B2 and the overall roadmap remain open.

B05.3-B2a: Implementation `4ad3116` was fast-forward merged and pushed to main after the merged tree passed 84 suites / 842 tests. [GitHub Actions 39031868821](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39031868821) passed all four quality/content, iOS/Android project-generation and production-JS-bundle, and summary jobs. [Checklist board deployment 39031868713](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39031868713) passed. This contract package does not establish whole-plan native UI or Android runtime/hardware acceptance. B05.3-B2b and the overall AI roadmap remain open.

B05.3-B2b1: Implementation `aea71a9` was fast-forward merged and pushed to main after the merged tree passed 87 suites / 862 tests. The available iOS27 simulator verified 3/5/10-minute flow, exact cold resume through a preference change, explicit end without progress loss, and Spanish review → written reply → cold feedback resume → completion without SRS/daily inflation. [QA](docs/qa/2026-10-17-daily-plan-flow/REPORT.md). [GitHub Actions 39034006822](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39034006822) passed all four quality/content, iOS/Android project-generation and production-JS-bundle, and summary jobs. [Checklist board deployment 39034006820](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39034006820) passed. B05.3-B2b2 active applied timing calibration and broader platform/layout acceptance remain open; draft language remains gated. These checks do not establish native Android runtime or signed/physical-device acceptance. The overall AI roadmap remains open.

B05.3-B2b2-A: Implementation `9f87d46` plus native evidence `0cd546a` were merged and pushed to main after 89 suites / 872 tests passed on the merged tree. Actual iOS foreground/background and cold-feedback completion retained one 45,228ms completed-response sample with unchanged daily/SRS state. The five-run threshold, version-specific median and Home/factory allowance agreement have automated coverage; this is not five native learner trials. [QA](docs/qa/2026-10-17-applied-active-timing/REPORT.md). [GitHub Actions 39035133880](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39035133880) passed all four jobs, including both platform generation/production JS exports. [Board deployment 39035133892](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39035133892) passed. B05.3-B2b2-B broader layout/lifecycle/platform acceptance and the parent/overall roadmap remain open. Physical devices, signed notifications and human editorial acceptance remain separate.

### Editorial save recovery — 2026-10-17

B02.4-B2h closes slow/failed editor saves, exact-intent retry and pending navigation/control conflicts. Native fault injection reproduced and verified recovery on iOS26; large-text feedback/reflow was also corrected. Full 93/906, types/lint/data/calendar and fresh independent review passed. [Evidence](docs/qa/2026-10-17-editor-save-recovery/REPORT.md). Normal Metro entry was restored and cold Study resume preserved Hola3/seven remaining, with no grading side effects. Remaining AI and human/device rows stay open.
