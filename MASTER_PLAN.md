# Colombian Spanish — Master Plan and Checklist

> **For agentic workers:** Execute one bounded work package at a time. Use the applicable execution workflow; do not start parallel agents without user authorization. This is the authoritative roadmap, not authorization to publish, purchase services, or contact people.

**Goal:** Help learners understand and handle everyday life in Colombia through accurate regional content, enjoyable missions, listening, speaking, and efficient personalized review.

**Architecture:** Build on the existing Expo / React Native app and its offline local storage. Connect existing study tools through a shared learning-event model and guided missions. Add network services only for capabilities that need them, with offline alternatives and explicit data handling.

**Tech stack:** Expo SDK 54, React Native, TypeScript, React Navigation, AsyncStorage, expo-audio, expo-speech, expo-notifications, Jest, React Native Testing Library, GitHub Actions, EAS.

**Brief:** Product assessment and user request in this chat on October 14, 2026. Major new subsystems get a focused design and implementation plan when selected; do not predesign the entire roadmap or invent future interfaces now.

**Last updated:** 2026-10-15. **Status:** Foundation, learning correctness, dependency maintenance, and iOS smoke batches merged and pushed; implementation CI passed. Remaining implementation and human/device gates are tracked below.

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
- [x] **B01.6 [AI]** Document repeatable commands, fixture reset, screenshots, and build artifacts. Preserve user data and unrelated simulator sessions.

- [x] **B01.7 [AI]** Record the dependency audit and apply compatible locked dependency updates without a forced major upgrade. See the dated foundation report for before/after counts.
- [ ] **B01.8 [AI]** Triage remaining dependency advisory paths and implement a separately verified SDK/navigation upgrade where required; the current audit still has high/moderate findings.
  - [x] **B01.8-A [AI]** Trace remaining advisory roots and consumer/input paths; document compatible fixes, no-patch paths, and separately testable migration packages. See the dependency-triage report.
  - [x] **B01.8-B [AI]** Apply the compatible brace-expansion 5.0.12 lockfile patch without changing product dependency ranges; audit now reports 66 total / 43 production-tree findings, zero critical.
  - [ ] **B01.8-C [AI, SIM]** Complete supported Navigation/Expo/test-tooling migrations or upstream backports, re-audit, and verify native flows. No-patch findings remain tracked rather than assumed resolved.
- [ ] **B01.9 [AI, H-PRODUCT, H-ACCOUNT]** Decide whether to restore or retire the historical Kanban Pages deployment. Its existing workflow fails because repository Pages is not configured; enabling publication requires an explicit product/account decision.

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
- [ ] **B02.4 [AI]** Audit session queue stability, grading during rapid interactions, daily new-card caps, relearning, resume, and cross-deck behavior. Pin actual failures with regression tests.
  - [x] **B02.4-A [AI, SIM]** Reproduce and fix card skipping when eligible queues shrink, guard overlapping grade submissions, and save the next resume card; verify controlled regressions and iOS simulator behavior.
  - [x] **B02.4-B1 [AI]** Commit grade schedule/counters/seen-word/streak/event/next pointer through a durable journal; deduplicate retained attempts, enforce concurrent new-card caps, preserve provider state on pre-commit failure, guard unresolved Study boundaries, and freeze Difficult practice membership with save retry.
  - [x] **B02.4-B2a [AI, SIM]** Serialize fresh deck reads, editor/management mutations and seed merging with grades/restores through the durable coordinator; pin concurrent lost updates, validate before writes, preserve malformed data and offer startup retry.
  - [ ] **B02.4-B2 [AI, SIM]** Complete exact full-queue resume, broad relearning/cross-deck and external-navigation audits, unrelated editor mutation races, OS interruption and simulator/device acceptance.
- [x] **B02.5 [AI]** Replace the three-repetitions “mastered” claim with an explicitly defined, evidence-based progress model. Keep estimated and measured abilities visibly distinct.
- [ ] **B02.6 [AI, SIM]** Refresh Home/Progress after study and app resume; verify empty library, fresh install, returning learner, midnight, timezone changes, and upgrade fixtures.
  - [x] **B02.6-A [AI]** Add/test focus, foreground, and local-date refresh with cancellation, stale-response protection, and a Home integration regression.
  - [ ] **B02.6-B [AI, SIM]** Complete timezone/DST, fresh/empty/returning-user and upgrade coverage, then capture native simulator evidence.

