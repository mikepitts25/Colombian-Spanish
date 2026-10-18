# Add Card keyboard positioning — 2026-10-18

B08.5-B8b closes a bounded Spanish narrow-phone default-size keyboard defect and default-size new-deck/rename dialog checks. Parent B08.5-B8 remains open. Baseline `236d185`; dedicated disposable iPhone SE (3rd generation), iOS26 UUID `F8D6111F-AD0F-413A-A6B5-86EEB4CB5EB6`, existing unsigned SDK57 development binary with Metro8098 serving this branch.

## Reproduced defect and correction

At native Text Size3, Add Card → Tags opens the software keyboard over the lower field. After an actual software Q key and two upward touch drags, the [Save button remains partly covered](save-keyboard-red.png). [Initial focus](tags-keyboard-obscured.png) is also retained.

The padding-based main KeyboardAvoidingView used a parent-relative frame below the native navigation header against the keyboard's window coordinate, without a header offset. Temporary native layout text showed header74, local y20/height573 and corrected keyboard-open scroll viewport313. That diagnostic code was removed. An attempted native scroll-inset replacement was reverted after it failed to prove keyboard-retained access.

The final main form consumes the navigator's HeaderHeightContext (zero fallback outside a header). Its existing KeyboardAvoidingView uses that measured offset. Persistent keyboard taps prevent a label/padding touch from stealing focus during form navigation; interactive downward dismissal retains a way to hide the keyboard. Native modals keep their existing full-window keyboard avoidance and zero offset. `@react-navigation/elements` is now declared directly at its already installed/locked version range; no resolved package version changed.

The native acceptance test is the geometry oracle. A supplementary characterization test renders the real KeyboardAvoidingView under HeaderHeightContext, emits a native layout and keyboard event, and checks a hand-derived313-point visible viewport. Removing the production header-offset line produces387 instead ([RED](red.log)); restoring it passes. This checks the header-to-keyboard coordinate boundary, not just the presence of a layout prop. Jest does not establish touch accessibility or native layout by itself.

## Native results and exact limits

- Final default-size rerun: focus Tags, press actual software Q, drag from the Back label `(1000,707)` to `(1000,406)` in Device Hub. [Full Save and Q draft are visible above the retained keyboard](save-keyboard-green.png). A coordinate tap on Save in an earlier corrected run produced the expected required-front/back validation; no card was saved.
- A downward coordinate drag `(1000,455)`→`(1000,1050)` [dismisses the keyboard while preserving Q](keyboard-dismissed.png).
- Change Text Size3→11: the Q draft survives. Reopening Tags shows the keyboard, but attempted drags did not establish largest-text Save access; this case remains open. Restore size3. This is not a maximum-text keyboard-layout pass.
- [New-deck dialog](new-deck-keyboard.png): actual software Q input, field/Cancel/Create visible above keyboard. Coordinate Cancel dismisses the synthetic draft; Create was not submitted.
- [Rename dialog](rename-keyboard.png): actual software q appended to the existing name, field/Cancel/Save visible above keyboard. Coordinate Cancel discards the local edit; Save was not submitted. No existing deck was renamed, deleted or reset.
- Cold restart returns to Spanish Home, Text Size3, VoiceOver/Capture Keyboard off. The known unsigned `ERR_NOTIFICATIONS_KEYCHAIN_ACCESS` warning can occur at launch; no entitlement, permission, signing, account or security setting was changed.

All app UI work used CUA Device Hub. Official simctl handled boot, launch, termination and screenshots. Read-only own-app storage snapshots verify all eleven canonical logical key hashes remain unchanged through dialogs and two cold restarts:47 decks/1,392 cards, empty write journal, no learning events/grades/credit or preference changes. Run `python3 docs/qa/2026-10-18-native-keyboard/verify-state.py`; collector included for reproducibility. This verifier checks stored evidence, not screenshots or UI semantics.

## Remaining acceptance

Largest-text keyboard-open lower fields/Save, English, tablet/window modes, broader touch/assistive and platform checks remain AI simulator work where surfaces are available. Android license acceptance, signed candidate and physical-device checks remain separate gates. Audio design/editorial/rights/product/account dependencies are unchanged. Security B01.8-C2g remains explicitly access-blocked; no retry or bypass.

## Final verification

Full Jest suite **101 suites / 991 tests passed**, including the new header/keyboard characterization ([log](full-suite.log)). Types, lint, full repository formatting, project data and editorial-ledger validation pass; the latter explicitly reports all1,392 cards still awaiting current human acceptance. Stored-state verifier and diff whitespace check pass. Fresh independent whole-branch review found no findings. Clone shut down; Device Hub returned to the existing mini tablet. Baseline236d185 CI39091576731 passed all four jobs; board39091576717 succeeded.
