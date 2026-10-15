# Typed recall and cloze foundation

The master plan calls for assessed production and cloze without conflating multiple-choice recognition or self-rated flashcards with unaided recall. This package is the reusable answer-checking foundation (B04.3-A), implemented inline under the standing instruction to complete AI tasks. It does not add unreviewed teaching content to the live library or claim the learner UI is complete.

Use a versioned authored exercise with stable exercise/card/deck IDs, prompt, explicit accepted answers, correction explanation and ordered hints. Cloze uses one `{{blank}}` marker and checks only the missing phrase. Typed recall uses an ordinary prompt. Reject ambiguous malformed definitions, unsupported versions and duplicate normalized answers. A release/editorial pipeline and a learner-facing player remain separate integration work.

Normalize Unicode compatibility, Spanish letter case, repeated spaces and outer sentence punctuation. Keep accents, ñ, internal punctuation and word order significant. A vowel-accent-only near match is incorrect with a distinct accent correction; never treat año/ano as equivalent. No fuzzy spelling acceptance or automatic splitting of slash-separated answers. Empty input creates no observation. Hints are authored, ordered and counted; a correct hinted answer remains assisted.

Build answer-checked recall events using an explicit session/attempt identity, timestamp and elapsed duration. Record hint count, never raw learner text. Existing append logic handles retained-ID retries; no schedule, seen-word or daily/streak mutation is performed. Persist exercise kind/ID/version as optional event provenance; old histories remain readable and backups preserve provenance.

Alternatives: automatic card-front reverse prompts lack explicit variants and can misgrade ambiguous compound answers; a hosted evaluator adds accounts, privacy and costs. Authored deterministic exercises give a testable offline base for later mission and quiz integration.

Success: exact/variant/near/incorrect/empty checks, strict malformed-schema boundaries, hint accounting, cloze validation, old/new event roundtrip, retained retry deduplication and unchanged unrelated storage all have automated evidence. Human review of real prompts/answers, UI/simulator acceptance and efficacy remain open.
