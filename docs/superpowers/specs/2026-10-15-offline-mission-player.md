# First offline mission and player

Standing request: complete actionable AI roadmap work and merge/push it. The first mission follows the already proposed “Your first morning in Medellín.” Intended audience: adults with beginner/basic Spanish preparing for everyday life in Colombia. Technical success is a complete offline authored flow, assessed responses with honest assistance labels and recoverable progress; actual usefulness, language acceptance and efficacy need human review/pilot.

## Experience and teaching scope

Development-only draft preview, clearly labeled before entry and throughout. In a café, greet staff, request coffee, understand that coffee is unavailable, choose water and complete a thank-you. Typed greeting/request and cloze thank-you use explicit draft variants/corrections. A short choice checks reading comprehension; it does not claim listening or speaking evidence. This text-first pack has no media. The schema reserves validated media references; playback controls and authentic dialogue/listening remain separate audio packages. Speaking also stays separate.

Wrong/near-accent answers show an authored correction. The learner can retry or continue with assistance; hints remain counted on retries. After viewing a correction, subsequent attempts explicitly record model-answer assistance even when no hint was requested. Completion distinguishes finishing with help from no recorded hints/errors; it is not a mastery certificate. Difficult source card IDs are collected for follow-up without editing their SRS. Main app features remain available.

## Architecture

`src/missions/schema.ts`: versioned localized scenes, choices, production exercises and completions; stable IDs, source references, prerequisites and optional media references. Validate bounded arrays/strings, unique IDs/options, valid branches, reachability, acyclic authored graph and reachable completion. Every choice has one correct answer; incorrect responses stay for feedback/retry, with an explicit assisted continuation to the correct branch.

`src/missions/engine.ts`: pure run state and transitions, revision conflicts, recorded hint/error assistance, current feedback, stable per-attempt learning observations and safe retry identity. No raw typed responses in state/events. A retry persists a single submitted intent; a fresh attempt is explicit. Content-version mismatch cannot silently resume a changed script.

`src/storage/missions.ts`: one current run per mission, at most 50; durable writes coordinate run progress and learning events using the existing event/transaction order. Last applied operation receipt deduplicates immediate uncertain retries; stale revisions reject, never reapply old intent. It is not a permanent command receipt service. Captured input is copied before waiting.

Supported backups gain optional mission state while old seven-field version-3 files remain accepted. Snapshot captures current mission state; a full app-state restore from an old file resets missing mission state to empty, while deck-only modes retain it. Strict validators reject malformed mission state and arbitrary storage keys.

`MissionScreen.tsx`: accessible scrolling player, keyboard avoidance, pending-control protection, load/save failure retry, exact saved checkpoint/feedback, explicit start/restart, completion and follow-up list. Draft content is accessible only through the existing development-tools flag; the route and screen both gate it. No production content acceptance is invented.

## First content and review

Draft source anchors: greetings/0010; food/0024 and 0025; conversation/1148. Draft phrases and branch text get an explicit editorial review packet; source-card acceptance alone cannot approve the composed mission. The live mission must remain gated until the exact script, variants, recordings and release candidate receive their own acceptance. Prerequisite/media registries are structurally validated, not evidence of human approval.

## Alternatives and limits

A hosted conversation would introduce cost, privacy and provider decisions before a deterministic scenario is measurable. Reusing only flashcards cannot represent an unavailable-item branch or applied outcome. This minimal authored graph supports those flows without making a broad dialogue platform. Do not add accounts, paid APIs, invented human reviewers or simulated learner success. Real audio quality, microphone/device integration, Android interaction, release content review and pilot decisions remain open.