**Batch evidence:** [Second correctness report](docs/qa/2026-10-14-learning-correctness/REPORT.md). Learning history stores at most 5,000 observations and deduplicates retained IDs. Conjugation editorial acceptance and full study transaction/session audits remain open.

**Exit:** known conjugation defects are corrected; data survives migration; practice modes no longer inflate one shared mastery claim; queue/progress behavior is tested.

## B03 — Content trust and editorial production

**Package:** machine validation and review workflow first; human review batches follow independently. **Main files:** `src/data/decks/`, `src/utils/register.ts`, `src/utils/regions.ts`, review screens, audio manifest/generation script, new editorial artifacts.

- [ ] **B03.1 [AI]** Export a review inventory with stable IDs, text, examples, translations, tags, register, regional claims, audio provenance, and review status. Prioritize the first mission and the 20 `needs_native` cards.
  - [x] **B03.1-A [AI]** Export the complete deterministic 1,392-card inventory; prioritize explicit native-review requests and vulgar/flirty material, with source/audio provenance.
  - [ ] **B03.1-B [AI]** Prioritize the exact first-mission card set when its script is selected; this inventory does not invent a selected pilot script.
- [x] **B03.2 [AI]** Add explicit regional metadata supporting shared/multiple regions rather than relying solely on inferred deck/tag matches; retain compatible filtering and migrations.
- [ ] **B03.3 [AI]** Define reviewed/draft/needs-correction states, reviewer attribution, content versions, and a release filter. Automated validation checks completeness and contradictions; it does not certify authenticity.
- [ ] **B03.4 [H-LANGUAGE, AI]** Review the first mission, grammar fixtures, common phrases, slang/register, and regional claims; AI applies reviewed corrections and adds regression fixtures.
- [ ] **B03.5 [AI, H-LANGUAGE]** Prepare recording scripts and speaker briefs; recruit/record through human-led arrangements, obtain appropriate rights/consent, and review pronunciation. Maintain generated versus human audio provenance.
  - [x] **B03.5-A [AI]** Prepare the recording/review handoff brief and provenance guidance in `docs/editorial/README.md`.
  - [ ] **B03.5-B [AI, H-LANGUAGE]** Select exact pilot scripts, obtain human performance/rights and editorial acceptance, then integrate accepted recordings.
- [ ] **B03.6 [AI, H-LANGUAGE]** Review the remaining library in batches, prioritizing usage and risk. Quarantine unresolved teaching content from the release rather than marking it approved.

**Exit:** released teaching content has traceable editorial status; pilot content and audio are accepted; unresolved content is excluded or explicitly gated. Do not block unrelated UI coding while waiting for recordings.

## B04 — Quizzes and contextual grammar

**Package:** assessment improvements + short contextual explanations. **Main files:** `src/screens/QuizScreen.tsx`, conjugation components/data, learning-event integration, new exercise utilities, tests.

- [ ] **B04.1 [AI, H-LANGUAGE]** Generate plausible distractors with unique answer text and one unambiguous best answer; validate synonyms, alternate regional forms, and grammatical categories.
  - [x] **B04.1-A [AI]** Exclude/deduplicate normalized correct/distractor meaning text and prevent scoring a quiz with only one distinct meaning.
  - [ ] **B04.1-B [AI, H-LANGUAGE]** Improve semantic plausibility and validate synonyms/regional/grammatical alternatives; literal deduplication is not editorial acceptance.
- [x] **B04.2 [AI, SIM]** Offer a small first-session practice experience before ten words have been seen; handle sparse regional pools without duplicate or impossible questions.
- [ ] **B04.3 [AI]** Add unaided production/reverse-recall and cloze exercises, with explicit accepted variants and informative corrections. Keep modality-specific results.
- [ ] **B04.4 [AI, H-LANGUAGE]** Add short reviewed grammar explanations attached to useful phrases; cover requests, questions, pronouns, and past events in the pilot's scope.
- [ ] **B04.5 [AI, SIM]** Verify correct/incorrect/hinted responses, accents, punctuation, empty pools, repeated attempts, and learning-event integrity.
  - [x] **B04.5-A [AI, SIM]** Verify short unhinted correct/incorrect and repeat rounds, actual scores, zero/sparse pools, recognition-only events, unchanged flashcard goal, reachable completion controls, and next-question scroll reset.
  - [ ] **B04.5-B [AI, SIM]** Complete hinted/accepted-variant, accent/punctuation, expanded accessibility/layout, and platform coverage as those exercise capabilities are added.

