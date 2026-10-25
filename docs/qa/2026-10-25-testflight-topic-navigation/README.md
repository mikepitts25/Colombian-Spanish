# October 25 local iOS TestFlight delivery

The owner requested a local iOS build and TestFlight upload to try the new topic-selection flow. Android work remains paused.

## Delivered candidate

- Source: clean, pushed `main` at `920947cb813f8026930f6b89d508d3cef23c64e4`.
- Version: **1.0.0 (1.0.6)**, bundle `com.mikepitts.colombianspanish`.
- Built locally with the existing `editorial-beta` configuration. The local native archive is preserved under `~/Library/Developer/Xcode/Archives/2026-10-25/`.
- IPA: `~/Library/Caches/ColombianSpanish/ColombianSpanish-topic-navigation.ipa`.
- IPA SHA256: `cc839410fd4c70c34105250e48578fd9527d036e8e8638e0cc5573b8fc040130`.
- Apple delivery/build ID: `56a9b96b-fa7e-4eea-93fa-4b720a1ee524`.

[Source provenance](release-source.json) and [signed IPA inspection](signed-ipa-inspection.json) record the exact artifact. The deep/strict signature, production push entitlement, disabled debugging, absent microphone permission and App Store profile were verified. All 1,392 manifest-referenced pronunciation files match source bytes, and the embedded JavaScript contains the new English/Spanish topic controls.

## Signing and local export

The first local archive attempt used build1.0.5 and failed because the profile referenced the legacy iPhone Distribution certificate while Xcode selected the installed Apple Distribution identity. Nothing from build1.0.5 was uploaded.

The build1.0.6 archive completed locally after selecting the profile's exact legacy certificate fingerprint. The automatic IPA export still selected the incompatible modern identity. The completed archive was then exported successfully with the already-installed Apple Distribution certificate and a new app-specific App Store profile, `Colombian Spanish Local TestFlight 2026-10-25`, with the correct production APS entitlement. No certificate was created or revoked; existing EAS credentials and profiles remain unchanged. [Local export result](local-export.log).

## Apple delivery and availability

[Apple validation](apple-validation.log) and [upload](apple-upload.log) succeeded with no errors. The inspected IPA was uploaded once. [Import status](apple-import-status.log) independently confirms **VALID** and presence in App Store Connect.

[Processing](apple-processing.json) is **VALID / IN_BETA_TESTING**. [Internal availability](internal-availability.json) verifies the exact build in the existing **Editorial Review** internal group and that English What to Test notes were saved and read back. No external beta submission, new tester, public link or App Store release was created.

## What to try

1. Update Colombian Spanish to **1.0.0 (1.0.6)** through TestFlight.
2. On Home, tap **Choose a topic** below the main study action and select a topic.
3. While studying, tap **Change topic** by the topic title. Try another topic, then reopen the browser and use **Continue studying** to check that your card and region are preserved.
4. Tap **Home** at the top of the card screen and confirm it returns to Home.
5. Check English/Spanish and your usual text size; saved progress and daily limits should remain intact.

## Software checks and acceptance boundaries

[Full Jest](jest.log): **117 suites / 1,208 tests passed**. TypeScript, lint and whole-repository formatting passed. Data validation reports 47 decks, 1,392 cards and 1,392 audio entries; editorial ledger validation passed with all 1,392 cards awaiting human acceptance. Calendar integration passed in Berlin, Bogota, New York and Auckland; 14 Python QA tests passed. [Structured check summary](software-verification.json).

Expo Doctor reported existing config/direct-dependency warnings and available patch updates, recorded in the check summary. ExpoAsset was autolinked into the signed native archive. App dependencies were preserved for this bounded release.

TestFlight availability establishes the installation route. Installation, the new flow's physical-device experience, accessibility/audio behavior and human editorial acceptance remain to be tested. The draft catalogue remains authorized for internal editorial beta use; public-release content acceptance stays strict.
