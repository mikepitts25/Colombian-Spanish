# November 3 compact passport TestFlight delivery

The owner requested commit, merge, build and TestFlight delivery of the selected compact passport design. The update is available in the existing internal Editorial Review group.

## Candidate and source

- Version/build: **1.0.0 (1.0.9)**, bundle `com.mikepitts.colombianspanish`.
- Implementation commit: `5212c6d97bfc19fc6e774d090a5b5e2859a4812d`, fast-forward merged into `main` and pushed to GitHub. Source was clean when the archive started.
- Local Xcode Release archive, manually exported with the existing matching Apple Distribution certificate and App Store provisioning profile. No signing credentials were created or revoked.
- IPA: `~/Builds/Colombian-Spanish/2026-11-03-passport/ColombianSpanish-passport.ipa`. Archive, logs and inspection tooling are retained alongside it.
- IPA SHA-256: `fda1b4ca6da99e3f33fbbbc3920ab19ac85d37707061db701c331071645d563e`.
- Apple delivery/build ID: `dfa592b8-fb91-4eed-afbf-ce10940d54e2`.

[Source provenance](release-source.json), [signed IPA inspection](signed-ipa-inspection.json) and [delivery receipt](delivery-receipt.json) identify the candidate. API signing material was handled only in temporary files and removed after each command.

## Passport behavior

Adventures now shows a compact passport cover directly below its heading. The cover includes a decorative booklet, Colombian flag accents, stamp count and an Open passport cue. Progress uses the same cover.

Tapping the cover opens a native collection sheet. The sheet preserves saved stamps, preview/support labels, version information and historical availability, adds completion dates, and offers a Start/Resume/Continue action for the next unlocked unfinished visit. Completed visits retain revisit actions. Closing returns to the underlying screen without navigating back to Adventures. The previous footer button that navigated to the current screen is removed.

English and Spanish are included. The cover exposes its count/loading/error summary to accessibility services. No saved-state schema, stable IDs, adventure eligibility or content acceptance records changed. The candidate also contains the already merged answer-matching improvements from main.

## Apple delivery

Apple [validation](apple-validation.log) and [upload](apple-upload.log) succeeded; the IPA was uploaded once. The uploader printed a nonfatal local resume-file message before the successful receipt. Apple subsequently reported [COMPLETE with no processing errors or warnings](apple-build-upload.json).

[Processing](apple-processing.json) is **VALID / IN_BETA_TESTING**. [Internal availability](internal-availability.json) confirms this exact build in **Editorial Review**, with What to Test notes saved and read back. The existing group had [three testers](internal-testers.json) when checked. External state remains `READY_FOR_BETA_SUBMISSION`; no external submission, public link, tester invitation or App Store release was performed.

## Verification

[Software checks](software-verification.json): **127 suites / 1,303 tests** and one snapshot passed before integration and again on merged main. TypeScript, ESLint, whole-repository Prettier, project-data and editorial-ledger validation, the editorial-beta build hook, four-zone calendar checks and 14 Python QA tests passed. The editorial content export had no diff. All four [GitHub validation jobs](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/41675775004) passed.

Signed IPA inspection passed deep/strict signature verification, exact signer/profile certificate matching, App Store distribution, disabled debugging, production APS and absence of a microphone usage description. Embedded configuration enables editorial adventure drafts. English/Spanish passport strings and the existing neighbourhood missions are present; all **1,392** manifest-referenced pronunciation files match source bytes.

Code review found no important correctness issues. The reported accessibility summary omission was fixed and its regression assertion passed. Native visual/touch/sheet-focus verification was not completed: the available computer-use surface could not access Simulator. Unit tests, compilation, signatures and TestFlight availability do not establish physical-device acceptance.

## What to try

Update the existing app through TestFlight to **1.0.0 (1.0.9)**; keep it installed to preserve local progress.

1. Open Adventures and tap the passport near the top. Close it and check that you return to the same list position.
2. Try Start your first visit, Resume visit or Continue your adventure, depending on saved progress. The action should open the next available visit directly.
3. Check existing stamps, support labels, dates and completed-visit replay without duplicated stamps.
4. Open the passport after the last visit; earned stamps and revisit actions should remain available.
5. Try English/Spanish, Classic/Barrio, large text, VoiceOver and scrolling from cards/buttons on iPhone/iPad. Check ordinary study progress and custom cards.

Story/language/pronunciation acceptance, physical-device UI/touch/accessibility/audio and billing acceptance remain open. This is the internal editorial-review beta.
