# Large-text keyboard focus follow-up

Baseline230d1f8; MASTER_PLAN B08.5-B8.

- [x] Reproduce largest-text focused lower input hidden by the software keyboard, retaining an actual Q key.
- [x] Trace focus/keyboard layout, pin two regressions, and implement measured input focus correction.
- [x] Verify maximum-text Spanish/English phone and Spanish tablet input/Save; keep unverified modal/window/assistive/platform matrix explicit.
- [x] Restore native/app preferences and exact learning records through cold launch.
- [x] Full checks, independent review and checklist evidence.
- Integration: merge/push main is authorized; verify the merged tree before pushing.

RED: phone Text Size11, Add Card → Tags → actual software Q. Screenshot phone-max-input-red.png shows the large label and cursor but the input is mostly beneath the keyboard. The value remains Q in AX. Existing main KAV fixes the viewport/header offset but does not itself scroll a focused TextInput into that reduced viewport. Input focus has no scroll handler.

Root cause: keyboard avoidance resizes the main viewport, but no form handler reveals the focused input. Track field-container and input-relative y positions for the current font scale; scroll to the input with16pt margin on focus, keyboardDidShow and viewport shrink. Ignore incomplete/stale scale measurements and clear focus on blur. Both regressions RED with zero scroll commands, GREEN after implementation. No persistence code or modal geometry changed.
