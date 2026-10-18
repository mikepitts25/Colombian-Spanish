# Classic and Barrio Theme Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the current Classic theme as default and let learners explicitly choose Barrio with remembered System/Light/Dark appearance, without losing learning state.

**Architecture:** One stable theme provider resolves a saved identity/appearance pair into typed tokens. A recoverable editor saves that pair atomically through existing preferences; all routes consume the resolved theme without screen/provider remounts. Classic retains existing paint, icons and composition; Barrio is optional.

**Tech Stack:** Existing TypeScript, React Native/Expo57, React Navigation7, AsyncStorage durable coordinator, Jest/testing-library and owned iOS simulators; no new runtime dependency.

**Spec:** [Approved Barrio foundation spec, including owner’s Classic-preservation requirement](../specs/2026-10-18-barrio-foundation-design.md).

**Status:** Owner approved this plan and Native inline execution on2026-10-18. Implementation is in progress on the isolated branch; task completion is tracked in the plan-specific execution ledger until final verification.

## Global Constraints

- “Existing and fresh installations default to Classic; installing this feature must not automatically replace the current look.”
- “Classic is available permanently in the picker and resolves to dark regardless of OS appearance.”
- “Retain the saved Barrio appearance preference when Classic is selected.”
- “One Save commits the identity and appearance draft together; Cancel changes neither.”
- “Neither switching mode nor an OS appearance update may key/remount navigation, DeckProvider, language provider or entire learning screens.”
- “No remote asset, font, service, paid account or new package is required by the foundation.”
- “Internal commits may stage work; main must not ship a mixed-theme partial migration.”
- “Do not commit generated ios/ output or leave contradictory appearance values.”
- Keep current four tabs, routes, content-release gates, scheduler and exact recovery/grade identity; Home redesign follows as a Barrio-only bundle. Skip security B01.8-C2g; do not accept Android agreements or change external accounts.

## Review Focus

1. Legacy/partial preferences must not opt existing users into Barrio; Task1 pins defaults and invalid inputs.
2. A recoverable appearance save that fails after durable journaling must not falsely apply or erase another preference; Task2 pins failure/retry/concurrency.
3. Live identity/OS changes during a held grade, editor save or response draft must preserve controllers, exact attempts and credit; Tasks3–5 pin those boundaries.
4. Literal colors, icon choices and native chrome can silently change Classic or leak its dark ink into Barrio light; Tasks1/4 pin source dispositions and Classic baseline, Task6 checks native chrome.
5. Preference-load failure or a stale async load must not seed over recoverable state or override a later selection; Task2 pins bootstrap ordering/cancellation and Task6 checks cold recovery.

## File map and shared interfaces

- Create `src/utils/themePreference.ts`: pure `ThemeId = 'classic' | 'barrio'`, `AppearanceMode = 'system' | 'light' | 'dark'`, `ThemeSelection = { themeId: ThemeId; appearanceMode: AppearanceMode }`, and `normalizeThemeSelection(value: unknown): ThemeSelection`. Unknown/missing fields independently resolve to Classic/System.
- Create `src/styles/classicTheme.ts`: preserve existing `theme.ts` color/elevation values and original decorative constants, including formerly inline colors captured by the audit. Shared metrics stay in `theme.ts`.
- Create `src/styles/appTheme.ts`: `AppTheme` with `id`, resolved `appearance: 'light' | 'dark'`, `colors`, `elevation`, `iconStyle: 'emoji' | 'line'`; `ThemeColors` retains existing color/gradient keys and adds explicit on-action/focus/disabled/role variants needed by the consumer audit. `resolveAppTheme(selection: ThemeSelection, system: 'light' | 'dark' | null | undefined): AppTheme` returns stable Classic/Barrio-light/Barrio-dark objects. The Barrio palette comes from the approved palette artifact; role additions need audited pair evidence.
- Create `src/context/ThemeContext.tsx`: stable `ThemeProvider({ children })`; `useAppTheme(): AppTheme`; `useThemeSelection(): { selection: ThemeSelection; applySelection: (next: ThemeSelection) => void }`; and `useThemedStyles<T>(factory: (theme: AppTheme) => T): T`. Read-only theme hooks default to stable Classic outside a provider for existing isolated component tests; the selection/mutation hook requires a provider. Root integration tests prove the production provider is present.
- Create `src/components/ThemeBootstrap.tsx`: preference hydration after StorageGate, loading/read-failure/retry before mounting normal providers/navigation. It uses `getPrefs()` and applies only the current successful read; unmounted/stale requests cannot apply.
- Create `src/screens/ThemeSettingsScreen.tsx`: draft pair, Save/Cancel, pending immutable request and translated Retry; no optimistic paint. Add route `ThemeSettings` and Settings entry.
- Create `src/components/ThemeIcon.tsx`: fixed-size original monoline tab/action glyphs using existing native primitives/local assets; Classic keeps current emoji rendering. Preserve labels/selected semantics and two-row large-text layout.
- Modify `src/storage/prefs.ts`, `src/storage/portableState.ts`, `src/i18n/translations.ts`, `App.tsx`, `src/navigation/index.tsx`, `app.json` and the audited consumers listed in Tasks3/4. `ListeningScreen.tsx` delegates to MissionScreen and must be verified too.
- Create `docs/qa/2026-10-18-theme-picker/`: frozen Classic value fixture, all-source color-role disposition JSON, contrast calculations, runtime captures/reports and validation evidence. The capture base is `3271c798498bff00d45990a0713c4b9410285490`; no product source changed in the planning branch.

