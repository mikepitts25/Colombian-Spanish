# Café adventures and practice passport

Status: recommended direction selected by the owner on 2026-10-31; written design approved by the owner on 2026-10-31. Automated implementation verified; native adventure interaction and teaching-content acceptance remain separate.

## Intent and scope

Make a short practice session feel like a useful visit to a familiar place, and make the next visit inviting. The owner selected the recommendation to start with one café episode and a follow-up visit, recurring characters, persistent accomplishment stamps and a welcoming return after a break.

Build two connected, text-based café episodes using the existing React Native mission engine. Use the existing fictional Ana and Nico character brief. The first episode introduces the café and an unavailable-item alternative; the second revisits the café with a changed request. Retain local-first practice and the existing Study, quizzes and daily plan. This is a feature project, not a Home reskin or a full new curriculum.

Success is a learner understanding what to do, completing useful practice, choosing to return and recalling phrases later. More taps, longer sessions, collected stamps and streaks alone do not establish learning or retention.

## Approaches and selected direction

1. **Connected scenes with a durable passport — selected recommendation.** Familiar characters, two useful encounters, a small lasting collection and an explicit next visit. This requires content authoring, trustworthy completion evidence and backup integration.
2. **Enrich the existing latest-run summary.** Smaller, but restarting a mission replaces its current run; it cannot supply the lasting accomplishment collection described to the owner.
3. **XP, coins and competitive ranks.** A separate incentives system would add scope without supplying the connected Colombian situations selected here. Excluded from this increment.

The earlier [passport concept](../../design/2026-10-18-practice-passport/README.md) supplies the starting point. This design deliberately expands its one-mission scope to two connected visits and adds an optional Home entry in both themes. Those are proposed implementation choices for this approved direction, not claims that the earlier document authorized them.

## Learner experience

### Entry and return

Add one optional “Café adventures” entry under the main daily activity on Classic and Barrio Home. An unfinished daily plan remains the primary resume action. The adventure entry opens a small two-episode list with current availability, resume state and earned stamps. No extra bottom tab is needed. Progress contains the passport and a link back to the adventures.

Use a separate adventure flow rather than embedding the full café episode into the existing 3/5/10-minute daily plan. “A short visit” is the initial duration copy; do not promise five minutes until observed timing supports that estimate. Adventure practice never replaces or abandons a saved daily plan.

After a gap of at least seven local calendar days since recorded study activity, the entry may say “Welcome back. Start with a short warm-up.” Derive this from existing activity dates without updating them. Unknown dates use neutral copy. The warm-up is available on every visit; returning learners are not forced into it. No new weekly-goal system or streak-rule change is part of this first increment.

### Visit one: Breakfast at Ana’s café

Use a new version of the existing `first-morning-medellin` pack, preserving the mission ID and all source-card IDs. Begin with a short scene introducing Ana at work and Nico as a neighbour. Follow the existing greeting → polite request → unavailable item/alternative → thanks arc. Keep beginner language, light personality and easy-to-reach help. No automatic pre-answer dialogue should supply an assessed answer within the scene.

Offer a three-phrase cue/reveal warm-up before the scene. It intentionally supplies practice support and is not an assessment. Persist `warmupUsed` for that run; any later stamp is described as completed with support. Skipping the warm-up is allowed. Reopening warm-up during a run counts as support before showing answers. Leaving or replaying warm-up never creates SRS grades, daily/streak credit or a stamp.

The scene uses reading, typing and choices, as the existing engine does. It is not advertised as assessed speaking or listening. Do not request microphone access or add recorded dialogue to deliver this feature.

### Visit two: Back at the café

Ana recognises a returning visitor, and Nico is familiar. Reuse the greeting/request/thanks structures in a changed order with a different, modest request. Author the exact bilingual script and accepted responses against real source-card references during implementation; those lines remain drafts until reviewed. Keep the existing one-correct-choice model rather than adding a branching dialogue engine.

Use stable mission ID `back-at-anas-cafe`, content version 1. Visit two becomes playable after a saved completion of visit one, including a supported or reviewed-only completion. Stamp qualification is independent. Replay of visit one cannot relock visit two: persist the story-completion milestone rather than relying on the latest replaceable mission run. Milestones are mode-scoped: legacy draft completions and preview completions never unlock accepted visit two. An accepted visit-one milestone remains sufficient across later accepted revisions; the target episode must independently be currently accepted and available. Historical milestones are story progress, not current content acceptance or mastery evidence.

