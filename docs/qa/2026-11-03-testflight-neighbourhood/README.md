# November 3 neighbourhood TestFlight delivery

The owner requested commit, merge, build and TestFlight delivery of the six additional missions using the existing passport stamps. Delivery uses the existing internal editorial beta, preserving the draft/accepted separation.

## Candidate and source

- Version/build: **1.0.0 (1.0.8)**, bundle `com.mikepitts.colombianspanish`.
- Mission implementation committed as `5de36fd448eeb4ce9f1f42b04cc5f97192ff341d`, fast-forward merged into `main` and pushed to GitHub before upload. Source was clean at archive time.
- Local Xcode Release archive using the existing generated iOS project and installed dependencies; generated native build metadata updated to the reserved remote iOS build number **1.0.8**. Manual App Store export reused the verified matching certificate/profile, with no signing credentials created or revoked.
- IPA: `~/Builds/Colombian-Spanish/2026-11-03/ColombianSpanish-neighbourhood.ipa`; archive, export, inspection tooling and logs retained alongside it.
- IPA SHA-256: `af72c93fee01c3285d62f9e3cbdfdd8b6ecad0a6c4a673bb7c5595c219ce8090`.
- Apple delivery/build ID: `9b0c96a0-d0a1-4b30-be2b-639efc78bd99`.

[Source provenance](release-source.json), [signed IPA inspection](signed-ipa-inspection.json) and [delivery receipt](delivery-receipt.json) identify this exact candidate. API signing material was handled only in temporary files during validation/upload and removed after each command.

## Added missions

The bill, please; Breakfast to go; At the fruit stall; Finding the plaza; A taxi across town; and Lunch with Nico extend the two café visits to eight. Each uses the existing stamp rules, optional warmup, support labels and durable story milestones. New collection copy, named prerequisites and next-visit links cover the full sequence in English and Spanish. All source cards are in the existing free library. No separate achievements were added.

Original café fingerprints are unchanged, so existing matching runs/stamps retain their identities. Preview outcomes remain separate from accepted outcomes. All eight scripts remain drafts; no human acceptance records were created, and the existing editorial-only visibility remains enabled only by the internal beta configuration.

## Apple delivery

Apple [validation](apple-validation.log) and [upload](apple-upload.log) succeeded. The IPA was uploaded once. The uploader printed a nonfatal local resume-file message followed by a successful upload receipt; Apple subsequently reported complete processing with no errors or warnings.

[Processing](apple-processing.json) reached **VALID / IN_BETA_TESTING**. [Internal availability](internal-availability.json) confirms the exact build in **Editorial Review**, and the English What to Test notes were saved and read back. The group had [three testers](internal-testers.json) when verified. External state remains `READY_FOR_BETA_SUBMISSION`; no external submission, public link, tester invitation or App Store release was made.

## Verification

[Software checks](software-verification.json): 127 suites / **1,284 tests** and one snapshot passed before integration and again on merged main. TypeScript, ESLint, whole-repository Prettier, project-data and editorial-ledger validation, four-zone calendar checks and 14 Python QA tests passed. All four [GitHub CI jobs](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/41598637300) passed.

The signed IPA passed deep/strict signature verification, App Store provisioning/certificate checks, disabled debugging, production APS and no microphone usage description. Embedded configuration enables editorial adventure drafts. The bundle contains all six new mission IDs and passport/collection strings, and all **1,392** manifest-referenced pronunciation files match their source bytes.

## What to try

1. Update through TestFlight to **1.0.0 (1.0.8)**. On Home open **Explore adventures** under **Neighbourhood adventures**; Spanish uses **Explorar las aventuras** under **Aventuras por el barrio**.
2. Existing café completions should unlock **The bill, please**. Finish the new visits in order, checking the named prerequisite and next-visit links. The final visit returns to the passport.
3. Try warmups, hints and corrections. Answer every required task correctly to earn a preview stamp; help records support. Reviewed-only completions may advance the story without a stamp.
4. Check saved café progress, replay without duplicated stamps, unfinished-visit resume and current backup restoration. An explicit restore of an older backup intentionally replaces newer progress.
5. Try English/Spanish, Classic/Barrio, larger text, keyboard entry and scrolling from cards/buttons. Ordinary daily plans and card progress should remain intact.

Human teaching-content/pronunciation acceptance and physical-device touch, scrolling, keyboard, accessibility, audio and layout checks remain open. Compilation, signatures, automated tests and TestFlight availability do not establish those results or learner retention.
