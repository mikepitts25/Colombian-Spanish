# Navigation 7 migration — 2026-10-16

B01.8-C1 replaces the coordinated Navigation 6 packages with native 7.5.1, native-stack/bottom-tabs 7.21.0 and routers 7.6.5. The [official migration guide](https://reactnavigation.org/docs/upgrading-from-6.x/) requires Expo 52+/RN 0.72+/screens 4/TS 5; existing Expo 54/RN 0.81/screens 4.16/TS 5.9 satisfy those requirements. Published npm peer metadata also permits the installed React/safe-area versions. No forced transitive override or Expo downgrade was used.

Tool-to-tab actions explicitly target Root's Study/Home tab with pop semantics; return from Review reuses Manage Decks. This handles Navigation 7's changed nested/back behavior instead of adding compatibility flags or duplicate Root stacks. The stack header uses `headerBackButtonDisplayMode: minimal`. The dynamic navigator, existing custom tabs, authored mission gates and learning storage remain unchanged.

## Verification

- Quiz's Study CTA test failed against the old implicit nested target and passed after the explicit return migration. A real StackRouter regression preserves the existing Root key and removes the tool stack on return. It also passed the original Navigation 6 baseline, establishing expected compatibility rather than falsely claiming a pre-existing failure.
- Full tests: 71 suites / 726 tests passed. Types, lint, formatting, data/editorial validation and unchanged generated inventory passed. Initial full suite exposed one old Manage Decks expected navigation call, updated for explicit pop; subsequent full run passed. Existing Study tests retain their asynchronous act warning.
- Fresh whole-package review found no actionable findings. A clean lockfile install was performed. No native runtime dependency/version was changed beyond the JS navigation family and its JS transitive packages.
- `npm ls` resolves a coordinated 7.x tree without the Navigation 6 `query-string`/`decode-uri-component` chain. Full audit falls from 66 (47 high/19 moderate) to **62 (47 high/15 moderate)**; omit-dev falls from 43 to **39 (24 high/15 moderate)**, with zero critical in both. [Snapshot](audit-summary.json). These inherited counts do not establish exploitability or absence of vulnerabilities. Remaining Expo/React Native/Jest/no-patch roots remain B01.8-C2; omit-dev is not a mobile runtime bundle inventory.

## Native simulation

Dedicated iPhone 16 Pro / iOS 26 / Expo Go 54.0.7 (`121168CB-C271-4202-AC19-94F8DAE7B8B1`), restarted Metro with a cleared cache and cold-started the app:

- Home and named/selected tabs rendered. Quiz opened with a native back header; empty Paisa region offered Study now, which returned directly to Study.
- The existing Business resume restored eight remaining cards at gerente. Explicit pronunciation and Stop actions remained available; switching to Settings worked without a crash. No grading was performed.
- Settings opened Manage Decks; its explicit Home action returned to the Home tab. Opening the listening draft retained the prior assisted completion.

Dedicated iPad Pro 13-inch / iPadOS 26 / Expo Go 54.0.7 (`5EAE09E7-828A-4306-B727-E2BBB307C24C`), cold start: Home rendered, Quiz's empty-pool Study now returned to Study with the existing Travel resume, Home tab returned, and opening the text mission restored the original correct greeting feedback. The AX subtree was available again after this cold launch. No new learning observation was submitted.

Limits: these are Expo Go request/navigation/storage smoke checks, not signed native compilation, Android emulator/device, actual screen-reader, audio route or hardware acceptance. SDK license authorization remains pending for Android setup. CI project generation/production JS export evidence is recorded after push; the remaining dependency migration parent stays open.
