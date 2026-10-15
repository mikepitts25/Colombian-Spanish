# Tabs, flashcard focus and Reduce Motion — 15 October 2026

Dedicated Colombian Spanish Fresh QA iPhone 16 Pro simulator, iOS 26.0, Expo Go 54.0.7, local Metro development bundle. Branch `codex/reduced-motion-accessibility`, base `4e1eb54`.

Observed larger bottom-tab labels and selected Home/Study state through Device Hub accessibility output. Resumed the eight-card Business queue without grading. On the front of `gerente`, accessibility output contained the Spanish flip target/example and separate `Listen: gerente` action, without the English answer. After tapping flip, only the English `manager`/example flip target remained. The 48-point audio button and larger tab labels are visible in image 01.

Opened the dedicated simulator's iOS Settings → Accessibility → Motion, enabled Reduce Motion and confirmed switch On (image 02). Returned to the app and successfully flipped the same card; only the active back face was exposed (image 03). Restored the simulator's Reduce Motion switch to its original Off state. Automated tests, rather than screenshots, establish that reduced-motion paths avoid animated timing and that a late preference query cannot overwrite a newer system change.

A mouse drag through Device Hub did not produce a native swipe transition, so native swipe grading is not marked verified. Direction/grade behavior is covered by targeted event-lifecycle regressions. No extra card grade was intentionally submitted during this UI check.

Fresh review found one important animation defect: React Native resets its mutable gestureState.dx after release, before the animation completion. A regression reproduced a right swipe incorrectly grading 2 instead of 4. The implementation now captures the grade at release; both right/left cases pass after resetting the same gesture object to zero before completing the animation. Other tests cover overlapping/stale animation callbacks, card replacement, current grading callback, interrupted flip/termination, hidden faces, audio labels, listener cleanup and navigation semantics. Existing Study tests now explicitly distinguish mounted hidden answers from visible/focusable answers.

Final verification: 66 suites / 700 tests, typecheck, lint, formatting, data/editorial validation and unchanged generated inventory. One fresh review; its finding was reproduced and fixed, without a second review cycle.

Limits: these are simulator AX/layout and automated animation results, not real VoiceOver/TalkBack use or motor-comfort evidence. Long/large text, tablets, Android native UI, remaining theme/control consistency and physical accessibility remain open. Flashcard scheduling algorithms and event schema did not change.
