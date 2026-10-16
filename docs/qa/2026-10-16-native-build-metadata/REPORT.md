# Native build metadata — October 16, 2026

Scope: B12.1-M, base `5a1693a`. Settings displays `expo-application` native version/build, with `expo-constants` StoreClient detection to identify Expo Go host values. Blank/null metadata is localized as unavailable. Removed the inactive store-rating action until a real destination exists. Both modules were already installed/autolinked transitively; now declared directly at the same Expo55-supported versions, with no module-version/native-code change.

Three new cases first failed against the placeholder, then passed: native values, English Expo Go host identity and Spanish missing/blank values. Existing bilingual label coverage now expects actual build values. All62 Settings tests pass. Full suite **79 suites /769 tests**, types/lint/format/data/ledger checks pass. Fresh review found no actionable issues and confirmed both native modules in Podfile.lock.

Dedicated native SDK55 simulator UUID `6E0CD6D5-B769-426C-9B98-6984350BA622`, iOS26.0, Xcode27.0 unsigned debug build: Settings shows `1.0.0 · compilación 1.0.0`, then `1.0.0 · build 1.0.0` after switching to English. These match the actual compiled Info.plist version/build. [Screenshot](native-settings.png). Language change preserves goal5/new-cap10. Expo Go host/unknown values have fixture coverage; no compatible Expo Go or Android runtime UI acceptance is claimed.

SDK55 migration `5a1693a` merged/pushed and CI38889781746 passed all jobs. This metadata batch merge/CI outcome is recorded separately after completion. Existing unsigned notification keychain warning remains a separate signed-build limitation, unrelated to version reporting.
