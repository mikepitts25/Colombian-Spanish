# Expo SDK 57 migration

Base: SDK 55 `caaf612`. SDK 56 was a tested intermediate checkpoint; its documented Hermes regression makes it unsuitable as this package's final target. No OTA or store release was published.

## Verification

- Clean install and supported dependency alignment: Expo 57.0.30, React 19.2.3, RN 0.86.3, Reanimated 4.5.1, Worklets 0.10.1, Jest Expo 57, native Jest preset 0.86.3 and TypeScript 6.0.3. React and test-renderer versions match; only one native Jest preset resolves.
- Final checks: **79 suites / 771 tests**, 16 calendar cases across four zones, TypeScript, lint, formatting and content checks passed. Both final platform production JS exports passed. Inventory remains 47 decks / 1,392 cards and audio entries; all 1,392 editorial acceptances remain required.
- Both native projects generated. Production introspection omits microphone usage and emits removal directives for Android recording/service permissions. Fingerprint runtime and bundle IDs remain stable. The SDK template now targets iOS 16.4 or later.
- Xcode 27 scene support: config regression observed RED then GREEN; generated scene manifest uses `EXExpoAppSceneDelegate`, and AppDelegate conforms to `ExpoReactNativeFactoryProvider`. Unsigned arm64 iOS build succeeded with 110 installed pods. Only the ignored local AppDelegate points to QA Metro port 8098; that test-server setting is not committed.
- Audits: **59 full findings** (46 high / 13 moderate), **23 omit-dev** (15 high / 8 moderate), zero critical. SDK 55 baseline was 57 full / 34 omit-dev. Full-tree findings increased; this is not a clean audit. Exact snapshots accompany this report.

## Compatibility changes and review

RN absoluteFill API, supported native Jest preset, explicit TypeScript paths/types, Sentry's root config-plugins dependency and required sharing/status-bar/build-properties plugins were aligned. New compiler diagnostics prompted committed-prop refs in layout effects, lazy animation/clock initialization, real action/choice components, and state-based render decisions. Narrow native animation/gesture and external storage/timer/session exceptions are documented at their exact lines; no global rule disable or diagnostic baseline was added.

One fresh whole-package review found no actionable issues versus `caaf612`. Subsequent simulator testing caught a missing React key in mapped mission action components. A dedicated test failed before adding `key={option.id}` and passed afterward; final full tests and both exports include the fix. No re-review was requested.

## Native iOS 26 upgrade

Dedicated candidate `C2FC53CC-FE0C-42C0-B880-5839C1F51299` was cloned from the saved SDK 55 app. Before first launch, installation retained all ten storage values byte-for-byte and remapped its container correctly. The separate shutdown SDK 55 baseline remained unchanged.

- Home retained English, Business/Paisa preferences, daily goal 1/5 and nine remaining new cards. Study resumed the exact nine-card queue at gerente (1801); flip exposed manager. Explicit audio/Stop actions produced no audio exception; audibility is not established.
- Revoked microphone access remained denied. Authorized simulator permission grant enabled a 4.6-second / 106 KB take, Stop, replay, Stop and Delete. Automatic Stop produced a replayable 30.0-second / 419 KB take. Back during a third capture discarded it. Final cache inspection found **zero recording files**; microphone access was revoked again.
- Generated listening playback enabled answers and displayed its generated source; transcript reveal persisted without adding an assessed event.
- Full-state JSON export used the native share sheet → Save to Files → On My iPhone. Import preview showed 47 decks / 1,392 cards / one observation and app state. Restore app state succeeded; cold restart retained preferences, daily 1/5, nine-card queue and one learning event. Progress showed one self-rated recall and no invented checked listening/speaking evidence.
- A repeated denied-permission test opened iOS Settings. This simulator landed at the root Settings page; direct navigation to the app pane was not established.

## Native iOS 27 fresh install

Dedicated device `0E1EFA92-01A8-46F6-BAB7-1D20B9F91ED8` ran the same binary with scene support. Spanish onboarding selected travel, all regions and a five-card goal. Audio/Stop and flip worked; grading maleta once advanced to boleto with nine remaining. Cold restart showed 1/5 and nine new cards available; exact resume returned to boleto with nine remaining. No microphone request or recording was needed on this device.

Screenshots and `native-state-check.json` retain the observed evidence.

## Remaining boundaries

Both unsigned simulators emit the known notifications keychain entitlement warning. Signed notification registration/delivery, Android native compilation/emulator, physical audio quality/routes, battery/performance, signed release QA and editorial acceptance remain open. Merge/push and CI results will be recorded after integration.

## Sources

[SDK 56](https://expo.dev/changelog/sdk-56), [SDK 57 regression fixes](https://expo.dev/changelog/sdk-57), [SDK 57 Xcode 27 scene support](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md), [React compiler diagnostics](https://react.dev/reference/eslint-plugin-react-hooks).
