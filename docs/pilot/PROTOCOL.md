# Directional learner pilot — working protocol

Prepared October 15, 2026; capability references refreshed October 17. **Status: draft materials, no participants or results.** B13.1-A / B13.2-A. A development-only text mission player, generated listening preview and unscored local voice self-check now exist. Reviewed pilot teaching/task/audio packs and a named accepted candidate remain unavailable. See the [current capability and readiness map](READINESS.md); this protocol does not certify pilot readiness.

## Question and starting audience

Can an adult with beginner/basic Spanish use the app independently to complete a useful everyday exchange in Colombia, then apply the skill without the app in a different situation? The working audience is adults preparing for travel or everyday life in Colombia; its appeal and actual needs are hypotheses. Keep purpose/region adjustable and collect the learner's starting level as self-report, separate from observed task performance.

Start with roughly 5–8 consented adults across beginners and learners with basics. This is a directional usability/feasibility pilot, not a representative sample or evidence of population efficacy. The owner chooses recruitment and arrangements; no invitations have been sent.

## Readiness and ownership

- [ ] AI/product: named candidate commit/build, exact mission version, device/OS and fixture state recorded; B12 candidate checks passed for tested scope.
- [ ] Language editor: accept prompts, explicit alternatives, task equivalence, scoring examples and novel-speaker audio in [TASK_BANK.md](TASK_BANK.md); retain attributed decisions. Draft text must not masquerade as a reviewed release.
- [ ] Product owner: accept audience, study purpose, optional observation/recording scope, retention/deletion arrangements, participant information and contact route.
- [ ] Human facilitator: confirm voluntary participation, ability to skip/stop, and consent for each optional recording separately. Use a participant code; do not collect birth dates, actual travel dates, identities or contact lists in the research worksheet.
- [ ] Product/facilitator: store contact scheduling separately from coded observations in an access-controlled location selected before recruitment; define how a participant asks for deletion. Do not commit real participant records, backup exports, recordings or contact mappings to this repository.
- [ ] Human participants: actual independent use, immediate transfer, next-day and one-week checks. Optional speaker recordings need appropriate rights and acceptance before use.

A proposed data lifecycle is to remove scheduling/contact mappings after the last follow-up and retain de-identified findings for product decisions. The owner must choose concrete deadlines, access and deletion verification before collection. This document does not initiate contact, recordings, reminders or data collection.

## Session sequence

1. Record participant code, self-reported level, accessibility preferences voluntarily shared, candidate and test device. Explain: “We are evaluating the app and materials. You may skip any task or stop. There is no need to share personal stories or actual travel plans.” Explain exactly what is observed; audio/video capture is optional, separate and off by default.
2. **Pre-task, 3–5 minutes:** randomly assign reviewed form A or B, counterbalance across participants. Give the scenario/outcome prompt without its model answer; ask for unaided response and comprehension. Capture rubric subgoals and any requested help. Do not teach corrections yet or expose the other form.
3. **Independent first use, up to 10 minutes:** ask the learner to prepare for the practical mission using the app. Start a monotonic stopwatch when the app is ready. Observe without directing taps. Record first meaningful action, blockers, hints/transcript reveals, playback/retries and successful/abandoned outcome. If intervention is needed, record when/what; subsequent completion is assisted. Stop at the learner's request. If the facilitator stops at the time limit, record `time-limit`, not a natural abandonment.
4. **Immediate task:** use the alternate reviewed form. No app or model text initially. Record the same rubric; assistance is offered only after the unaided attempt and labeled separately. Do not assume pre/post forms are equally hard until editor review and pilot observations support that.
5. **Transfer:** use reviewed form C, different surface details and an untrained alternative/unavailable-item branch. Where listening is assessed, use a different accepted speaker from the training material, with transcript hidden. Separately record unaided comprehension, response outcome and transcript-assisted recovery. Device TTS is not evidence of comprehension of an authentic novel speaker.
6. **Interview, about 5 minutes:** ask what they could now do, what confused them, what felt useful/enjoyable, whether the next action was clear, and what they would want next. Ask open questions before discussing proposed missions/paid features. Log observations separately from preferences and facilitator interpretation.
7. **Next day and one week:** use fresh, reviewed parallel prompts, not a replay of the trained quiz; capture actual elapsed hours, intervening study/use and assistance. Missing follow-up remains missing. Scheduling is a human arrangement; no automation has been created by this kit.

