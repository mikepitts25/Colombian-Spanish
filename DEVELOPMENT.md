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

Install an SDK-54-compatible Expo Go from the official Expo source for development smoke testing, or use the app's native development build. Open `exp://127.0.0.1:8094` on the dedicated simulator for Expo Go. Keep the Metro terminal running. A first-open confirmation may need interaction; do not claim a launched app from an unaccepted prompt.

With UI control available, verify and capture: onboarding → first study → Home → Quiz (including the insufficient-seen-words state) → Phrases → Settings/language → restart/resume. Exercise card grading and audio replay. Store evidence under a dated `docs/qa/` directory with app/build identity. Do not label an Expo Go smoke test as a signed native-release test.

### Reset and fixture safety

Use only the dedicated QA simulator for destructive fixture resets. Record which test data will be lost. Use fresh installation on that device for a fresh-user case; prepare data through real app interactions or a separately reviewed test harness for returning-user cases. Do not edit unrelated simulator containers or production device storage. Automated component/storage tests supply controlled fixtures without touching device data.

## Android environment

As of this batch, Android Studio is installed, but no Android SDK at the standard user location, `adb`, `emulator`, or `sdkmanager` was found. iOS tooling and Android production JS bundling do not establish emulator coverage.

Complete Android Studio's SDK setup with the appropriate account owner's acceptance of SDK agreements, or supply an existing licensed SDK path. Configure `ANDROID_HOME`, install the needed platform/build tools and emulator image, then verify `adb version` and `emulator -list-avds`. Create a dedicated Colombian Spanish AVD, run `npx expo run:android`, and follow the same screen/restart checklist. Record results and actual SDK/AVD versions before closing B01.5.

## Current evidence and known gaps

See [October 14 foundation report](docs/qa/2026-10-14-foundation/REPORT.md). The master checklist deliberately keeps native-editorial acceptance, full interactive simulator coverage, Android emulator coverage, physical-device QA, and release signing open until they have their own evidence.
