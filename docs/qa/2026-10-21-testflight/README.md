# Editorial-review TestFlight delivery — October 21, 2026

The owner explicitly authorized using TestFlight for pending editorial review and directed building/uploading the app. This supersedes the October20 content-before-beta dependency, without creating human review records or authorizing a public App Store release.

## Candidate and signing

- App Store Connect app: **6825514456**, **Colombian Spanish**, bundle ID `com.mikepitts.colombianspanish`. Created and verified through the signed-in Apple session and authenticated API.
- Candidate cloud build: **4afaa68f-b881-49b3-a108-f7f46b0f0948**, **1.0.0 (1.0.3)**, `editorial-beta`, store distribution.
- Existing Colibri Code distribution certificate and account upload access reused. No new API key, role expansion or credential export.
- Initial build `77fa079e-c55d-4c55-a38f-0d5a9b51f705`, build1.0.2, failed on the notification module's required APS signing entitlement. It was not uploaded to Apple. Registered the identifier capability, generated a matching App Store profile and decoded it before rebuilding. [signing-profile.json](signing-profile.json) verifies exact application identity, production APS and disabled debugging.
- [release-source.json](release-source.json) records working-tree build-input hashes against base main `9269736`. Release documentation may be added after cloud source upload; do not equate the old Git commit alone with the uploaded working tree.

## Editorial boundary

The named beta profile inherits production build behavior but explicitly validates/reports its unaccepted catalogue for the owner-authorized editorial review. Actual cloud post-install output: `Editorial-review TestFlight beta: 1392 cards await current acceptance; not accepted for public release.`

The public `production` hook and `npm run release:preflight` remain strict. [public-content-preflight.log](public-content-preflight.log) records the expected refusal. No ledger decision, teaching fingerprint, deck/card ID or learner data was changed by this delivery. The full current library remains included; the earlier88-card packet is a review convenience.

The beta profile disables dotenv loading, local dotenv files remain excluded from the upload, and both project/account EAS production variable listings were empty. Optional application Sentry reporting is therefore not enabled for this beta. Apple's TestFlight collection remains separate and is disclosed in the public policy.

## Signed build and Apple upload

[cloud-build.json](cloud-build.json) records the successful store build. [signed-ipa-inspection.json](signed-ipa-inspection.json) verifies the 45,222,790-byte IPA's deep/strict signature, exact bundle/version/build, production APS entitlement, disabled debugging, no microphone usage description, exempt encryption declaration and iPhone/iPad device families. All1,392 generated pronunciation files match the source by bytes. The signed JavaScript bundle contains neither local configured diagnostics nor audio-generation credential values. Privacy-manifest inventory is recorded without claiming a final App Privacy review.

IPA SHA256: `a3ffd90027b792399cc0f89261149a2c77d43d211bb367e584c182fb7b6f0b15`. The artifact and expanded signed inspection are retained in the local `~/Library/Caches/ColombianSpanish/` directory, outside Git.

[Apple validation](apple-validation.json) succeeded with no errors. [Direct Apple upload](apple-upload.json) of that exact IPA succeeded with no errors, delivery UUID `7cff031f-f2c9-4e36-bb43-fdebb045c3c8`. This used the existing account upload access and no parallel EAS submission.

[Apple processing](apple-processing.json) verifies **VALID**, internal state **IN_BETA_TESTING**, external state **READY_FOR_BETA_SUBMISSION** and no non-exempt encryption. The independent [altool import status](apple-import-status.json) is VALID and confirms presence in App Store Connect. [Internal availability](internal-availability.json) verifies the exact build in the Editorial Review group's builds and reads back its saved English editorial notes. No external beta review was submitted and no physical installation is claimed.

## Software checks

Node22.16.0: [TypeScript](typecheck.log), [lint](lint.log), [formatting](format.log), [117 suites/1,176 tests](jest.log), [data](data.log), [ledger](ledger.log), [inventory](inventory.log), [calendar integration](calendar.log) and [Python QA tools](python.log). The added beta regression was observed failing on the missing editorial-beta identification, then passing after the bounded hook change. The full suite passes; the standard production-content preflight deliberately remains red.

## Privacy website and Apple metadata

The live [Colombian Spanish policy section](https://colibricodellc.com/privacy-policy/#colombian-spanish) covers local learning data, unencrypted backups/clipboard, generated/device audio, permissions, Expo updates, optional diagnostics, TestFlight feedback, retention/deletion and existing company contacts. [The section source](../../release/website/colombian-spanish-privacy-section.html) is retained for maintenance.

Fresh nginx inspection established the static site root. Required the original origin SHA256, backed up outside the public webroot and atomically replaced only the policy file while preserving ownership/mode. [privacy-publication.json](privacy-publication.json) records the backup and before/after hashes. DestinationPacker/Hallowtwist sections and the common policy tail were preserved byte-for-byte. Canonical HTTPS and Firefox confirm the new anchor/content; the desktop screenshot observation shows readable wrapped text and its heading below fixed navigation. No mobile/device/privacy-compliance or inbox-delivery acceptance is inferred.

[apple-beta-information.json](apple-beta-information.json) records the saved English beta description, company feedback email, website and specific policy URL. [internal-group.json](internal-group.json) records **Editorial Review**, automatic all-build access and only the owner's two existing accounts. No other testers or public link were added. Processing and group availability are verified separately above.

## Acceptance that stays open

Actual teaching/grammar/pronunciation/editorial acceptance; physical installation and hardware/audio/accessibility/reminder behavior; the seven named iOS QA groups; external beta review; and public App Store release remain separate. Android is paused and previously skipped security work is unchanged. Use the beta for the authorized editing/review work, recording exact proposed corrections and keeping personal learner backups under the owner's control.