### Task 1: Freeze Classic and define typed selection/palette/storage contracts

**Files:** Create pure/theme modules above; modify `src/styles/theme.ts`, `src/storage/prefs.ts`, `src/storage/portableState.ts`; create `__tests__/utils/themePreference.test.ts`, `__tests__/styles/appTheme.test.ts`; extend `__tests__/storage/prefs.test.ts` and `__tests__/storage/portableBackup.test.ts`; capture Classic baseline JSON and representative native Home/tab/control screenshots under the QA folder.

**Interfaces:** Produces `ThemeSelection`, normalization, stable `resolveAppTheme`, normalized Prefs fields `themeId`/`appearanceMode`, and optional validated portable preference keys. Existing static exports remain temporarily Classic for internal staging, then are removed from product color consumers by Task4.

- [ ] **Step 1:** Capture the existing Classic color/elevation/decorative values from the named base before editing. On owned preflighted phone/tablet simulators using that unmodified base, capture representative Home/tabs and Settings/form controls; record source SHA, binary/runtime, language, text size and logical state hashes so Task6 compares paint/icons/composition under matched conditions. Do not grade or alter learning state, and restore any temporary UI preferences. Write independent expected resolver/persistence tests. Assertions include:

```ts
expect(normalizeThemeSelection({})).toEqual({ themeId: 'classic', appearanceMode: 'system' });
expect(normalizeThemeSelection({ themeId: 'unknown', appearanceMode: 'light' })).toEqual({
  themeId: 'classic',
  appearanceMode: 'light',
});
expect(resolveAppTheme({ themeId: 'classic', appearanceMode: 'light' }, 'light').appearance).toBe(
  'dark',
);
expect(resolveAppTheme({ themeId: 'barrio', appearanceMode: 'system' }, null).appearance).toBe(
  'light',
);
```

Add cases for each identity/appearance/OS combination, stable object identity, original Classic values, old v3/legacy import, valid pair export/restore, invalid imported identity or appearance with zero writes, and concurrent unrelated preference patches. Pin both fields in a single setPrefs patch and preserved remembered appearance when saving Classic.

- [ ] **Step 2:** Run `npm test -- --runInBand --watchman=false --runTestsByPath __tests__/utils/themePreference.test.ts __tests__/styles/appTheme.test.ts __tests__/storage/prefs.test.ts __tests__/storage/portableBackup.test.ts`. Expected: new contract tests fail before implementation.
- [ ] **Step 3:** Implement the named pure APIs, palette roles and optional portable allowlist validation. Normalize local reads without auto-writing; do not silently normalize invalid raw backups for export. Preserve all existing metrics and Classic values. Record that older app versions may reject the new backup keys.
- [ ] **Step 4:** Rerun Step2 plus `npm run typecheck`. Expected: focused contracts pass and typecheck exits0. Any existing test fixture requiring required Prefs fields must use actual defaults rather than disabling type checks.
- [ ] **Step 5:** Commit only the contract, fixture and meaningful regressions: `feat: preserve Classic and define selectable Barrio themes`.

