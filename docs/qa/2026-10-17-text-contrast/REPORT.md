# Dark semantic caption contrast — October 18, 2026

Baseline `0cc4bad`; bounded fix after the separate actual-midnight capture. Small captions using `colors.textTertiary` inherited slate 500 (#64748b), which measured only 4.239:1 on bg, 3.751:1 on surface and 3.074:1 on surfaceElevated. Examples include Progress streak/deck captions and Study result metadata. The audit uses the [WCAG 2.1 normal-text 4.5:1 target](https://www.w3.org/TR/WCAG21/#contrast-minimum) with [sRGB relative luminance](https://www.w3.org/WAI/WCAG21/Techniques/general/G18).

## Correction and verification

Promoted tertiary text to existing slate 400 (#94a3b8) and secondary to slate 300 (#cbd5e1), preserving the three-level hierarchy. Backgrounds, fonts, layout and brand colors are unchanged. Progress's colored review value was already #60a5fa and passes 7.542:1 on its actual composited panel; it required no change.

`node docs/qa/2026-10-17-text-contrast/verify-contrast.cjs` reads the actual theme export and parses the actual Progress stat/panel source. It calibrates black/white=21 and identical colors=1, audits nine semantic text/base-surface pairs and the composited Progress control. [Before](before.json): 7/10 pass, process exits 1. [After](after.json): 10/10 pass, process exits 0; tertiary minimum is now 5.705:1. This is a source-color contrast check, not a screenshot-pixel or full WCAG certification.

Native unsigned SDK57 iPhone SE 3 / iOS 26, Spanish default text: inspected refreshed [Home](home-after.png) and [Progress](progress-after.png). Captions and secondary labels visibly brighten, with the same totals and navigation. [Pre-fix Progress](../2026-10-17-native-midnight/progress-after.png) is captured in the preceding midnight scenario. Read-only [state snapshots](native-state-check.json) confirm every captured durable key hash is unchanged after theme refresh and tab navigation; no grade was submitted. Device Hub app AX nodes remained unavailable, so these observations used visible coordinate controls.

## Remaining scope

B08.2-B5 covers these semantic colors on bg/surface/surfaceElevated at normal opacity. Arbitrary tinted/pressed/disabled surfaces, hardcoded colors, all control states, light theme, every activity and physical daylight/accessibility acceptance remain open under B08.2-B and related device tasks. The native check is representative default-text coverage, not another full large-text regression. This does not implement a new visual direction or approve the separate proposed audio-download subsystem.

## Automated validation

TypeScript, ESLint (zero warnings), repository Prettier and content validation passed. Full Jest: 95 suites / 928 tests passed. The run emitted existing React act/Watchman/PostCSS diagnostics; no test failed. Content validation reports 47 shipped decks, 1,392 cards and 1,392 audio entries. Both native evidence verifiers and the contrast audit passed; `git diff --check` is clean.