## Predeclared measures

| Measure                              | Unit and denominator                                                                                                               | What it can support / limits                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Independent first-session completion | Participants completing the defined practical outcome without facilitator help / participants who attempted that candidate         | Usability/feasibility; report assisted, abandoned, time-limit and technical failure separately          |
| Time to useful outcome               | Elapsed seconds from app-ready task start to first rubric-complete exchange; report individual values and median among completions | Excludes loading time only if separately recorded; do not give noncompleters a zero or omit their count |
| Hint dependence                      | Attempts with authored hints, transcript reveal or facilitator assistance / observed attempts with known assistance status         | Report assistance type and unknowns; an app `hintsUsed:null` is unknown, not unhinted                   |
| Delayed unaided production           | Accepted communicative subgoals without cues / applicable reviewed subgoals at each observed follow-up                             | Report per-person paired changes and missingness; no inference from self-rated flashcards               |
| Novel-speaker comprehension          | Correct reviewed meaning subgoals before transcript / applicable meaning subgoals for that speaker/task                            | Keep speaker identity/version and replay count; separate transcript-assisted results                    |
| Scenario transfer                    | Practical subgoals achieved unaided on untrained form C / applicable reviewed subgoals                                             | Report alternate-path handling, not repeated exact-word recognition                                     |
| Motivation and accessibility         | Coded observations/quotes with voluntary context; optional return intention                                                        | Feedback and intentions are not measured retention, accessibility certification or willingness to pay   |

Before recruitment, the owner may choose numerical feasibility targets, but must label them hypotheses and write them down with the candidate. Do not choose passing thresholds after seeing results. A first baseline can instead prioritize blocker removal without a pass/fail efficacy claim. No numerical target or learning improvement has been validated by this preparation.

## Scoring and analysis

Use [TASK_BANK.md](TASK_BANK.md) and [observations.csv](observations.csv). Per subgoal record `independent`, `hinted`, `facilitator-assisted`, `not-achieved`, `not-applicable` or `not-observed`; also record hint/replay/transcript counts when known. A natural accepted alternative can satisfy the outcome without matching a model phrase verbatim. A qualified reviewer resolves language judgments; uncertainty stays `needs-review`. Never convert an unreviewed speech-transcription score into pronunciation or proficiency.

Analyze each modality and assistance category separately. Existing local app events distinguish recognition, self-rated recall, answer-checked recall and generated-listening checked attempts, with optional content/media provenance, transcript/model assistance, hint count and duration. Authored mission completion and assisted state are stored separately in mission runs. Neither a checked answer nor an authored completion establishes novel-speaker comprehension or delayed transfer; manual observations fill those gaps. Voice self-checks are unscored and do not submit a speaking assessment. See [READINESS.md](READINESS.md) for current interpretation limits. Do not infer exposure outside the app from missing events. Local history is bounded at 5,000 observations and backups may merge retries; deduplicate stable event IDs and report coverage limits before calculating totals.

Report the candidate/version, recruited/attempted/followed-up counts, every missing outcome, each person's paired results and denominators. Summarize median/range for timing only when enough observed completions exist; with tiny samples show individual values. Use qualitative themes with traceable observation codes; distinguish a participant's words, facilitator observation and analyst inference. Treat task practice effects, unequal form difficulty, facilitator help, self-selection, intervening study and novelty as limitations. Do not present percentages from this pilot as broad learning-effect proof.

## Decision meeting

Prepare a short findings document with: blockers and reproducibility; independent versus assisted practical outcomes; delayed/transfer evidence and missingness; enjoyment/accessibility observations; prioritized fixes; actual provider/runtime costs if any; and an explicit continue/revise/stop decision for the next mission. Link each proposed change to evidence or label it an untested idea. Update MASTER_PLAN before expanding missions, paid AI or media scope. Recruit, run, analyze real evidence and make those product decisions in later tasks; this kit closes preparation only.