### Task 2: Stable provider, bootstrap and recoverable theme editor

**Files:** Create ThemeContext/ThemeBootstrap/ThemeSettingsScreen; modify App.tsx, navigation, SettingsScreen, ErrorBoundary, StorageGate, translations and app.json. Create `__tests__/context/ThemeContext.test.tsx`, `__tests__/components/ThemeBootstrap.test.tsx`, `__tests__/screens/ThemeSettingsScreen.test.tsx`; extend SettingsScreen/StorageGate tests.

**Interfaces:** Consumes Task1 APIs/Prefs. Produces the hooks and `ThemeSettings` route from the file map. `applySelection` changes only applied in-memory selection; persistence stays in the editor's immutable transaction intent. Bootstrap uses this same function after recovered preference read.

- [ ] **Step 1:** Write tests for Classic default; live OS changes affecting Barrio/System only; Classic→Barrio→Classic preserving remembered appearance; draft/Cancel with no paint/write; both-field Save; held/rejected save and Retry using the exact pair; journal recovery followed by authoritative reread; concurrent speech-rate/language update retained; disabled conflicting actions/native navigation while pending. Assert UI labels and applied palette, not only setter calls. For bootstrap, reject a real read, assert children never mount and records remain exact, retry successfully once, and assert late/unmounted read cannot replace a later selection. Count child mount/unmount across live changes.
- [ ] **Step 2:** Run `npm test -- --runInBand --watchman=false --runTestsByPath __tests__/context/ThemeContext.test.tsx __tests__/components/ThemeBootstrap.test.tsx __tests__/screens/ThemeSettingsScreen.test.tsx __tests__/screens/SettingsScreen.test.tsx __tests__/components/StorageGate.test.tsx`. Expected: added behavior fails before implementation.
- [ ] **Step 3:** Implement stable provider and memoized style hook; hydrate inside recovered StorageGate before navigation/data providers mount. Keep an independent catastrophic fallback outside provider reliance. Implement scrollable bilingual Theme editor: Classic/current and Barrio; Barrio-only appearance choices; Save-to-apply and retained retry. Configure automatic native appearance, root/navigation/status bar colors; temporary static route consumers remain Classic until Tasks3/4.
- [ ] **Step 4:** Rerun Step2 and `npm run typecheck`. Expected: all named tests pass, no child remount across a selection change, no preference loss and no optimistic save success.
- [ ] **Step 5:** Commit `feat: add recoverable Classic and Barrio theme picker`.

### Task 3: Shared controls, forms and core navigation migrate together

**Files:** ThemeIcon; components AudioButton, ConjugationPanel, ErrorBoundary, Flashcard, MissionAudio, MissionFollowUp, ProgressBar, StorageGate, Tag; navigation; screens AddCard, AudioPreferences, DailyGoal, LearningPreferences, ManageDecks, Notifications, Onboarding, Settings. Extend their existing tests and create `__tests__/components/ThemeIcon.test.tsx` and `__tests__/navigation/themeNavigation.test.tsx`.

**Interfaces:** Consumes Task2 theme/style hooks. Every control renders using AppTheme roles; dynamic factories retain existing metrics. Classic visual constants remain exact; Barrio uses reviewed semantic states/monoline icons. No screen key depends on theme identity or appearance.

- [ ] **Step 1:** Add focused behavioral regressions in existing Flashcard/AddCard/ManageDecks save fixtures: reveal active face or type a draft, hold a real save, switch applied identity/appearance via an external provider probe, assert same face/draft/intent and one save after release. Verify tab names/selected state/48-point minima and unchanged Classic emoji vs Barrio glyphs, including live maximum font. Add representative pressed/disabled state color assertions against semantic roles, not generated snapshots of implementation.
- [ ] **Step 2:** Run `npm test -- --runInBand --watchman=false --testPathPattern='Flashcard|AudioButton|ThemeIcon|themeNavigation|AddCardScreen|ManageDecksScreen|DailyGoalScreen|AudioPreferencesScreen|LearningPreferencesScreen|NotificationsScreen|Onboarding|SettingsScreen|StorageGate'`. Expected: new repaint/retention requirements fail against static consumers.
- [ ] **Step 3:** Replace static color captures with memoized theme factories, including per-render pressed/disabled controls and native header options. Preserve Classic inline colors via explicit decorative/semantic roles; do not globally substitute hex values. Keep native text-remeasurement keys dependent on font scale only, controllers above those keys, and input keyboardAppearance resolved to selected theme.
- [ ] **Step 4:** Rerun Step2 and `npm run typecheck`. Expected: repaint and retained-state regressions pass; existing pending-save/navigation behavior remains green.
- [ ] **Step 5:** Commit `refactor: theme shared controls and settings without remounts`.

