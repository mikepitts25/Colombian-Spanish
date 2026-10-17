# Development and verification

The current roadmap is [MASTER_PLAN.md](MASTER_PLAN.md). Use this guide for repeatable local/CI checks. Passing these commands does not establish native compilation, physical-device behavior, or editorial acceptance.

## Install and automated checks

Use the Node version specified by CI (22). Local evidence from October 14, 2026 used Node 24.5.0; GitHub Actions verifies the locked dependencies on Node 22 separately.

```sh
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand
npm run validate:data
npm run content:review
```

`validate:data` loads only the indexed decks, rejects duplicate/empty IDs and missing teaching text, checks manifest coverage and MP3 headers, and checks configured PNG headers/dimensions. This is structural validation, not full audio decoding or linguistic review. Expo asset processing/bundling is a separate check.

`content:review` regenerates `docs/editorial/content-review.json` deterministically. Its metadata does not establish that a human reviewed text or audio. See [editorial instructions](docs/editorial/README.md).

## Native project generation and production JS bundles

Run these in a clean checkout/worktree. Native projects are generated and ignored; no signing/account is needed for these checks.

```sh
CI=1 npx expo prebuild --platform all --no-install
CI=1 npx expo export --platform all --output-dir dist/validation
```

CI runs project generation and export for iOS and Android independently and retains the production JS bundle artifacts for seven days. This checks Expo configuration, assets, Metro resolution, and production JavaScript/Hermes output. It does **not** compile Swift/Kotlin, link native modules, sign, or execute on hardware. The CI summary reports actual job outcomes rather than a placeholder build success.

For native compilation use a development build from Xcode/Gradle or `npx expo run:ios` / `npx expo run:android` with the required platform SDKs. Test the signed release candidate separately under B12 before shipping.

## Dedicated iOS simulator

Never erase or reuse unrelated project simulators. Inspect available runtimes and create/select a dedicated device:

```sh
xcrun simctl list devices available
xcrun simctl list runtimes
xcrun simctl create 'Colombian Spanish QA' com.apple.CoreSimulator.SimDeviceType.iPhone-16-Pro com.apple.CoreSimulator.SimRuntime.iOS-26-0
```

The device created for this batch is `DA623884-B6E4-4E09-8945-EC74CC888A61`. That ID/runtime is local evidence, not portable configuration. Substitute the ID and installed runtime on another machine.

```sh
xcrun simctl boot DA623884-B6E4-4E09-8945-EC74CC888A61
xcrun simctl bootstatus DA623884-B6E4-4E09-8945-EC74CC888A61 -b
npx expo start --localhost --port 8094
```

Use the app's native development build for SDK 55 checks. The official Expo Go 55.0.34 client currently fails the installed Expo Modules Core development-logger API check in this environment; do not patch around that mismatch or infer native acceptance from Expo Go. A compatible host can use the dedicated server URL. Keep the Metro terminal running. A first-open confirmation may need interaction; do not claim a launched app from an unaccepted prompt.

### Xcode 27: use Device Hub