At the end of visit one show “Next visit: Back at Ana’s café” with an optional Continue action. On the next launch highlight that episode. There is no calendar lock, invented third episode or obligation to wait until tomorrow. After visit two, offer replay and the learner’s ordinary daily practice.

### Completion and passport

Present a static, illustrated café stamp only after its durable save succeeds. Use code-native themed vector/icon styling for the first increment; portraits, new raster artwork and commissioned performances are deferred. Provide two equal-weight stamps, one per visit, with accessible text naming the episode and support status. Keep celebrations quiet and static in this increment, satisfying reduced-motion preferences without adding a celebration setting.

Qualification requires an accepted answer on every declared required assessed node in the same run. A hint, warm-up, correction or retry is allowed and produces “Completed with support.” A run with no recorded help produces “Completed without recorded help.” An accent-only response is corrective feedback under the current assessor; it must be retried to a correct answer to satisfy that required node. Use those labels consistently in English and Spanish after copy review.

Keep the existing ability to advance after incorrect feedback. Such a run can finish with “Practice reviewed” and an invitation to retry, but cannot earn a stamp for an unmet task. A later successful retry of an earlier missed node qualifies that node; skipping an incorrect node does not. No speed ranking, proficiency badge or reward penalty for using help.

Earn each base stamp once per exact episode/version/fingerprint. Replays may improve its recorded support status, never downgrade or duplicate it. Persist story completion separately from qualifying outcomes. Replay never erases a next-episode unlock or prior stamp. Passport labels describe local recorded practice, not real-world independence.

## Content availability and review

The existing café pack is a development draft and the current `MissionScreen` is gated by `SHOW_REVIEW_TOOLS`. This feature needs an explicit content resolver; production must not simply remove that gate or treat a valid schema as editorial acceptance.

Add a versioned adventure registry and acceptance manifest binding each episode ID, integer version, SHA-256 of canonical pack JSON, declared required-node IDs and exact referenced card content fingerprints. Canonical serialization sorts object keys recursively, preserves array order and uses UTF-8 JSON. The acceptance record binds that full identity and requires genuine human attribution/date/status. No AI-authored record may impersonate acceptance.

Development may expose the two exact draft episodes, clearly marked “Draft practice,” including labeled preview stamps. Preview progress lives separately from production progress and cannot be imported or promoted into accepted stamps. Production displays adventure entry points only for accepted available content or existing historical passport entries. Revalidate identity on start/resume/command, not just on Home render. Withdrawn, changed or missing content blocks continued assessment and offers a safe return. Previously saved stamps remain historical; replay is available only for the matching eligible content identity.

An optional warm-up must use the current episode’s referenced phrases and accepted card identities. Changed source-card text invalidates eligibility even if the pack version was accidentally left unchanged. The existing deck release preflight remains required independently of mission acceptance. Preparing reviewable draft scripts is part of implementation; genuine acceptance and public release are separate dependencies.

## State and recovery contract

Extend mission-run validation with optional adventure evidence, leaving legacy non-adventure runs readable. For adventure runs record content fingerprint, preview/accepted mode, warm-up use and a bounded set of required node outcomes plus sticky support. Record structured statuses and node IDs, not raw answers. Validate node IDs against the exact pack and derive support only from recorded interactions. A legacy run without this evidence cannot be retroactively awarded a stamp.

Use `SRS_ADVENTURES_V1` for a strict versioned envelope with separate accepted and preview collections. Include current adventure runs, durable story milestones and outcome records. Store one current adventure run per (mode, mission ID), at most 50 across both modes. Adventure runs live in this new envelope, not the existing one-current-run-per-mission `SRS_MISSIONS_V1` store. Reuse the pure engine with a mode-aware adventure storage adapter and inject that adapter into the scene UI; preserve the existing adapter for ordinary missions and daily responses. Starting or restarting preview practice cannot replace an accepted run or legacy mission run. Never automatically adopt or promote legacy/draft runs into either new adventure mode.

Each outcome identity is the tuple of mode, mission ID, content version and fingerprint. Store the first qualifying run/time and best support status; preserve first-earned identity and time when upgrading support. Keep one record per identity, at most 200 across the envelope, with deterministic ordering. Bound story milestones to one per (mode, mission ID), at most 50. Refuse an operation exceeding any bound with a scoped error rather than deleting earned records.

