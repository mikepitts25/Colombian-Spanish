# October 22 TestFlight update

The owner authorized committing/merging all work to main, building and delivering the update to the existing internal TestFlight beta.

## Source and candidate

Source commit: `981b2bc7e90f91f4d9a85636b140752771ee35bd`, clean `main`, pushed to GitHub before upload. Product changes are in `f844bcc`: Colombian speech bubble app icon, study/quiz layout refinements, clearer swipe hints and corrected pronunciation fallback behavior. The following commit only tracks delivery in the master plan.

EAS build: `d60a17f2-c083-41d1-894b-9bb9fcc49180`, `editorial-beta`, App Store distribution, version **1.0.0 (1.0.4)**. [Source](release-source.json) and [completed cloud build](cloud-build.json) record the exact identity without artifact download links.

[Signed IPA inspection](signed-ipa-inspection.json) verifies the correct bundle ID, version and build, deep/strict signature, production APS, disabled debugging, absent microphone permission text and byte identity for all 1,392 manifest-referenced pronunciation files. The repository also retains 60 superseded recordings; inspection follows the manifest actually bundled, rather than counting all source MP3 files. [Extracted signed icon](signed-icon.png) visually confirms the new Colombian speech bubble; the asset catalog also contains opaque 1024px phone/tablet icon renditions.

IPA SHA256: `0a661e53775f7d81fb91412a922b827fa14494ecb1afa56e635a32db9a34ba49`. The IPA and expanded signed app are retained in `~/Library/Caches/ColombianSpanish/`, outside Git.

## Validation and upload

[Apple validation](apple-validation.log) and [upload](apple-upload.log) succeeded with no errors. Delivery UUID: `16f1ff5f-78cf-4884-895d-2dd04b23490b`. The exact inspected IPA was uploaded once through existing company upload access; no parallel EAS submission or new credential was created.

[Apple processing](apple-processing.json) is **VALID / IN_BETA_TESTING**. [Internal availability](internal-availability.json) verifies that the exact build belongs to the existing **Editorial Review** group and that English “What to Test” notes were saved and read back. [Independent import status](apple-import-status.log) also confirms VALID and presence in App Store Connect.

## Software verification and boundaries

TypeScript, lint and whole-repository formatting passed. [Full Jest suite](jest.log): 117 suites / 1,199 tests passed. Data validation reports 47 decks, 1,392 cards and 1,392 manifest audio entries. Editorial ledger validation passed while reporting all 1,392 cards awaiting acceptance. Calendar integration passed in Berlin, Bogotá, New York and Auckland; 14 Python QA tests passed.

The authorized editorial-beta profile permits review of draft teaching content; public-release acceptance remains strict. This update does not establish completed editorial review, physical-device installation, hardware/accessibility acceptance, external beta review or public App Store release. No new testers or public links are added.
