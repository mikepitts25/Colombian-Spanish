# Scoped Expo PostCSS patch — October 16, 2026

Scope: B01.8-C2a; base `d6361f3`. Exact-parent override `@expo/metro-config@54.0.17` → `postcss@8.5.30`, replacing 8.4.49. No Expo, RN, native module or Jest version changed. One installed package changed; existing NanoID/source-map dependencies already satisfy the newer declared ranges.

## Why an override

Expo54 Metro config requests `~8.4.32`, so a normal lock refresh cannot select the patched 8.5 line. The [upstream advisory](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) identifies the out-of-tree `.map` disclosure when CSS omits `from`; patched 8.5.23 and later reject that path. [PostCSS 8.5.30 release](https://github.com/postcss/postcss/releases/tag/8.5.30). This is a narrowly scoped same-major compatibility decision, not an assertion of Expo vendor endorsement. Revisit/remove the override with the Expo migration; a changed parent version deliberately falls outside this override and must be rechecked.

## Regression and review

Tests resolve the actual PostCSS used by Expo, launch isolated Node processes and create only temporary test fixtures. The original no-`from` case disclosed the test-only source sentinel on 8.4.49. Fresh whole-package review found the supplied-`from` test incorrectly built a nonexistent absolute path; corrected it to `../outside.map`. Both disclosure tests then failed on 8.4.49 while the normal declaration-transform/generated-map test passed. Restored 8.5.30: all three pass. Temporary fixtures are removed after each case. No real private source files are read or printed.

The exact override and lock scope were reviewed with no other actionable findings. No re-review was requested.

## Audit

Full tree: **62 → 61** findings (46 high, 15 moderate, 0 critical). Omit-dev tree: **39 → 38** (23 high, 15 moderate, 0 critical). The PostCSS advisory is absent. Parent packages still have inherited findings through other roots; SDK/RN/Jest migrations and no-patch paths remain open. Omit-dev includes Expo build tooling and does not describe mobile runtime exposure. [Snapshot](audit-summary.json).

## Verification boundary

Clean `npm ci` succeeded. Final verification: **77 suites / 760 tests passed**, types, lint, formatting, data/ledger validation and deterministic content-review inventory passed. Production Hermes JS exports succeeded for iOS (6.53 MB) and Android (6.54 MB). Initial export after reinstall reported a missing URL-parser file that exists on disk; resetting only this worktree's Watchman root and clearing Metro addresses the stale file inventory, without a product-code workaround. This patch concerns build tooling, not native audio/notification or signed-binary acceptance.
