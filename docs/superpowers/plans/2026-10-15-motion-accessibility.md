# Navigation and flashcard accessibility

Bounded B08.2-A/B08.4-A: improve existing controls without redesigning the app. Bottom tabs need readable 12-point labels, flexible height and at least 48-point targets, role/selected state and meaningful names. Flashcards need inactive faces excluded from accessibility focus, explicit listen/flip roles and labels, and a 48-point audio target. Preserve existing front/back text and example separation. Respect system Reduce Motion in card flips/swipes and stack transitions; subscribe to live changes and clean up listeners. Default conservatively to no motion while preference is unknown/unavailable. Do not claim real VoiceOver/TalkBack acceptance from component tests.

Keep swipe grading semantics intact; avoid stale responder closures when preferences/props change. An animation interrupted by a preference/card change must not grade a later card. Tab route order/features stay intact. Large-text/tablet/fullscreen-reader verification remains separate.

- [x] RED regressions for hidden answer focus, accessible controls, motion preference/live changes, current responder callbacks and navigation semantics.
- [x] Implement a shared reduced-motion hook and bounded component/navigation changes.
- [x] Full checks, one fresh review and regressions if needed, available iOS evidence, master updates.
- [ ] Merge/push and record CI.

Review: one fresh reviewer identified mutable PanResponder gesture data used after release. RED proved grade 2 instead of 4 for right swipe after native dx reset; fixed by capturing grade synchronously. Both directions and full suite pass. QA report records native active-face/OS motion checks and unavailable native drag evidence.
