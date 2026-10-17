# Applied active timing — 2026-10-17

## Result and scope

B05.3-B2b2-A implements active written-response measurement and content-version-specific plan budget calibration. The two-node production → complete response shape is supported. Longer and multimodal missions retain their existing timing and need their own workload model. Draft language remains gated; speed and completion never imply proficiency.

The existing foreground/focus hook measures hint/answer segments and pauses during save/error, feedback, navigation blur, OS inactive/background and Android interaction blur. A retained failed save carries exactly the captured timing. New runs accumulate segments durably; any missing/unobserved segment makes the total unknown. Cold unanswered resume cannot reconstruct unsaved time; cold feedback resume preserves previously committed timing. Legacy wall-clock answer-event timing is a separate observation, never used for calibration.

The portable mission envelope now carries optional bounded timing samples, committed once on actual completion in the same journal as mission/plan. Maximum100 retained, last30 matching mission/version samples in30days considered, valid2–180sec, at least five distinct runs, median clamped15–90sec. Before enough samples, initial60sec. Home preview and fresh atomic planner agree; persisted plans/queues remain frozen. No new learning event, SRS grade, daily increment, storage key or dependency.

## Automated / review evidence

Observed failing/passing tests cover engine accumulation/null propagation, immutable timing replay, old/new schema validation, missing/nonfinite input, recent/version/future/duplicate filters and threshold/clamps, actual completion-only atomic sample recovery, retention across replacement, portable roundtrip/corrupt state, frozen versus fresh plans and production fallback, shared Home preview, hint/background/save retry exclusion, and cold unanswered/feedback cases. The nonfinite regression caught JSON snapshot converting NaN to null; preserving the primitive until validation fixes it.

Final local suite: **89 suites / 872 tests passed**. Types, lint, whole-repository formatting, calendar16, data/audio47decks/1,392cards and editorial validation passed. All1,392cards still await current human acceptance. One fresh whole-branch review of c2883cc..9f87d46 found no blocking regressions. Integration/CI recorded after actual results.

## Actual iOS simulator

New dedicated Colombian Spanish Applied Timing QA, device99B846D3-361A-48FE-B3C1-9FD837CDCE76, iPhone18Pro/iOS27, existing unsigned SDK57 client/Metro8098. Earlier QA fixtures left intact. Actions were through native UI; [read-only state snapshots](native-state-check.json) and [background observation](background-window.json) record the result.

1. Completed fresh onboarding with work/all profile, daily target5; saved three-minute preference. Home opened its exact two-card plan. Two real grades advanced to the assigned written reply.
2. Started the response and requested a hint. Persisted active total5,806ms. Backgrounded through Simulator Home; verified SpringBoard visually. Confirmed at least32.75seconds background before foregrounding.
3. Entered Buenos días, checked correct. Hint→answer wall interval89,937ms; active segment39,422ms. Aggregate45,228ms excludes background. It differs from the legacy wall-clock event by design.
4. Cold terminated/relaunched, Home Continue restored exact hint/correct feedback. Continue completed the assigned plan and saved exactly one45,228ms sample for runmvceluka-b-l1h3n7mf11a, missiondaily-morning-greeting/version1.
5. Daily/new counts stayed2 with target5; events stayed3 at completion (two reviews, one answer); deck hash stayed912c710e0198214bbb6969e9eedfcd7fad7fc97b309f33eb8f0d5c24e63850fe. The dedicated fixture retains actual QA progress/sample.

[Feedback](feedback-es.png) · [completed plan](complete-es.png).

This native run supplies one measured sample. The five-run threshold, calibrated Home wording/allowance and uncertain pre-answer restart behavior are automated evidence here, not five native learner trials. Broader narrow/tablet/large-text and lifecycle/platform checks remain B05.3-B2b2-B. Native Android runtime, signed notification behavior and physical-device acceptance remain separate. The known unsigned-client notification keychain warning is visible; no signing/hardware claim is made.