**Exit:** first-time learners can practice; questions test meaningful distinctions; each exercise records the appropriate evidence.

## B05 — Daily guidance and efficient workload

**Package:** onboarding continuity + daily planner + calmer Home. **Main files:** onboarding/home/study screens, `src/storage/prefs.ts`, queue utilities, translations, tests.

- [ ] **B05.1 [AI, H-PRODUCT]** Prepare a concrete starting audience and journey: default proposal is an adult with beginner/basic Spanish preparing for everyday life in Colombia. Make level self-report adjustable; validate the proposal in the pilot.
- [ ] **B05.2 [AI]** Use purpose and region throughout recommendations, with editable preferences and a general-content fallback. Include optional trip date and available study time.
- [ ] **B05.3 [AI]** Build 3/5/10-minute plan options combining due review, a small amount of new material, and one applied activity. Use initial duration estimates, then calibrate with measured session times.
- [ ] **B05.4 [AI, SIM]** Separate reviews due, new cards available, and today's bounded plan; provide catch-up after absence without resetting progress or flooding the learner.
  - [x] **B05.4-A [AI, SIM]** Separate studied reviews due now, fresh library cards, and remaining daily new-card allowance; verify English/Spanish Home and count changes after study.
  - [ ] **B05.4-B [AI, SIM]** Add bounded timed plans and absence catch-up behavior; parent remains open.
- [ ] **B05.5 [AI, SIM]** Make the main Home action start/resume the recommended activity directly; verify preference changes, timezone changes, and no-content states.
  - [x] **B05.5-A [AI, SIM]** Start the selected due/new deck directly after refreshing the provider budget; cover foreground preference/day changes, empty library, exhausted cap, and read-failure retry in automated tests. Verify direct start on iOS.
  - [ ] **B05.5-B [AI, SIM]** Complete purpose/region/time-aware recommendations, broader resume/timezone scenarios, and platform coverage.

**Exit:** one clear next action consistently reflects the learner's preferences and time budget; the whole library is not presented as overdue work.

## B06 — Authentic listening and regional audio

**Split:** B06-A player/exercises with fixtures; B06-B reviewed audio integration and device checks. **Main files:** `src/services/tts.ts`, audio components/manifest, prefs, new listening screens/content, tests.

- [ ] **B06.1 [AI]** Implement replay, phrase looping, transcript reveal, supported speed controls, and explicit generated/human speaker provenance; honor saved audio preferences.
- [ ] **B06.2 [AI]** Support listening without initially showing the Spanish text; record comprehension separately from transcript-assisted answers.
- [ ] **B06.3 [AI, H-LANGUAGE]** Integrate accepted phrase and dialogue recordings with speaker/region metadata; support multiple speakers without claiming one voice represents a whole region.
- [ ] **B06.4 [AI, SIM]** Add downloadable audio packs with size/status, cancellation, integrity checks, storage recovery, and offline playback. Do not depend on device TTS for promised offline audio coverage.
- [ ] **B06.5 [AI, DEVICE]** Verify speaker/headphone/Bluetooth playback, mute/volume behavior, speed/intelligibility, interruptions, app background/foreground, and offline restart on actual supported phones.

**Exit:** one reviewed listening set works offline, records honest evidence, and has both automated/player checks and real-device audio results.

## B07 — First complete mission and reusable mission engine

**Split:** B07-A content schema/player; B07-B first mission integration. **Main files:** navigation, types, new mission content/player/state modules, daily-plan integration, learning-event storage, tests.