### Task 4: Remaining activities and color audit close the route migration

**Files:** Screens Study, Home, Progress, Review, DifficultWords, Quiz, Mission, VoicePractice, DailyPlan, Explore, Flagged, Phrasebook, Phrases; delegated Listening; associated existing tests. Create `scripts/audit-theme-colors.js`, `docs/qa/2026-10-18-theme-picker/color-roles.json` and `__tests__/styles/themeConsumerAudit.test.ts`.

**Interfaces:** Consumes AppTheme/hooks; produces an auditable zero-static-color-consumer migration and role/contrast report. Audit entries identify path, occurrence/context, Classic value, Barrio role/value, actual background and disposition (themed/meaningful-art/native/transitional exception). A spacing-only import is not a color violation.

- [ ] **Step 1:** Extend StudyLifecycleIntegration with external theme toggles during held grade/checkpoint and recovered Retry: same exact remaining queue, one event/new credit, no controller remount. Add MissionScreen response-draft/pending-command retention and ReviewScreen editor-pending save regressions. Home/Progress representative Classic render expectations preserve existing counters/routes/composition; Barrio changes paint only in this foundation. Add audit tests that detect a deliberately inserted static colors import and an unclassified literal occurrence.
- [ ] **Step 2:** Run `npm test -- --runInBand --watchman=false --testPathPattern='StudyLifecycleIntegration|MissionScreen|ReviewScreen|HomeScreen|ProgressScreen|themeConsumerAudit'`. Expected: new repaint/audit requirements fail before migration.
- [ ] **Step 3:** Migrate the remaining consumers and literal roles. Classic flags/accents/gradients/icons keep original values; Barrio semantic text/actions use the approved roles. Charts keep meaning and readable labels. Audit src plus App.tsx, not only the historical31-consumer list. Classify every encountered literal, including alpha/shadow/media colors. The script must report source drift/unclassified usage and actual composited contrast, with explicit Classic legacy exceptions rather than claiming universal conformance. Remove product static colors imports; keep common metric imports legal.
- [ ] **Step 4:** Rerun Step2, `node scripts/audit-theme-colors.js` and `npm run typecheck`. Expected: tests pass; audit has no unclassified or static theme consumers; all new Barrio text/boundary pairs meet4.5/3 targets, with exact exceptions reported. Temporary injected audit mutations are reverted.
- [ ] **Step 5:** Commit `refactor: apply selected theme across learning activities`.

### Task 5: Integrated retention, recovery and backward-compatibility verification

**Files:** Extend the new context/bootstrap/editor tests plus existing StudyLifecycleIntegration, StudyEditorIntegration, DailyPlanLifecycle, MissionScreen, ReviewScreen, portableBackup and prefs tests. Fix only demonstrated implementation failures in the owning modules.

**Interfaces:** Consumes the complete migrated runtime from Tasks1–4; produces integrated preservation evidence rather than a new subsystem.

