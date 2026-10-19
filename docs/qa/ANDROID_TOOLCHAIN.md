# Android tooling status

Inspected 2026-10-16 on this Mac. This is environment evidence, not Android app acceptance.

- `/Applications/Android Studio.app` is present.
- Its bundled JDK runs: `/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/java -version` reports OpenJDK 21.0.7.
- `/usr/libexec/java_home -V` finds no system-registered Java runtime. Use the bundled JDK explicitly instead of assuming Java is unavailable everywhere.
- `/Users/mike/Library/Android/sdk` and `/Users/mike/.android` are absent; `adb` / `sdkmanager` are not on PATH. No project Android emulator was found.
- The inspected data volume had about 203 GiB available. This is a point-in-time observation.

The [official SDK download page](https://developer.android.com/studio#command-tools) lists command-line tools and checksums. [sdkmanager documentation](https://developer.android.com/tools/sdkmanager) describes package management and license acceptance. A local SDK/emulator can be installed and a dedicated QA device created after the required SDK agreement is authorized. The pending owner question identifies that agreement; no SDK license was accepted and no package installed during this probe.

Next steps after authorization:

1. Obtain Mac ARM tools from the official source, verify its published SHA-256, and install into the user SDK directory. Keep downloads/toolchains outside this repository.
2. Use Android Studio's bundled JDK explicitly. Install supported platform tools, emulator and a matching ARM system image; record the exact versions and accepted license state.
3. Create a dedicated Colombian Spanish QA AVD, leaving unrelated devices untouched. Start it, verify boot/device identity, then install a compatible Expo Go or dedicated development client for this project's current Expo SDK 57.
4. Open the app from the managed worktree's Metro server. Verify onboarding, study/grade/resume, mission/listening, audio controls, backup provider/alerts and accessibility/layout in both UI languages, including restart.
5. Document actual results and failures, then complete native compilation and signed-candidate/physical Android checks separately. Existing CI Android project generation and JavaScript export do not close emulator/device rows.

No persistent shell profile or global Java configuration was modified. The toolchain/emulator work remains open under B01.5; this probe closes only B01.5-A.

## October 19 recheck

Read-only reinspection confirms Android Studio and its bundled OpenJDK21.0.7 remain present. The SDK directory, `.android` directory and SDK licenses directory are absent; `adb`, `sdkmanager` and `emulator` are still unavailable on PATH. Current package.json declares Expo `~57.0.30` and React Native `0.86.3`; the old setup text’s SDK54 reference above has been corrected to SDK57. No agreement was accepted, SDK downloaded, emulator created or global configuration changed. The existing authorization question remains pending. This is environment evidence, not Android runtime acceptance.

## October 20: installed tooling supersedes the setup blocker

The environment changed after the October19 inspection. This batch found the SDK, platform tools37.0.1, emulator37.2.12, API36 default ARM64 image and an existing `android-sdk-license` under `/Users/mike/Library/Android/sdk`. Android Studio's bundled OpenJDK21.0.7 remains the explicit build JDK. Tools are still not on the shell PATH; no global profile was changed.

The required build-tools36.0.0 and NDK27.1.12297006 were installed using sdkmanager with stdin closed (`/dev/null`) under that existing license. Gradle also installed transitive build-tools35.0.0 and NDK27.0.12077973 after checking the same existing SDK license. No license acceptance command or agreement response was supplied. The previous authorization question is therefore no longer a blocker to using this installed toolchain; any new agreement would remain an owner decision.

A dedicated `Colombian_Spanish_QA` AVD uses the existing API36 default ARM64 image and pixel6 profile, limited to two CPU cores and 2GiB RAM. The unrelated PyQuest AVD was not modified. Both iOS and Android inventories were empty before preparing it. Compilation runs before emulator startup to reduce load.

Native project generation exposed a real compatibility omission: Expo warns that Android ignores `userInterfaceStyle` without `expo-system-ui`. The approved automatic appearance configuration generated no corresponding Android resource. Two production/development contract tests reproduced that failure. Installing the SDK-matched `expo-system-ui ~57.0.4` makes both tests pass and generates `expo_system_ui_user_interface_style=automatic`. Classic remains the default; the picker/provider code is unchanged. See [Expo's color-theme requirements](https://docs.expo.dev/develop/user-interface/color-themes/).

This setup and configuration evidence does not establish emulator, signed-candidate or physical-device acceptance. Actual build/runtime results are recorded separately when available.
