# Colombian Spanish — Master Plan and Checklist

> **For agentic workers:** Execute one bounded work package at a time. Use the applicable execution workflow; do not start parallel agents without user authorization. This is the authoritative roadmap, not authorization to publish, purchase services, or contact people.

**Goal:** Help learners understand and handle everyday life in Colombia through accurate regional content, enjoyable missions, listening, speaking, and efficient personalized review.

**Architecture:** Build on the existing Expo / React Native app and its offline local storage. Connect existing study tools through a shared learning-event model and guided missions. Add network services only for capabilities that need them, with offline alternatives and explicit data handling.

**Tech stack:** Expo SDK 54, React Native, TypeScript, React Navigation, AsyncStorage, expo-audio, expo-speech, expo-notifications, Jest, React Native Testing Library, GitHub Actions, EAS.

**Brief:** Product assessment and user request in this chat on October 14, 2026. Major new subsystems get a focused design and implementation plan when selected; do not predesign the entire roadmap or invent future interfaces now.

**Last updated:** 2026-10-14. **Status:** Planning complete; implementation and release validation remain open.

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

- [ ] **B01.1 [AI]** Record current `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test -- --runInBand` results; separate existing failures from new failures. Check asset validity and audio-file references.
- [ ] **B01.2 [AI]** Add the Jest suite to CI; make data validation reproducible without changing the lockfile during CI.
- [ ] **B01.3 [AI]** Replace the fake successful build check with a real appropriately scoped native validation/build job; report skipped/unavailable builds honestly in PR summaries.
- [ ] **B01.4 [AI, SIM]** Establish a dedicated iOS simulator workflow and capture launch, onboarding, study, quiz, phrases, settings, and restart evidence.
- [ ] **B01.5 [AI, SIM]** Locate/install supported Android tooling if available, document the actual environment constraint if not, and establish an emulator workflow without treating iOS success as Android success.
- [ ] **B01.6 [AI]** Document repeatable commands, fixture reset, screenshots, and build artifacts. Preserve user data and unrelated simulator sessions.

**Exit:** checks have recorded results, CI no longer claims an unperformed build passed, and platform launch evidence or a specific tooling blocker is recorded.

## B02 — Learning correctness, progress, and event history

**Split into reviewable packages:** B02-A conjugations; B02-B learning events/migration; B02-C scheduler/session/progress behavior.

**Main files:** `src/data/conjugations.ts`, `src/types.ts`, `src/utils/srs.ts`, `src/context/DeckContext.tsx`, `src/storage/storage.ts`, study/quiz/progress/home screens, relevant tests.

- [ ] **B02.1 [AI, H-LANGUAGE]** Correct future-tense generation and audit the remaining tense/pronoun tables. Add independent expected-form fixtures including `hablaré`, `comeré`, irregular futures, and region-sensitive forms; have an editor validate the reference set.
- [ ] **B02.2 [AI]** Define and persist versioned learning events with card/mission ID, modality, timestamp, outcome, hints, and duration where measurable. Make event writes retry-safe and bound history growth.
- [ ] **B02.3 [AI]** Separate recognition, recall, listening, and speaking evidence; prevent an easy multiple-choice success from automatically asserting unaided recall mastery. Preserve old progress without inventing missing historical evidence.
- [ ] **B02.4 [AI]** Audit session queue stability, grading during rapid interactions, daily new-card caps, relearning, resume, and cross-deck behavior. Pin actual failures with regression tests.
- [ ] **B02.5 [AI]** Replace the three-repetitions “mastered” claim with an explicitly defined, evidence-based progress model. Keep estimated and measured abilities visibly distinct.
- [ ] **B02.6 [AI, SIM]** Refresh Home/Progress after study and app resume; verify empty library, fresh install, returning learner, midnight, timezone changes, and upgrade fixtures.

**Exit:** known conjugation defects are corrected; data survives migration; practice modes no longer inflate one shared mastery claim; queue/progress behavior is tested.

## B03 — Content trust and editorial production

**Package:** machine validation and review workflow first; human review batches follow independently. **Main files:** `src/data/decks/`, `src/utils/register.ts`, `src/utils/regions.ts`, review screens, audio manifest/generation script, new editorial artifacts.

