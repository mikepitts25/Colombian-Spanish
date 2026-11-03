# Café host hat and punctuation tolerance — November 3, 2026

The owner requested a Colombian sombrero vueltiao on the café host and acceptance of conversational replies without punctuation, specifically “Agua por favor” for “Agua, por favor.”

## Implemented

Both daylight and evening café assets now show the same black-and-cream woven sombrero vueltiao. The built-in image editing tool used the evening edit as the hat reference for the daylight edit; an independent visual review confirmed compatible face, scene, cup and pendant-lamp placement. Existing steam, afternoon wash and day/night transitions use the same asset paths. Previous artwork is retained in Git history.

The shared typed-response checker now treats Unicode punctuation as optional separators and normalizes resulting whitespace. It preserves required words, word order, ñ, existing missing-vowel-accent tolerance and explicit diminutive equivalents. Authored punctuation/spelling remain visible in feedback, with exact authored variants preferred. Punctuation-only input remains unanswered and cannot create an observation.

The actual second café visit was tested in both themes: “Agua por favor” shows Correct, the model “Agua, por favor” and Continue, with no Try again. Generic mission tests cover a punctuation-free “Un cafecito por favor” too. Missing/extra/reordered words and “porfavor” still fail when not authored as accepted variants. Saved content identities, plan/session state, stamps and previous observations are unchanged. For an existing visit already showing a correction, use Try again and submit the phrase again.

## Candidate

- Merged and pushed implementation: `cbfd35d` on `main`.
- Version/build: **1.0.0 (1.0.11)**, bundle `com.mikepitts.colombianspanish`.
- Local Xcode Release archive and manual App Store export using the existing matching Apple Distribution certificate and profile. EAS remote and local native build numbers are 1.0.11; the temporary local Node override was restored after the archive.
- IPA: `~/Builds/Colombian-Spanish/2026-11-03-hat-punctuation/ColombianSpanish-hat-punctuation.ipa`.
- SHA-256: `a4159051f17b8af3eb57057c3c69cd5bd9ea8270f0ee84ece599fecc7379a019`.

[Source provenance](release-source.json), [signed IPA inspection](signed-ipa-inspection.json) and [software verification](software-verification.json) identify the exact artifact. Archive, inspection scripts and full build/check logs are retained alongside the IPA.

## Apple delivery

Apple [validation](apple-validation.log) and [upload](apple-upload.log) succeeded. The inspected IPA was uploaded once; delivery/build ID **`44e98711-dff7-4e2b-ae1a-af94e496398d`**. The uploader emitted a nonfatal local resume-file message before reporting successful delivery. Apple subsequently reported [COMPLETE with no ingestion errors or warnings](apple-build-upload.json).

[Processing](apple-processing.json) is **VALID / IN_BETA_TESTING**. [Internal availability](internal-availability.json) confirms the exact build in **Editorial Review**, with What to Test notes saved and read back. The existing group has [three testers](internal-testers.json). External state remains `READY_FOR_BETA_SUBMISSION`; no external submission, public link, tester invitation or App Store release was performed.

Update the existing app through TestFlight to **1.0.0 (1.0.11)** to try both fixes. In a previously saved correction screen, use Try again and submit “Agua por favor” again.

## Verification

The regression cases failed against the old checker and passed after the change. **128 Jest suites / 1,330 tests / one snapshot passed**, including 98 focused answer/mission/adventure UI tests. TypeScript, lint, whole-repository formatting, project-data validation, editorial-ledger validation, the editorial-beta build hook, four-zone calendar integration and 14 Python QA tests passed. Independent review reported no Important or Critical finding. All four [GitHub validation jobs](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/41721652261) passed for the pushed implementation.

The signed artifact passes deep/strict signature verification, exact signer/profile matching, App Store distribution, disabled debugging, production push entitlement and absent microphone usage description. Both updated hat illustrations match source bytes in the IPA. Café/adventure/passport controls and all 1,392 referenced pronunciation files were verified.

The installed-device touch, VoiceOver and art/animation experience remains for tester acceptance. The existing internal editorial-beta rules and pending human content/pronunciation/story acceptance remain in force; no external or public release is included.
