# Practice passport — concept for owner review

Status: proposed product direction for B10.1/B10.2, not an approved architectural spec, implementation plan, reward feature or accepted teaching content. Baseline `0007091`. This package prepares the missing AI design work; parent B10 tasks remain open.

## Intended outcome

Make useful practice feel like a small, memorable accomplishment and give a learner a reason to try an everyday situation again. The working audience is the existing pilot proposal: adults with beginner/basic Spanish preparing for everyday life in Colombia. The proposed first scope is the existing First Morning café mission, rather than a new curriculum or several unrelated game systems. These are assumptions for owner review, grounded in B05/B07/B10; learner benefit still needs the B13 pilot.

Keep Classic default and permanently available, Barrio optional, and the approved Home composition unchanged. Add the eventual passport to Progress and link it from eligible mission completion in both themes. Use existing theme tokens, controls and language settings; changing appearance must preserve a pending completion/retry.

## Approaches

| Direction                                              | What a learner gets                                                                                                                       | Trade-off                                                                                                                                                                                                                                   |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Recommended: a small durable practice passport** | One café stamp for the accepted practical outcome, a neutral support label, a recurring cast and an optional comparable replay challenge. | Requires durable completion receipts, backup/restore rules and explicit qualifying outcomes. It can retain an earned stamp across retries and later practice.                                                                               |
| B — A current-run checklist                            | A clear summary of the latest scene and what to practice next, using current saved mission state.                                         | Smaller implementation, but a new run replaces the previous mission run. It cannot honestly promise a permanent earned collection without additional storage. Useful as an activity summary, rather than the requested persistent passport. |
| C — XP, coins and competitive ranks                    | Frequent numerical rewards and public comparison.                                                                                         | Adds unrelated balances, incentives and recovery rules. It can reward tapping/grinding or speed rather than useful language; defer it from this package.                                                                                    |

The recommendation is A. The small collectible is tied to a real authored task; no coins, leaderboard, timed ranking or fluency badge is proposed.

## A learner’s first visit

In the proposed scene, you arrive at Ana’s café with Nico. Nico handles the tray while you greet the staff and make the request. When your first choice is unavailable, you choose a workable alternative, using help whenever you want. Once the required responses qualify and save, your café stamp appears with this run’s support description. On another day, the same characters and stamp make the place familiar; an optional replay offers another useful attempt at your own pace.

## Recommended experience

1. **A qualifying outcome, not a completion tap.** The first eligible mission must be an exact editor-accepted café pack with declared required assessed responses. Each required response must reach an accepted answer; hints, a model answer or corrective retry are allowed and recorded as support. Merely advancing through scenes, ending after incorrect feedback or using the unscored speaking alternative does not earn an outcome stamp. Those activities retain their existing learning records and can show a supportive “Practice reviewed” summary with optional retry.
2. **One stamp, two honest descriptions.** An eligible supported completion says “Completed with support.” A qualifying run with no recorded hints, models, corrective retry or relevant transcript assistance says “Completed without recorded help.” Both have the same visual weight. Neither is a certificate, proof of real-world independence, listening/speaking proficiency or delayed retention. Exact assistance rules belong to the accepted task definition and written spec.
3. **Keep what was earned.** The base stamp is unique to its mission/outcome and accepted content identity. A retry cannot add duplicate stamps, a later supported run cannot remove an earlier earned outcome, and restarting a mission cannot erase the collection. A newer content version does not silently promote an older result; keep its historical version visible and offer the updated practice separately.
4. **A personal challenge without racing.** Offer “Try this version again without help, if you want” after supported completion. Compare only the same accepted task/version and its recorded support status. There is no invented hint total from incomplete history, speed contest, daily quota or extra reward for hiding help. Hints remain easy to reach, and repeated supported practice remains useful.
5. **A quiet celebration under learner control.** Show the stamp and a short acknowledgment after its durable save succeeds. Optional brief motion follows a saved celebrations preference and the existing system reduced-motion setting; reduced motion uses an immediate static result. No sound, microphone request, forced sharing or extra notification. An uncertain save offers the original retry, without celebrating or granting twice.
6. **An honest empty/archived state.** The current First Morning pack is an editorial draft, so production earns no café stamp yet. A development-only preview can use labeled QA content for AI tests. Show the feature in production when accepted eligible content or retained historical receipts exist; do not invent an available mission. Retired/unavailable versions keep bounded historical practice records without advertising current mastery or offering a broken replay.

Provisional completion-copy examples, for later language review:

| Meaning                       | English draft                   | Spanish draft                       |
| ----------------------------- | ------------------------------- | ----------------------------------- |
| Outcome                       | Café practice completed         | Práctica en la cafetería completada |
| Supported qualifier           | Completed with support          | Completada con apoyo                |
| No recorded support qualifier | Completed without recorded help | Completada sin apoyo registrado     |
| Optional replay               | Practice again                  | Practicar de nuevo                  |
| Outcome not yet demonstrated  | Practice reviewed               | Práctica revisada                   |

The labels describe this run, not a claim that its phrases were never seen before. The “no recorded help” qualifier is deliberately narrower than real-world independence. The written spec must fix exact accessible names and explanations, not use stamp color alone to communicate assistance.

## Why the current run is insufficient as the award record

The current [mission engine](../../../src/missions/engine.ts) preserves a sticky `assisted` flag, but resets per-node hints/model/feedback fields when advancing. It also allows advancing a production node after feedback that is not correct. `completed: true` therefore does not by itself prove every required response was accepted.

The saved mission envelope allows one current run per mission and at most50 runs; [starting a new run](../../../src/storage/missions.ts) replaces the prior mission entry. The learning-event tail is bounded at5,000 observations. Neither the latest run nor that tail can reconstruct a permanent collection or exact historical support totals reliably. Do not backfill missing evidence or infer an outcome from card repetitions, daily targets, streaks or generic completion counts.

For A, the written architecture should define durable completion receipts tied to the exact accepted outcome/version and validated required-step evidence. Record structured outcomes and stable references, not raw learner answers. Commit the qualifying completion and its reward receipt through the existing durable coordinator, with one retained operation identity. Viewing Progress, replaying a saved animation, cold startup or backup import must not generate another learning event or reward.

Receipts need explicit portable backup/restore and conflict rules: preserve earned receipts across a new run; deduplicate matching imported identities; retain an earned no-recorded-help receipt when a later comparable run uses help, while preserving supported completions; reject conflicting identities without partial writes; distinguish older/unavailable content. Imported local receipts remain local recorded history, not independently verified credentials. Exact storage keys/schema, bounds, merge policy and migrations belong in the written spec after the direction is approved.

## One short story, inside the existing mission

The [character and scene brief](story-brief.md) proposes two fictional adults and a small greeting → request → unavailable item → alternative → thanks arc. It does not add more mission packs before the pilot. Character context can make the moment recognizable, but any hint/model that supplies an assessed answer must be optional and recorded as help. No voice, image, cultural claim, accepted Spanish dialogue or new content release is supplied by this proposal.

## Work bundles after design, spec and plan review

| Bundle                             | AI can implement and verify                                                                                                                                                                                                                                                                                                                                             | Real dependency                                                                                                                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Outcome/receipt contract       | Accepted-content eligibility, required-step evidence, exactly-once completion receipts, best comparable support status, version/archive handling and portable backup/migration/recovery. Tests cover premature completion, incorrect feedback, hints/model/retry, duplicate commands, interrupted writes, conflicting import, history trimming and no reward downgrade. | Owner approves scope/spec/plan; an editor defines and accepts the real task outcome/content before production eligibility. Synthetic accepted QA fixtures can exercise the code locally. |
| 2 — Learner experience             | Existing completion handoff, Progress passport, optional replay, preference/reduced-motion behavior, bilingual accessible controls and Classic/Barrio presentation. Verify no synthetic SRS/daily/streak/learning credit from reward reads, correct save retry, empty/archived states, and state retention across theme/language/font changes.                          | Human language/representation review for final story/copy; no paid account or physical device is needed to build/test the local feature.                                                 |
| 3 — Runtime acceptance/integration | Fresh installed own-path iOS phone/tablet, explicit preflights/source preservation, actual completion/retry/cold/backup flows, both languages/themes/large text/reduced motion; update evidence, independent review, CI, merge/push.                                                                                                                                    | Functioning simulator UI; Android SDK agreement remains separate. Signed/physical accessibility, tap comfort and actual learner motivation/transfer require their own B12/B13 evidence.  |

AI can draft the character/script brief and apply reviewed corrections. A person supplies actual product choice, Spanish/cultural acceptance, recordings/rights if later commissioned, and learner observations. This package does not recruit anyone, contact a performer, publish content or authorize spending. B10.5/B13 must evaluate whether the feature helps people want to practice and learn; remove or revise it if it pressures or distracts them.

## Current review boundary

Approve/revise direction A and the café-only outcome/support/story scope. That focused design approval permits writing the architectural spec. Written-spec review and implementation-plan review follow under the standing Native preference. This concept does not pre-approve unknown interfaces or runtime changes, and the separate audio-pack spec review remains pending.

Checks for this package are source grounding, local-link verification, formatting and a fresh independent read-only review. There is no product code, asset, dependency, account or simulator change. Existing main baseline is117 suites/1,157 tests and green CI, which does not validate this unimplemented feature.
