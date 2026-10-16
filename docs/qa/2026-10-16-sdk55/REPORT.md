# SDK 55 incremental migration — October 16, 2026

Scope: B01.8-C2b, base `fde0735`. Expo 55.0.31, React 19.2, RN 0.83.10, coordinated Expo 55 modules, matching Expo Jest preset55.0.22, types and lint config. Jest 29 stays supported by this preset. No canary, forced downgrade, disabled tests or peer-dependency bypass.

## Changes and compatibility

Used [Expo's incremental upgrade workflow](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) and [SDK 55 release notes](https://expo.dev/changelog/sdk-55). Dynamic config required explicit sharing-plugin addition; its incoming-sharing defaults remain disabled. Existing audio permission controls remain profile-gated. `expo install --check` reports up to date.

Runtime policy now uses **native fingerprints**, preventing an SDK change from sharing an OTA runtime merely because the marketing version stayed1.0.0. Two configuration regressions failed with appVersion, then passed with fingerprint. No OTA, signed binary or store release was published. The stale Metro54 PostCSS override is removed; Metro55 resolves patched8.5.30 and all three source-map security/normal-transform tests pass.

No learning storage keys/schema/content changed. Existing backups, queued sessions and mission/event fixtures remain covered. All 1,392 cards still await current qualified acceptance.

## Final automated checks

Clean `npm ci` succeeded. **79 suites /766 tests passed**, plus **16 timezone integration cases**. TypeScript, lint, formatting, data/ledger validation and deterministic content-review inventory passed. Both native projects generated. Production Hermes JS exports passed for iOS and Android. Native production introspection omits iOS microphone usage; generated Android manifest explicitly removes RECORD_AUDIO and FOREGROUND_SERVICE_MICROPHONE. Development includes the specific local-recording usage string.

Audit: **61 →57** full-tree findings (45 high,12 moderate,0 critical). Omit-dev counts are in the [snapshot](audit-summary.json). These include inherited/tooling paths, not a measured runtime exploit count. SDK56/57/58 and remaining no-patch/Jest paths stay open; SDK 55 alone is not security-clean.

## Native compilation and environment

Xcode27.0 /27A266a, CocoaPods1.16.2, iPhone16Pro simulator/iOS26.0, dedicated clone UUID `6E0CD6D5-B769-426C-9B98-6984350BA622`. Original SDK 54 simulator retained. Official Expo API provided Expo Go 55.0.34; that host fails the aligned Expo Modules Core development-logger `addListener` API in this environment. No runtime shim was added. The app's own exact native binary compiled and ran successfully.

CNG generated development iOS and installed 107 pods. Verified build command:

```sh
SENTRY_DISABLE_AUTO_UPLOAD=true xcodebuild \
  -workspace ios/ColombianSpanish.xcworkspace -scheme ColombianSpanish \
  -configuration Debug -sdk iphonesimulator \
  -destination id=6E0CD6D5-B769-426C-9B98-6984350BA622 \
  -derivedDataPath /tmp/colombian-sdk55-build \
  CODE_SIGNING_ALLOWED=NO IPHONEOS_DEPLOYMENT_TARGET=15.1 build
```

Xcode27 initially rejected older resource-pod minima 11/12/13.4; command-line15.1 uses the app's supported minimum. Sentry's script requires literal `true`, not 1; the initial source-map step failed without an organization, then succeeded with upload explicitly disabled. The ignored/generated debug AppDelegate sets `RCTBundleURLProvider.sharedSettings().jsLocation` to127.0.0.1:8098, avoiding another project's occupied8081. No other project's server was changed. Node's default localhost binding was IPv6-only while the manifest requested127.0.0.1; child-process `NODE_OPTIONS=--dns-result-order=ipv4first` bound the dedicated IPv4 loopback server. These are local development setup details, not production code workarounds.

Binary Info.plist reports version 1.0.0 /build 1.0.0. The pre-existing Settings label still saysv2.0.0/build42 and is tracked separately for correction. Unsigned notifications emit a missing-keychain-entitlement registration warning; no signed push/remote registration pass is inferred. Android generation warns that expo-system-ui is needed for native userInterfaceStyle support; actual Android appearance/runtime remains open.

## Native flow evidence

- Spanish onboarding Business/Paisa/goal5; native card playback request and Stop complete without an audio error. After explicit reveal and one Good grade, cold restart retains daily1/5, new allowance9 and the exact9-card Business queue at `gerente`. [Resumed screen](native-resumed-study.png). Audibility/intelligibility is not established.
- With the user's explicit local-test approval: microphone prompt displays the exact development usage text. OS-prompt backgrounding safely cancels pending capture; next explicit Record starts normally. Manual Stop yields a3.8s/101KB take; replay starts, Stop returns Ready and Delete clears it. [Local take](native-local-take.png).
- Native automatic limit yields30.0s/422KB and Ready to replay, exercising the prior duration-reset fix. [Timeout](native-auto-stop.png). Delete removes it. Back during another short recording stops/discards and returns Home. Read-only owned-app filesystem checks find **0 m4a files** after cleanup. Dailycount1/newCount1 and learningevents1 remain unchanged by voice. No audio uploaded or retained in QA artifacts; microphone permission revoked afterward.
- Full-state file export saves to local **On My iPhone** through the native share/Files UI. Import preview reports47 decks/1392 cards/1 observation and supplemental preferences/state. [Preview](native-backup-preview.png). Restored this simulator's own QA snapshot, acknowledged restart and cold launched with daily1/5, saved Business preferences and new allowance9 intact. This is ordinary restore acceptance, not an interrupted-restore pass.

## Outstanding boundaries

Fresh whole-package review found no actionable findings or merge blockers and independently checked six config tests, dependency compatibility, React/renderer alignment and PostCSS resolution. Merged/pushed `5a1693a`; [CI38889781746](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38889781746) passed all quality/content and platform project-generation/JS-bundle jobs. No Android emulator/hardware, signed release, physical routes, actual audio quality, weak-network/low-storage, native OS interruption suite or live timezone-switch pass is claimed. Android SDK license authorization remains separate. Human editorial/rights/provider decisions remain open.

The later B12.1-M follow-up corrects the Settings placeholder noted above; see the [metadata report](../2026-10-16-native-build-metadata/REPORT.md).
