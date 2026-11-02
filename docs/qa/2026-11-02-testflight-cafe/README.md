# November 2 local iOS café TestFlight delivery

The owner requested the merged app be built and uploaded to TestFlight, and explicitly selected exposing only the café drafts in the existing internal editorial beta. Android delivery, external beta and public release were not requested.

## Candidate and source

- Version/build: **1.0.0 (1.0.7)**, bundle `com.mikepitts.colombianspanish`.
- Clean, pushed source: `81784167d69443247e6572d941d3a271120bd987` on `main`.
- Built locally with a regenerated iOS project, native dependencies, Xcode Release archive and manual App Store export. The remote EAS iOS build number was reserved as `1.0.7`; this is a local Xcode delivery, not an EAS cloud build.
- IPA: `~/Builds/Colombian-Spanish/2026-11-02/ColombianSpanish-cafe.ipa`; native archive, build logs and export are retained alongside it.
- IPA SHA-256: `83ddb5776cf77776cf447ea38e58ebdad97d9aca4975e297322bc5188070d8f3`.
- Apple delivery ID: `ddc4605e-73c8-40c5-88a8-9a3b7cf70310`.

[Source provenance](release-source.json), [artifact inspection](signed-ipa-inspection.json) and [delivery receipt](delivery-receipt.json) identify the exact candidate. The matching installed certificate/profile were reused; no signing certificate was created or revoked. API key material was retrieved through the existing authenticated account only for delivery and removed from its temporary file after each Apple command.

## Café-only editorial visibility

Only `editorial-beta` embeds `extra.cafeEditorialPreview: true`. Adventure screens/storage read `SHOW_CAFE_DRAFTS`, while the broad translation-review, flagged-export, recording and other developer tools keep their separate development-only gate. The signed Expo configuration confirms the café flag, and no microphone usage description is present. Production and ordinary preview profiles leave the café flag false.

Both stories and their stamps remain explicitly labeled drafts/preview practice. The acceptance registry is empty; enabling this beta does not create human acceptance, grant accepted-mode outcomes or alter public-release preflight. Preview progress remains separate from accepted progress.

## Apple delivery

Apple validation and upload succeeded for the inspected IPA. It was uploaded once. The uploader printed a nonfatal local resume-file message followed by its successful delivery receipt; the authoritative processing and group status are checked separately.

[Apple processing](apple-processing.json) reached **VALID / IN_BETA_TESTING**. [Internal availability](internal-availability.json) confirms the exact build in **Editorial Review**, and English What to Test notes were saved and read back. The external state is READY_FOR_BETA_SUBMISSION; no external submission was made.

## What to try

1. Update Colombian Spanish to **1.0.0 (1.0.7)** through TestFlight.
2. On Home, open **Explore café adventures** beneath the main daily activity; Spanish uses **Explorar las aventuras** under **Aventuras en la cafetería**.
3. Start **Breakfast at Ana’s café**, try the optional three-phrase warm-up or hints, then complete the tasks. A correct response on every required task earns a preview stamp; completing with reviewed-only tasks can still continue the story.
4. Open **Back at Ana’s café**. Check that the next visit stays unlocked and earned stamps survive replay, app restart and explicit backup/restore.
5. Look at the passport in Progress. Try English/Spanish, Classic/Barrio and larger text. An unfinished daily plan should remain available with its original progress.
6. Report natural Spanish variants the finite matcher rejects, unclear support labels, awkward keyboard/scroll behavior and any save/resume problems.

## Verification and boundaries

[Software verification](software-verification.json): 127 Jest suites / **1,278 tests passed**; TypeScript, ESLint, whole-repository formatting, data/editorial-ledger validation, four-zone calendar checks and 14 Python QA tests passed. All four [GitHub CI jobs](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/41522871799) passed. A fresh scoped reviewer independently passed the configuration/visibility tests and found no material release-boundary issue.

The signed artifact passed deep/strict signature verification, production APS entitlement, disabled debugging, App Store profile validation, café configuration/string checks and byte matches for all **1,392** manifest-referenced pronunciation files. Native compilation/signing/upload evidence does not establish physical-device layout/touch/audio/accessibility or learner retention. The scripts, the full card catalogue and generated audio still require their stated human review. No external tester invitation, public link, external beta review, App Store submission or public release was created.