Keep at most 50 assessed-node results per run, consistent with the pack node limit. Persist support before revealing warm-up/model content. Commit final mission state, story milestone, any qualifying outcome and actual attempt events in one existing durable storage transaction. Add the new key to the coordinator allowlist. Retain the existing command ID/revision retry semantics: interrupted commit rolls forward, retry cannot award twice, and a read never invents an award or learning event. Adventure outcomes do not alter SRS scheduling, daily card counts, streak rules or existing daily-plan phases.

Restart uses an explicit confirmation when replacing unfinished adventure progress. Content changes never rewrite an active run to a new definition. Offer an explicit restart against the new available definition while preserving historical milestones/stamps. Old draft café runs remain readable as legacy practice or are explicitly restarted; do not silently reuse version-1 evidence in the new scene.

### Backup policy

Include adventures as an optional portable-state field so older backups remain valid. New exports include the full envelope. Preserve the current app’s explicit restore-as-replacement behaviour: restoring a backup restores its adventure snapshot, with a clear warning that progress earned after that backup is replaced. Missing adventure fields in an older backup restore an empty collection. Do not introduce an unrelated merge operation or promise local awards survive an explicit rollback to an older backup.

Validate the entire import before any writes, including mission/evidence shape, duplicate identities, content mode, limits and referenced status enums. A contradictory duplicate identity is rejected without partial writes. Imported outcomes are local recorded history, never proof of independent achievement or editorial acceptance. Their replay eligibility always comes from the current registry. Preview imports never populate accepted collections. Test round trips, old-backup restore, conflicting/malformed imports and interrupted recovery through the existing coordinator.

## Presentation and accessibility

Reuse current buttons, theme tokens and navigation. Both themes get the same functionality and state ownership; Classic remains the default. Use text names for scene speakers and stamps so neither images nor colour are required. Large text must scroll from cards and buttons, keep the full response/check/retry actions reachable with the keyboard open and restore focus after dialogs. Theme/language changes and backgrounding retain the current run and pending save intent. Spanish controls do not automatically reveal Spanish answers to English learning cues.

Use the existing cue/reveal follow-up for phrases missed during the run where compatible. This is voluntary extra practice, with no synthetic grades or removal of historical mistakes. On uncertain saves keep the original Retry action and wait for confirmation before celebrating. On read failure suppress stale accomplishments and offer a scoped retry while ordinary Study remains usable.

## Validation and evaluation

Automated checks must cover required-node qualification, correct retry versus skipped failure, accent correction, warm-up/support persistence, once-only awards, no downgrade, stable story unlock, stale content, withdrawn acceptance, preview separation, legacy runs, restore and transaction faults. Home/navigation tests must verify unfinished daily-plan priority, both themes, no production draft entry and resume of the exact run. Reads/replay must not inflate unrelated counters or events.

Run the applicable Jest suite, typecheck, lint, formatting and content validation. Use a dedicated iOS simulator for start → warm-up → incorrect answer → retry → completion → passport → next visit → cold resume, plus a later replay. Check English/Spanish, both themes, large text, keyboard reachability and restore. Report simulator evidence separately from physical-device/VoiceOver acceptance; no device access or release is implied here.

Prepare a small local pilot worksheet using existing pilot documentation. Observe task comprehension, comfort using help, voluntary next-day/week return and delayed phrase recall. Collect no new analytics or personal data automatically. The worksheet can be ready in this increment; actual participants, consent, observations and efficacy results must be real. Use those observations before expanding beyond two episodes.

## Deferred scope and builder decisions

Keep this pair of episodes freely accessible when eligible. Do not change billing, entitlements, notification permissions, reminders, streak calculation, weekly goals, accounts or the library catalogue. No hosted AI conversation, audio generation, performer recruitment, public release, TestFlight upload or store submission is included.

The builder may choose internal component/module names, layout spacing using existing tokens, the small stamp vector geometry and test fixture factoring. Final script/copy remains a reviewable draft until accepted. Preserve existing source-card identities, saves and unrelated work. Follow-up implementation planning should order content identity/evidence first, durable state and backups second, scenes/navigation/passport third, and runtime verification last.