- [ ] **B07.1 [AI, H-PRODUCT]** Define the first mission: “Your first morning in Medellín,” including its outcome, required phrases, completion criteria, and assisted alternatives. Resolve its focused design before coding the new subsystem.
- [ ] **B07.2 [AI]** Create a versioned mission format for scenes, dialogue, choices, exercises, outcomes, prerequisites, and media references; validate IDs/assets and reject broken branches.
- [ ] **B07.3 [AI, SIM]** Build an accessible player with deterministic branching, hints, retry, save/resume, completion, and offline support. Start with authored branches.
- [ ] **B07.4 [AI, H-LANGUAGE]** Assemble reviewed content: hear an exchange, understand it, choose or produce a reply, handle an unavailable item, and complete the practical outcome.
- [ ] **B07.5 [AI]** Feed difficulties back into personalized practice without duplicating events, unfairly penalizing hint use, or changing unrelated card scheduling.
- [ ] **B07.6 [AI, SIM, H-LEARNER]** Verify all branches and interrupted sessions, then run the B13 learner pilot. Speaking can be an optional later enhancement; do not block the first pilot on B09.

**Exit:** one complete mission links comprehension, response, feedback, and subsequent review; scripted technical checks and actual learner findings are recorded separately.

## B08 — Visual identity, navigation, and accessibility

**Split:** B08-A tokens/components; B08-B Home/navigation; B08-C activity/progress screens. **Main files:** `src/styles/theme.ts`, navigation, shared components, screens, translations, assets.

- [ ] **B08.1 [AI, H-PRODUCT]** Prepare concrete visual directions using a real mission and existing screens; choose a coherent direction with Colombian settings/people and appropriate asset rights.
- [ ] **B08.2 [AI]** Define light/dark semantic tokens, typography, spacing, consistent icons, focus/pressed/disabled states, and accessible reusable controls. Replace tiny navigation labels and excessive competing accents.
- [ ] **B08.3 [AI, SIM]** Implement mission-led Home and clear access to practice, explore, saved content, and profile/settings; preserve existing features and navigation entry points.
- [ ] **B08.4 [AI, SIM]** Give flashcards, listening, missions, and speaking distinct useful layouts. Present actual learned abilities and next actions in Progress.
- [ ] **B08.5 [AI, SIM]** Capture representative iPhone/Android and supported tablet layouts in both languages/themes, including large text, long content, reduced motion, and narrow screens.
- [ ] **B08.6 [AI, DEVICE, H-LEARNER]** Verify real screen-reader navigation, tap comfort, daylight readability, and accessibility preferences; obtain feedback from people who use relevant assistive features where possible.

**Exit:** consistent implemented screens have screenshot evidence and accessible flows; visual attractiveness and practical usability have human feedback.

## B09 — Speaking feedback and voice-note missions

**Split:** B09-A record/replay; B09-B evaluated feedback service; B09-C optional conversational extension. **Main files:** new recording/speaking modules, permissions/config, mission integration; server-side service if selected.

- [ ] **B09.1 [AI, H-PRODUCT, H-ACCOUNT]** Compare device-local and hosted recognition/feedback against latency, cost, regional handling, retention, and privacy requirements. Use fixtures until a provider/budget is selected.
- [ ] **B09.2 [AI, SIM]** Implement permission request/denial/recovery, record/replay/delete, recording indicators, interruption handling, and a non-speaking alternative.
- [ ] **B09.3 [AI, H-LANGUAGE]** Define feedback for task completion, intelligibility, and phrasing. Do not equate transcription accuracy with phonetic pronunciation scoring; validate any scores against editor-rated recordings.
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

- [ ] **B11.1 [AI, SIM]** Make backup export/import usable as a file with clear dates/content, validation, safe merge/replace, preview, and recovery. Preserve custom cards, edits, favorites, event history, and preferences.
  - [x] **B11.1-A [AI]** Include versioned recognition history in clipboard backups; retain legacy import support, validate incoming events, and merge without deleting newer observations. Full file-based/atomic recovery work remains open.
  - [x] **B11.1-A2 [AI, SIM]** Add dated JSON file export/import, size and schema validation, in-app counts/date/limitations preview, guarded additive merge or deck replacement, safe share-file lifetime, and iOS Expo Go save/import/cancel acceptance. Preferences, streak, seen-word and full-state migration remain open.
