# Android native build, first visible launch and automatic appearance fix

October20,2026; source main `03b080b`. This bundle completes the local compilation/first-visible-screen child B01.5-B1 and fixes the native appearance configuration in B01.5-C. **B01.5/B01.5-B remain open:** onboarding, study/grade/resume, practice, voice, files and live theme/OS appearance workflows have not passed on Android. All five broader QA packages remain open.

## Configuration defect and verification

The existing approved Classic/Barrio foundation config requests automatic native appearance. Android prebuild warned that `expo-system-ui` was missing and generated no corresponding resource. Both production/development native configuration tests [failed on the missing setting](appearance-red.txt). The SDK-matched `expo-system-ui ~57.0.4` dependency makes the [same two contracts pass](appearance-green.txt), and the actual generated [Android strings](generated-strings.xml) contain `expo_system_ui_user_interface_style=automatic`. The tests invoke the real Expo introspection command, covering the managed config-to-native contract. [Expo documents this Android requirement](https://docs.expo.dev/develop/user-interface/color-themes/).

Classic remains the default and permanent picker option. No provider, picker, Home or learning-flow code changed. This is native configuration verification, **not live Android System/Light/Dark switching acceptance**. Existing iOS screenshots were not replayed or represented as evidence for this newly linked binary; CI still checks iOS native generation/JS bundling, with compilation/candidate/device acceptance separate.

## Installed environment and actual native build

The [October20 tooling recheck](../ANDROID_TOOLCHAIN.md#october-20-installed-tooling-supersedes-the-setup-blocker) supersedes the old missing-SDK/agreement blocker. SDK/platform tools/emulator/API36 ARM64 image and an accepted SDK license already existed. Compatible build tools/NDK and transitive CMake were installed under that existing license without supplying any agreement response. No global shell profile or Java configuration changed.

A development Android project was generated with the existing profile-specific recording-permission policy. The actual ARM64 Debug APK [compiled successfully](build-result.txt): seven minutes, 473 executed tasks. Gradle used `--no-daemon --max-workers=2`, disabled parallel project execution and a 2GiB JVM heap. Native compiler subprocess concurrency is separate from the Gradle worker limit. The emulator remained off during compilation. APK SHA-256, toolchain, requested/effective minimum emulator RAM and evidence digests are in [metadata](verification.json). Build-tools35.0.0/NDK27.0.12077973/CMake3.22.1 were additionally installed by transitive native tasks after checking the existing SDK license. The app's main build reports build-tools36.0.0/NDK27.1.12297006.

## First visible app and remaining control limitation

A dedicated `Colombian_Spanish_QA` pixel6/API36 default ARM64 AVD was created; the unrelated PyQuest AVD was untouched. Both iOS and Android booted inventories were empty before starting it. The APK installed successfully. Standalone serial5560 could not be selected by the native UI-control tool. It was shut down before Studio started the same AVD embedded as serial5554; only one runtime ran at a time.

Android Studio's optional telemetry was declined and redundant initial SDK setup canceled. The generated owned project was opened in **Safe Mode**, using the existing SDK/JDK, without another Gradle build or trusting unrelated projects. Studio's older cloud-service warning is not an app/runtime failure; no sign-in, update or diagnostic report was submitted. Running Devices was filtered to “Colombian” before selection. Attempting to attach the already-running standalone instance produced an explicit already-running notice; restarting the sole own AVD through Studio supplied its embedded view.

Metro ran on the free default 8081 port. The [actual cold Activity launch](embedded-launch.txt) returned `Status: ok`; Metro bundled 3,297 modules. The [unmodified CUA capture](onboarding.jpg) shows the real Spanish Classic welcome, step 1/3, six reason choices and disabled Siguiente before any selection. That establishes **native compilation, install and visible first launch**, not completed onboarding or a usable full workflow.

After the Running Devices panel was floated, a coordinate action intended for the visible first reason instead focused Studio's main window and selected its project tree. The Android reason selection was not verified. A bounded attempt to return/dock the panel through the main-window control did not establish a working input route. No app defect, onboarding success, theme persistence, live system appearance or other Android flow is inferred. Future work needs a working docked/single-window or other supported native control route; do not repeat the floating-window coordinate attempt unchanged.

## Validation and cleanup

One full regression run was warranted by the native dependency change:117 suites/1,160 tests pass, with typecheck/lint/changed-file formatting and `expo install --check` also passing. The two added contracts account for the increase from 1,158 tests. This does not supply signed release or physical-device evidence.

Before shutdown, the explicitly verified own AVD reported the app PID 1895. It was stopped through official `adb -s emulator-5554 emu kill`; both device inventories were empty afterward. Both owned Metro instances were stopped, Studio was exited, and no Gradle build/daemon or emulator process remained. Device Hub/TextEdit stayed closed. Existing iOS app data and unrelated root files were untouched. Cached SDK/Gradle files remain on disk so future work can reuse them without another first build.
