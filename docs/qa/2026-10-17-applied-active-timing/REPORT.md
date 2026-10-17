# Applied active timing — 2026-10-17

## Result and scope

B05.3-B2b2-A implements active written-response measurement and content-version-specific plan budget calibration. The two-node production → complete response shape is supported. Longer and multimodal missions retain their existing timing and need their own workload model. Draft language remains gated; speed and completion never imply proficiency.

The existing foreground/focus hook measures hint/answer segments and pauses during save/error, feedback, navigation blur, OS inactive/background and Android interaction blur. A retained failed save carries exactly the captured timing. New runs accumulate segments durably; any missing/unobserved segment makes the total unknown. Cold unanswered resume cannot reconstruct unsaved time; cold feedback resume preserves previously committed timing. Legacy wall-clock answer-event timing is a separate observation, never used for calibration.

The portable mission envelope now carries optional bounded timing samples, committed once on actual completion in the same journal as mission/plan. Maximum 100 retained, last 30 matching mission/version samples in 30 days considered, valid 2–180 sec, at least five distinct runs, median clamped15–90sec. Before enough samples, initial 60 sec. Home preview and fresh atomic planner agree; persisted plans/queues remain frozen. No new learning event, SRS grade, daily increment, storage key or dependency.

## Automated / review evidence

Observed failing/passing tests cover engine accumulation/null propagation, immutable timing replay, old/new schema validation, missing/nonfinite input, recent/version/future/duplicate filters and threshold/clamps, actual completion-only atomic sample recovery, retention across replacement, portable roundtrip/corrupt state, frozen versus fresh plans and production fallback, shared Home preview, hint/background/save retry exclusion, and cold unanswered/feedback cases. The nonfinite regression caught JSON snapshot converting NaN to null; preserving the primitive until validation fixes it.

Final local suite: **89 suites / 872 tests passed**. Types, lint, whole-repository formatting, calendar 16, data/audio 47 decks / 1,392 cards and editorial validation passed. All 1,392 cards still await current human acceptance. One fresh whole-branch review of c2883cc..9f87d46 found no blocking regressions. Implementation `9f87d46` and native evidence `0cd546a` were merged/pushed; merged tree passed 89/872. [CI 39035133880](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39035133880) passed all four quality/content, iOS/Android project-generation/production-JS-bundle, and summary jobs. [Board 39035133892](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39035133892) passed. These exports are not native Android runtime or hardware acceptance.

## Actual iOS simulator

New dedicated Colombian Spanish Applied Timing QA, device 99B846D3-361A-48FE-B3C1-9FD837CDCE76, iPhone 18 Pro / iOS 27, existing unsigned SDK57 client/Metro 8098. Earlier QA fixtures left intact. Actions were through native UI; [read-only state snapshots](native-state-check.json) and [background observation](background-window.json) record the result.

1. Completed fresh onboarding with work/all profile, daily target 5; saved three-minute preference. Home opened its exact two-card plan. Two real grades advanced to the assigned written reply.
2. Started the response and requested a hint. Persisted active total 5,806 ms. Backgrounded through Simulator Home; verified SpringBoard visually. Confirmed at least 32.75 seconds background before foregrounding.
3. Entered Buenos días, checked correct. Hint→answer wall interval 89,937 ms; active segment 39,422 ms. Aggregate 45,228 ms excludes background. It differs from the legacy wall-clock event by design.
4. Cold terminated/relaunched, Home Continue restored exact hint/correct feedback. Continue completed the assigned plan and saved exactly one 45,228ms sample for run mvceluka-b-l1h3n7mf11a, mission daily-morning-greeting/version1.
5. Daily/new counts stayed 2 with target 5; events stayed 3 at completion (two reviews, one answer); deck hash stayed 912c710e0198214bbb6969e9eedfcd7fad7fc97b309f33eb8f0d5c24e63850fe. The dedicated fixture retains actual QA progress/sample.

[Feedback](feedback-es.png) · [completed plan](complete-es.png).

This native run supplies one measured sample. The five-run threshold, calibrated Home wording/allowance and uncertain pre-answer restart behavior are automated evidence here, not five native learner trials. Broader narrow/tablet/large-text and lifecycle/platform checks remain B05.3-B2b2-B. Native Android runtime, signed notification behavior and physical-device acceptance remain separate. The known unsigned-client notification keychain warning is visible; no signing/hardware claim is made.
