# Narrow Study maximum-text acceptance

Baseline: main `11ea040`; branch `codex/study-maximum-grading`.

1. Clone the existing restored narrow iOS 26 QA fixture, preserving its source. Use normal app UI and read-only state inspection.
2. Cold-launch and resume the existing ordinary queue. At maximum native text size, flip the current card, touch-scroll to expose Again and Hard and their full intervals above the bottom tabs. Capture screenshots.
3. Submit actual touch grades on the dedicated clone; compare the intended card, counters, event append, queue and separate linked daily plan. Cold-resume and verify no duplicate grade.
4. Record exact coverage and limits, update B12.5-C only if its remaining Again/Hard condition is proved. No product fix without a reproduced defect.
5. Format/validate evidence; independently review the acceptance assertions; merge and push the evidence batch.

No security work, license acceptance, signed-release claim or physical-device claim. Larger Android/tablet/OS matrix remains in its parent gates.
