# Expo SDK 57 migration

Base: SDK 55 `caaf612`. SDK 56 was a tested intermediate checkpoint; its documented Hermes regression makes it unsuitable as this package's final target. No OTA or store release was published.

## Verification

- Clean install and supported dependency alignment: Expo 57.0.30, React 19.2.3, RN 0.86.3, Reanimated 4.5.1, Worklets 0.10.1, Jest Expo 57, native Jest preset 0.86.3 and TypeScript 6.0.3. React and test-renderer versions match; only one native Jest preset resolves.
- Final checks: **79 suites / 771 tests**, 16 calendar cases across four zones, TypeScript, lint, formatting and content checks passed. Both final platform production JS exports passed. Inventory remains 47 decks / 1,392 cards and audio entries; all 1,392 editorial acceptances remain required.
- Both native projects generated. Production introspection omits microphone usage and emits removal directives for Android recording/service permissions. Fingerprint runtime and bundle IDs remain stable. The SDK template now targets iOS 16.4 or later.
- Xcode 27 scene support: config regression observed RED then GREEN; generated scene manifest uses `EXExpoAppSceneDelegate`, and AppDelegate conforms to `ExpoReactNativeFactoryProvider`. Unsigned arm64 iOS build succeeded with 110 installed pods. Only the ignored local AppDelegate points to QA Metro port 8098; that test-server setting is not committed.
- Complete-peer audits: **64 full findings** (51 high / 13 moderate), **41 omit-dev** (28 high / 13 moderate), zero critical. The earlier 59/23 snapshot omitted a required peer graph under an inherited global npm setting and is superseded. Historical SDK 55 counts were 57/34; no dependency-security improvement is claimed from this migration. Exact final snapshots accompany this report.

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

Both unsigned simulators emit the known notifications keychain entitlement warning. Signed notification registration/delivery, Android native compilation/emulator, physical audio quality/routes, battery/performance, signed release QA and editorial acceptance remain open. Migration `3df2a11` and peer-install correction `ef5833d` are merged/pushed to main. [CI38955215294](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38955215294) passed all four quality/content and iOS/Android project-generation/JS-bundle jobs.

## Sources

[SDK 56](https://expo.dev/changelog/sdk-56), [SDK 57 regression fixes](https://expo.dev/changelog/sdk-57), [SDK 57 Xcode 27 scene support](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md), [React compiler diagnostics](https://react.dev/reference/eslint-plugin-react-hooks).

## CI install correction

The first pushed migration, `3df2a11`, failed [CI38954379577](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38954379577) at npm ci: the lock lacked `@react-native/metro-config@0.86.3` and its Babel dependencies. Investigation found the Mac's inherited global `legacy-peer-deps=true`; isolated npm-version checks also inherited that setting and did not reproduce the runner's normal resolution. Worklets 0.10.1 declares Metro config as a required peer. The correction declares that build dependency explicitly at RN's exact version, regenerates the complete lock, and commits a project `.npmrc` with `legacy-peer-deps=false`, leaving the user's global setting untouched. Strict clean installs, npm ls, all 771 tests, calendar16, static/content checks and both platform exports passed. Installation also passed under the runner’s exact Node22.23.3/npm10.9.9 with normal peer checks. Merged main repeated a strict install and all771 tests. iOS27 launched against the corrected complete graph and retained1/5 plus nine new cards available. No CI check was removed or bypassed.

The main checkout's generated native projects and 110 pods were refreshed to SDK 57. Its ignored local AppDelegate uses the existing project QA Metro on 8098, and ignored `.xcode.env.local` disables source-map upload for the unconfigured local unsigned build. The compiled/tested simulator binary remains the worktree build described above.
