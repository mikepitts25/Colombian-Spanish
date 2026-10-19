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