Xcode 27 uses **Device Hub** for simulator interaction. The absence of the older `Simulator.app` is not by itself an installation fault. Open **Xcode → Open Developer Tool → Device Hub**, select **Colombian Spanish QA**, and interact with the device display. On this installation the app is `/Applications/Xcode.app/Contents/Applications/DeviceHub.app`. `simctl` commands and the dedicated simulator ID above still apply. See [Apple's Device Hub documentation](https://developer.apple.com/documentation/xcode/device-hub).

The earlier October 14 setup diagnosis incorrectly treated the absent old app as a blocker. Device Hub successfully displayed the dedicated iOS 26.0 simulator and supported onboarding, study, phrases, Settings, and process-restart checks. See [iOS smoke evidence](docs/qa/2026-10-14-ios-smoke/REPORT.md).

If Metro reports missing files that exist after a clean install and Watchman reports recrawls, stop Metro, reset only this project's watch with `watchman watch-del <project-path>` then `watchman watch-project <project-path>`, and restart with `npx expo start --clear --localhost --port 8094`. Do not reset unrelated projects' watches.

With UI control available, verify and capture: onboarding → first study → Home → Quiz (including the insufficient-seen-words state) → Phrases → Settings/language → restart/resume. Exercise card grading and audio replay. Store evidence under a dated `docs/qa/` directory with app/build identity. Do not label an Expo Go smoke test as a signed native-release test.

### Reset and fixture safety

Use only the dedicated QA simulator for destructive fixture resets. Record which test data will be lost. Use fresh installation on that device for a fresh-user case; prepare data through real app interactions or a separately reviewed test harness for returning-user cases. Do not edit unrelated simulator containers or production device storage. Automated component/storage tests supply controlled fixtures without touching device data.

## Android environment

As of this batch, Android Studio is installed, but no Android SDK at the standard user location, `adb`, `emulator`, or `sdkmanager` was found. iOS tooling and Android production JS bundling do not establish emulator coverage.

Complete Android Studio's SDK setup with the appropriate account owner's acceptance of SDK agreements, or supply an existing licensed SDK path. Configure `ANDROID_HOME`, install the needed platform/build tools and emulator image, then verify `adb version` and `emulator -list-avds`. Create a dedicated Colombian Spanish AVD, run `npx expo run:android`, and follow the same screen/restart checklist. Record results and actual SDK/AVD versions before closing B01.5.

## Current evidence and known gaps

See [October 14 foundation report](docs/qa/2026-10-14-foundation/REPORT.md). The master checklist deliberately keeps native-editorial acceptance, full interactive simulator coverage, Android emulator coverage, physical-device QA, and release signing open until they have their own evidence.

## Calendar integration matrix

Run `npm run test:calendar` for daily progress, new allowance, streak and legacy-date fixtures in isolated Berlin, Bogotá, New York and Auckland Node processes. This changes only child-process `TZ`, not host clock/settings. Four checks per zone cover the actual 2026 short/long calendar-day lengths (Bogotá has no DST). The command fails if any zone suite fails and runs in CI. It does not replace live timezone-switch or native resume checks.

## SDK 55 local native simulator build

SDK 55 aligns React 19.2/RN 0.83.10 and Expo 55 modules. Update runtime compatibility uses native fingerprints, so changing the SDK cannot silently share an OTA runtime based only on app version. No OTA or store build is published by these commands.

Generate with `EAS_BUILD_PROFILE=development npx expo prebuild --platform ios --no-install`, then `pod install --project-directory=ios`. Xcode27 rejects older resource-pod deployment minima, so the verified local build uses `IPHONEOS_DEPLOYMENT_TARGET=15.1 CODE_SIGNING_ALLOWED=NO` with xcodebuild. Set **`SENTRY_DISABLE_AUTO_UPLOAD=true`**, with the literal `true`, for local compilation without a configured upload project. `1` is not accepted by the current Sentry script.

A generated debug app defaults to Metro8081. If another project owns that port, point only the ignored/generated debug AppDelegate's `RCTBundleURLProvider.sharedSettings().jsLocation` to your dedicated local server before building; do not stop the other project. This local test used127.0.0.1:8098. On this host, `NODE_OPTIONS=--dns-result-order=ipv4first npx expo start --localhost --port 8098` binds the IPv4 address emitted in the manifest; default Node resolution bound only::1. This is a child-process flag, not a host network change.

Unsigned simulator builds can report missing-keychain-entitlement warnings from notifications. That is not a push-registration or signed-release pass. Production/preview microphone access remains blocked; development declares the explicit local recording purpose. Refer to the dated SDK 55 QA report for exact commands, build limits and verified flows.

### Repeatable learner fixtures

Run `npm run test:fixtures` for the fresh/returning, large-library, difficult-card, empty-filter, corruption, long-text and upgrade fixture catalog. The [coverage matrix](docs/qa/2026-10-18-learner-fixtures/REPORT.md) maps individual assertions and native evidence. All automated fixture writes use Jest’s mock storage; this command does not reset a simulator. The 10,000-card test checks correctness, not hardware performance or signed upgrade acceptance.