- [ ] **Step 1:** Add any cross-boundary gaps not established in the preceding tests: Classic/Barrio switch while grade and unrelated editor mutation serialize; theme save interrupted after journal persistence then restart; full-state backup restore returning a prior identity; live OS change while a Barrio/System save is pending. Assert all unrelated portable fields exact and event/attempt identities unchanged. Pin invalid partial local preference normalization without writes and rejected invalid imports without losing valid data. Use real provider/storage/coordinator with controlled boundaries, not mocked success callbacks.
- [ ] **Step 2:** Run `npm run test:fixtures` and the new context/bootstrap/editor files from Task2. Expected: all requirements pass, or the newly exposed defect fails before its bounded correction. Do not change acceptance to fit an easier passing case.
- [ ] **Step 3:** Run `npm test -- --runInBand --watchman=false`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run validate:data`, `npm run test:calendar` and `node scripts/audit-theme-colors.js`. Expected: all commands exit0, with every suite/test count and any existing content-release gates recorded accurately. Do not release unreviewed content to make a build pass.
- [ ] **Step 4:** Commit verified integration regressions and any demonstrated fixes: `test: verify theme switching preserves recovery and learning state`.

### Task 6: Rebuild iOS, verify both identities, review and merge

**Files:** QA folder reports/screenshots/preflights/state collectors/verifier and MASTER_PLAN.md. Native generated output remains untracked. Any observed product fix returns to its owning task's failing regression and required checks.

**Interfaces:** Consumes completed runtime and approved simulator preflight workflow; produces bounded native evidence and actual merged/pushed state. Android/signed/physical gaps remain explicit.

- [ ] **Step 1:** Use an isolated checkout/build context so the current normal Metro worktree remains intact. Capture `npx expo config --type public` and `xcodebuild -version`; regenerate with `npx expo prebuild --platform ios --no-install`, run the existing CocoaPods dependency installation in that generated project if regeneration requires it (without changing account/signing settings), then build the generated workspace using `xcodebuild -workspace ios/ColombianSpanish.xcworkspace -scheme ColombianSpanish -configuration Debug -sdk iphonesimulator -derivedDataPath /tmp/colombian-theme-picker-build CODE_SIGNING_ALLOWED=NO build`. If generated workspace/scheme names differ, inspect them with `xcodebuild -list` and record the actual names instead of silently failing or inventing success. Expected: config automatic, resulting Info.plist has no forced-dark conflict, development simulator binary builds. Use already available dependencies; no license/account action.
- [ ] **Step 2:** Preserve source data. Prefer a fresh named QA simulator created and installed from that binary; do not clone known aliases. Before/after first launch run `PYTHONDONTWRITEBYTECODE=1 python3 scripts/simulator_isolation.py EXPLICIT-UUID`. Import a reversible QA fixture only through supported app UI; keep baseline backup/hash evidence. All UI actions use CUA. Expected: own container and normal startup, Classic default without forced opt-in.
- [ ] **Step 3:** Capture unchanged Classic Home/tabs/control representatives, choose Barrio/Light with Save, then Dark/System, change native OS appearance, and return to Classic. Verify stored identity/remembered Barrio appearance, cold restart and bilingual labels. Compare Classic with the captured pre-migration values/screenshots; no unexplained icon/color/composition change. Expected: real transitions and correct native status/header/modal/keyboard; document native launch-to-saved-selection transition.
- [ ] **Step 4:** On preflighted phone/tablet check default/live maximum text; draft in a form and written response, active Study face/exact queue, restored backup, quiz/Progress/Phrases/Difficult/Flagged, onboarding and preview routes. Real pending-failure behavior needs an isolated fault fixture/harness if native coverage is claimed. Keep all source logical records unchanged except exact intentional theme preferences and explicitly recorded reversible QA activity. Existing keyboard touch gaps remain open unless a changed input route/diagnostic establishes them; do not repeat known failed gestures.
- [ ] **Step 5:** Run passive evidence verifiers, isolation11 tests, appropriate focused/full checks after any new product fix and required CI. Update B08.2 with precise AI/SIM results; keep B08.3 (later Barrio Home), Android, signed, editorial and physical/assistive acceptance separate. Obtain one fresh whole-branch review, address Critical/Important findings with regressions, then merge/push main under standing authorization and confirm clean local/remote matching SHAs. Do not mark complete from a build or Home screenshots alone.

## Plan self-review and handoff

All spec sections map to Tasks1–6: Classic/default/optional identity and portable contract→1; provider/startup/editor/errors/native configuration→2; control/large-text/icon behavior→3; every route/literal/contrast→4; learning/recovery invariants and complete software checks→5; rebuilt native and publication evidence→6. The five Review Focus cases have tests in their named tasks. Shared function/type names in this plan are the file-map contracts; do not introduce alternate names across tasks.

The current theme remains the default throughout. There is no deletion/deprecation step for Classic. Home composition is a later Barrio-only change, and user visual acceptance does not become an AI checkbox.

Recommended execution: **Native** (inline), because palette, preference/provider and31-consumer migration share interfaces and must land together; one fresh whole-branch review remains required. The owner selected Native execution. Continue all tasks inline, then obtain one independent whole-branch review before merging.