- [ ] **B11.2 [AI]** Test corrupt/oversized/old backups, partial writes, duplicate IDs, migration failure, and interrupted restore; never silently wipe existing progress.
  - [x] **B11.2-A [AI]** Validate clipboard backup deck/card structure, scheduling and optional fields, unique deck/card IDs, supported versions/history, and input size before confirmation or writes; preserve valid legacy content and handle clipboard-read errors.
  - [x] **B11.2-B1 [AI]** Add serialized durable restore journaling, replay before app storage access, startup recovery/retry, conflict validation before writes, and failure-injection tests for interrupted deck/history restore.
  - [ ] **B11.2-B2 [AI, SIM]** Complete file-based/full-state backup migrations and simulator interrupted-restore acceptance. Hardware/file-share validation stays separate.
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
- [ ] **B12.2 [AI, DEVICE]** Test a physical iPhone on each promised support boundary; cover an older/lower-performance supported device and a current device where feasible. Record gaps explicitly.
- [ ] **B12.3 [AI, DEVICE]** Test physical Android hardware if Android ships, including a lower-performance supported device and relevant vendor battery restrictions. Emulator results are supplementary.
- [ ] **B12.4 [AI, SIM, DEVICE]** Test tablets if advertised/supported by the release; app configuration currently enables iPad support. Either validate the supported layout or deliberately narrow support.
- [ ] **B12.5 [AI, DEVICE]** Verify audio/microphone routes, interruptions, permissions changed in OS settings, actual scheduled reminders, notification taps, and app background/termination behavior. Audit reminder settings against implemented behavior, including the rolling word-of-day window.
- [ ] **B12.6 [AI, DEVICE]** Verify airplane-mode cold launch, downloaded content, poor network, low storage, file sharing, reinstall with backup, and upgrade without progress loss.
- [ ] **B12.7 [AI, DEVICE]** Measure startup, scrolling, memory, battery/thermal behavior, and storage on hardware; set budgets from the baseline and pilot needs, then track regressions.
- [ ] **B12.8 [AI, SIM, DEVICE]** Run end-to-end regression against the actual signed release candidate, not only Expo Go or a development build. Record accessibility checks and crash results.

**Exit:** all shipped-platform critical cases pass on the named candidate, or a specific scope reduction removes the unsupported capability. “Simulator passed” alone cannot close physical-device rows.

## B13 — Learner pilot and effectiveness

**Package:** research protocol + first mission pilot + findings and prioritization. Human participation is necessary; AI can prepare, analyze, and implement responses.

- [ ] **B13.1 [AI, H-PRODUCT]** Define success measures before the pilot: first-session completion, time to useful outcome, hint usage, delayed unaided recall, comprehension of a new speaker, and success in a new scenario. Treat numeric targets as hypotheses until baseline data exists.
- [ ] **B13.2 [AI, H-LANGUAGE]** Prepare equivalent pre/post/transfer tasks and delayed checks (for example, the next day and one week later); avoid simply repeating the memorized quiz.
- [ ] **B13.3 [H-PRODUCT, H-LEARNER]** Recruit a small directional pilot, initially around 5–8 people spanning beginners and learners with basics; obtain consent and agree on appropriate data collection. This sample is not proof of broad efficacy.
- [ ] **B13.4 [H-LEARNER, AI]** Observe independent first use and complete delayed checks; record confusion, pronunciation feedback problems, accessibility needs, motivation, and actual task performance.
- [ ] **B13.5 [AI]** Analyze modality-specific events and qualitative findings; distinguish usability results from learning effects and retention metrics.
- [ ] **B13.6 [AI, H-PRODUCT]** Select fixes and expansion scope from evidence. Update this master plan before multiplying missions or introducing major paid AI features.

**Exit:** pilot findings identify what worked, what failed, study limitations, and the next investment decision.

## B14 — Commercial and store readiness

**Split:** B14-A positioning/assets/disclosures; B14-B payments if selected; B14-C release preparation/publication.

- [ ] **B14.1 [AI]** Refresh competitor evidence and positioning; replace stale “only app,” card/deck counts, unverified learning claims, and generated/native audio claims in docs and store copy.
- [ ] **B14.2 [AI, H-PRODUCT]** Prepare concrete free/core/paid options and cost scenarios. Consider a paid offline library and separately limited hosted AI; select pricing only after pilot feedback and cost analysis.
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
