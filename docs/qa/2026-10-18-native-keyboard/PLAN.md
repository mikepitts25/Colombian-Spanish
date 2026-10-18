# Keyboard positioning follow-up

Baseline: 236d185. Execute B08.5-B8 on the disposable narrow iOS clone before wider tablet coverage.

- [x] Reproduce a lower-field/software-keyboard defect with normal touch input and retained draft.
- [x] Trace keyboard layout ownership and make one bounded correction; verify the original native symptom is gone.
- [x] Check default-size new-deck/rename software keyboard and size3→11 draft retention; largest-text keyboard-open touch reachability remains open.
- [x] Preserve all learning state; cancel or clean only this batch's synthetic data; verify cold restoration.
- [x] Full automated/static checks, fresh review and checklist evidence. Integration follows the user’s standing authorization to merge/push main.

Native RED: Spanish size3 Add Card, focus Tags, actual Q key, touch-scroll to the end twice: Tags is visible but Save is partly covered by the keyboard prediction bar. Screenshot `tags-keyboard-obscured.png` records initial focus (before scrolling). No save was submitted.

Hypothesis: the main form's padding-based KeyboardAvoidingView calculates keyboard overlap in a parent-relative frame below the native navigation header, without a header offset. The remaining scroll range therefore leaves the footer under the keyboard. Prefer the scroll view's native keyboard inset calculation for this main form rather than adding a fixed header-height guess. Keep modal ownership separate.

Ruling: native geometry is the regression oracle; a Jest assertion that a particular layout prop exists would mirror implementation and cannot prove visibility. Retain before/after screenshots and exact touch steps, plus run the existing behavioral suite.

Experiment 1: native scroll automatic keyboard insets adjusted initial focus, but touch drags dismissed the keyboard and did not prove Save visibility with keyboard retained. Reverted. Next bounded fix uses the actual navigator HeaderHeightContext as the existing main KeyboardAvoidingView offset; no fixed device/header height. Modal offset remains zero because native Modals use the full window.

Native measurement: header=74; KAV frame y20/h573; with real header offset the keyboard-open scroll viewport is313pt. After retaining keyboard taps and dragging from the visible Back label (1000,707) to (1000,406), full Save is visible above the retained software keyboard. Temporary UI measurement code removed.

Final native default-size rerun: actual Q key, drag Back label (1000,707)→(1000,406), full Save above keyboard. Downward drag (1000,455)→(1000,1050) dismisses keyboard while retaining Q. Added interactive dismissal to preserve an explicit dismissal gesture alongside persistent taps. Characterization test RED received387 vs expected313 without header offset; restored offset GREEN.