- [ ] **B03.1 [AI]** Export a review inventory with stable IDs, text, examples, translations, tags, register, regional claims, audio provenance, and review status. Prioritize the first mission and the 20 `needs_native` cards.
- [ ] **B03.2 [AI]** Add explicit regional metadata supporting shared/multiple regions rather than relying solely on inferred deck/tag matches; retain compatible filtering and migrations.
- [ ] **B03.3 [AI]** Define reviewed/draft/needs-correction states, reviewer attribution, content versions, and a release filter. Automated validation checks completeness and contradictions; it does not certify authenticity.
- [ ] **B03.4 [H-LANGUAGE, AI]** Review the first mission, grammar fixtures, common phrases, slang/register, and regional claims; AI applies reviewed corrections and adds regression fixtures.
- [ ] **B03.5 [AI, H-LANGUAGE]** Prepare recording scripts and speaker briefs; recruit/record through human-led arrangements, obtain appropriate rights/consent, and review pronunciation. Maintain generated versus human audio provenance.
- [ ] **B03.6 [AI, H-LANGUAGE]** Review the remaining library in batches, prioritizing usage and risk. Quarantine unresolved teaching content from the release rather than marking it approved.

**Exit:** released teaching content has traceable editorial status; pilot content and audio are accepted; unresolved content is excluded or explicitly gated. Do not block unrelated UI coding while waiting for recordings.

## B04 — Quizzes and contextual grammar

**Package:** assessment improvements + short contextual explanations. **Main files:** `src/screens/QuizScreen.tsx`, conjugation components/data, learning-event integration, new exercise utilities, tests.

- [ ] **B04.1 [AI, H-LANGUAGE]** Generate plausible distractors with unique answer text and one unambiguous best answer; validate synonyms, alternate regional forms, and grammatical categories.
- [ ] **B04.2 [AI, SIM]** Offer a small first-session practice experience before ten words have been seen; handle sparse regional pools without duplicate or impossible questions.
- [ ] **B04.3 [AI]** Add unaided production/reverse-recall and cloze exercises, with explicit accepted variants and informative corrections. Keep modality-specific results.
- [ ] **B04.4 [AI, H-LANGUAGE]** Add short reviewed grammar explanations attached to useful phrases; cover requests, questions, pronouns, and past events in the pilot's scope.
- [ ] **B04.5 [AI, SIM]** Verify correct/incorrect/hinted responses, accents, punctuation, empty pools, repeated attempts, and learning-event integrity.

**Exit:** first-time learners can practice; questions test meaningful distinctions; each exercise records the appropriate evidence.

## B05 — Daily guidance and efficient workload

**Package:** onboarding continuity + daily planner + calmer Home. **Main files:** onboarding/home/study screens, `src/storage/prefs.ts`, queue utilities, translations, tests.

- [ ] **B05.1 [AI, H-PRODUCT]** Prepare a concrete starting audience and journey: default proposal is an adult with beginner/basic Spanish preparing for everyday life in Colombia. Make level self-report adjustable; validate the proposal in the pilot.
- [ ] **B05.2 [AI]** Use purpose and region throughout recommendations, with editable preferences and a general-content fallback. Include optional trip date and available study time.
- [ ] **B05.3 [AI]** Build 3/5/10-minute plan options combining due review, a small amount of new material, and one applied activity. Use initial duration estimates, then calibrate with measured session times.
- [ ] **B05.4 [AI, SIM]** Separate reviews due, new cards available, and today's bounded plan; provide catch-up after absence without resetting progress or flooding the learner.
- [ ] **B05.5 [AI, SIM]** Make the main Home action start/resume the recommended activity directly; verify preference changes, timezone changes, and no-content states.

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
- [ ] **B11.2 [AI]** Test corrupt/oversized/old backups, partial writes, duplicate IDs, migration failure, and interrupted restore; never silently wipe existing progress.
- [ ] **B11.3 [AI, H-PRODUCT]** Decide whether cross-device demand justifies optional accounts. Keep local learning available without an account.
- [ ] **B11.4 [AI, H-ACCOUNT]** If enabled, implement secure auth, per-user access, sync conflicts, offline queues, deletion/export, and recovery; configure production services through authorized accounts.
- [ ] **B11.5 [AI, DEVICE]** Verify backup through real share/file flows; if sync exists, test two physical devices, reinstall/recovery, conflicting offline edits, and interrupted connectivity.
- [ ] **B11.6 [AI, H-PRODUCT]** Inventory all diagnostics/network data, validate crash-reporting redaction and sampling, and update privacy disclosures to match actual behavior.

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
