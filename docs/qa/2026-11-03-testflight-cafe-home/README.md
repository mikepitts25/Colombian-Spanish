# November 3 café Home TestFlight delivery

The owner authorized merging the approved café Home into main, building, pushing, and sending it to TestFlight. The implementation is merged and pushed as `312270233e23cac1504c897d7e5f3f46ef5fe95b`.

## Candidate

- Version/build: **1.0.0 (1.0.10)**; bundle `com.mikepitts.colombianspanish`.
- Clean merged source was archived locally with the existing editorial-beta configuration, matching installed Apple Distribution certificate and App Store provisioning profile. No credentials were created or revoked.
- IPA: `~/Builds/Colombian-Spanish/2026-11-03-cafe-home/ColombianSpanish-cafe-home.ipa`.
- IPA SHA-256: `e50d589a1d30a26fad1150e06b8abe096c9159f344161ad2a32484aad7405bed`.
- EAS remote build number is 1.0.10. EAS version sync identified the app as managed and did not change the generated local native project; the first archive was stopped and native project/Info.plist values explicitly updated to 1.0.10 before the successful archive. No earlier artifact from this task was uploaded.

[Source provenance](release-source.json), [signed artifact inspection](signed-ipa-inspection.json), and [software verification](software-verification.json) identify the exact candidate. Archive, export, inspection tools and full logs remain alongside the IPA. The temporary local Node environment override was restored after archive completion.

## Change

Home in both themes now features the approved illustrated Colombian café. Local morning, afternoon and evening greetings and lighting refresh on focus, foreground and exact minute boundaries. Subtle native-driver steam and lamplight pause away from Home/in the background and honor live Reduce Motion changes.

The main native action is “Let’s practice,” or the appropriate saved-plan/recovery action. Existing session limits, saved-plan precedence, retries, topic selection, adventure eligibility, and learning state are retained. Word audio, Favorites, Explore, study tools and detailed statistics remain below the invitation. English uses Practice and Neighborhood. At large text sizes decorative content is reduced to prioritize practice and the navigation labels remain bounded.

## Apple delivery and availability

Apple [validation](apple-validation.log) and [upload](apple-upload.log) succeeded. The inspected IPA was uploaded once. Delivery/build ID: **`eec35480-0c70-401c-8a1e-85840645613d`**. The uploader emitted the same nonfatal local resume-file message seen in earlier releases before reporting success; Apple subsequently reported [COMPLETE with no ingestion errors or warnings](apple-build-upload.json).

[Processing](apple-processing.json) is **VALID / IN_BETA_TESTING**. [Internal availability](internal-availability.json) confirms this exact build in **Editorial Review**, with English What to Test notes saved and read back. The existing group has [three testers](internal-testers.json). External state is `READY_FOR_BETA_SUBMISSION`; no external submission, public link, new invitation or App Store release was performed.

Update the existing app through TestFlight to **1.0.0 (1.0.10)** and keep it installed to preserve local progress. Try the café at different times of day, Let’s practice/Continue practicing, Choose a topic, live Reduce Motion, larger text, and your existing adventures/passport. Detailed instructions are saved in the build’s What to Test notes.

## Verification

- Merged main: **128 Jest suites, 1,317 tests, one snapshot passed**.
- TypeScript, ESLint, whole-repository formatting, data validation, editorial-ledger structure, internal editorial-beta build hook, four-zone calendar integration, and 14 Python QA tests passed.
- All four [GitHub validation jobs](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/41708903425) passed for the pushed implementation.
- Deep/strict signature, signer/profile certificate match, App Store distribution, disabled debugging, production push entitlement and absent microphone usage description verified in the signed IPA.
- Both café illustrations match source bytes in the IPA; English/Spanish café controls, retained adventures/passport strings, and all 1,392 referenced pronunciation files are verified.
- Native morning, afternoon, evening, maximum-text captures and a short steam recording are in the [Home verification packet](../2026-11-03-cafe-home/REPORT.md). Those used current JavaScript in a compatible simulator shell, separately from this signed device archive.

Physical-device touch, VoiceOver, audio and animation comfort, billing acceptance, and human acceptance of the language/story/pronunciation content remain open. The existing editorial-beta catalogue gate stays in force; this is not a public content acceptance or external/App Store release.
