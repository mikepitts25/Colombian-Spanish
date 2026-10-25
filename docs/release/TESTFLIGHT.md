# iOS TestFlight preparation

Updated October 25, 2026. Tracks B14.6-A in [MASTER_PLAN.md](../../MASTER_PLAN.md). Android remains paused; skipped security work is unchanged.

## Active editorial-review beta

The owner explicitly authorized building and uploading the current catalogue to TestFlight **to perform the pending editorial review**. That supersedes the October20 content-before-beta dependency below. The dedicated `editorial-beta` profile uses store distribution, production EAS environment, Node22 and disabled dotenv loading. The beta build hook validates the ledger and explicitly reports its unaccepted catalogue; the public `production` hook and `npm run release:preflight` stay strict. No language acceptance is invented.

App Store Connect record **6825514456**, name **Colombian Spanish**, bundle ID `com.mikepitts.colombianspanish`, was created and verified. The existing company upload access and distribution certificate are reused; an app-specific App Store profile was created. An initial build exposed the notifications module's required `aps-environment` entitlement. Enabled that identifier capability and regenerated/decoded the matching profile with production APS and `get-task-allow: false` before rebuilding. This does not implement a remote push service.

Delivered EAS build **4afaa68f-b881-49b3-a108-f7f46b0f0948**, version **1.0.0 (1.0.3)**. The exact signed IPA passed deep/strict signature and asset/permission inspection, Apple validation and upload. Apple build **7cff031f-f2c9-4e36-bb43-fdebb045c3c8** is **VALID / IN_BETA_TESTING**; the internal **Editorial Review** group contains it and the editorial notes are saved. [Delivery evidence](../qa/2026-10-21-testflight/README.md). This establishes internal availability, not installation or completed device/editorial acceptance.

The company policy now includes [Colombian Spanish coverage](https://colibricodellc.com/privacy-policy/#colombian-spanish). Existing company support/privacy contacts and this URL are saved in the beta metadata. Internal group **Editorial Review** is created for the owner's existing accounts. No external-review submission or public App Store release is authorized by this beta delivery.

## October22 update

Delivered committed main `981b2bc` as EAS build **d60a17f2-c083-41d1-894b-9bb9fcc49180**, version **1.0.0 (1.0.4)**. The signed app contains the new Colombian speech bubble icon, study/quiz layout refinements and pronunciation fixes. Apple validation/upload succeeded; processing is **VALID / IN_BETA_TESTING** and the exact build is verified in **Editorial Review**, with saved tester notes. [Delivery evidence](../qa/2026-10-22-testflight/README.md). This supersedes build1.0.3 as the latest internal beta; editorial, hardware and public-release acceptance remain open.

## October25 local topic-selection update

Delivered clean main `920947c` as a **locally built** iOS archive and signed App Store IPA, version **1.0.0 (1.0.6)**. Home now offers **Choose a topic**, Study offers **Change topic**, and the explicit **Home** action returns to Home. **Continue studying** preserves the active card queue and region while checking saved-session ownership.

Apple validation and upload succeeded; the exact build `56a9b96b-fa7e-4eea-93fa-4b720a1ee524` is **VALID / IN_BETA_TESTING** in the existing **Editorial Review** group, with saved tester notes. [Local build and delivery evidence](../qa/2026-10-25-testflight-topic-navigation/README.md). This is the latest internal beta. Build1.0.5 was an unused local signing attempt and was never uploaded. Device/editorial/public-release gates remain open.

## October20 preparation baseline

The following records the earlier preparation and remaining acceptance work. Statements about absent signing/account setup below are historical and superseded by the active beta status above. Teaching acceptance, physical-device checks and the seven named QA groups remain outstanding; they can be evaluated using the delivered beta.

## Beta scope

Prepare the existing core: onboarding, card study and review, quizzes, favorites, custom decks/cards, preferences, local reminders and backups. Keep generated pronunciation accurately labeled. Retain English/Spanish, supported appearance settings and enabled iPad support. Development mission/listening/recording previews do not become released beta features. No payments, accounts, sync or new downloadable packs are added for this release.

The full current library remains installed: 47 decks and 1,392 cards. A proposed smaller editorial batch is a review convenience, not an implemented scope reduction.

## Verified access and configuration

- Expo authentication and project access work for `@mikepitts25/colombian-spanish`, project `7be19314-d592-4ab7-b792-4941c7c08cf6`.
- The three most recent remote iOS builds are May preview builds, including one completed preview. No current production candidate was identified in that bounded listing.
- Remote iOS build number currently reads `1.0.1`. Production uses remote versions and auto-increment; capture the actual next build number rather than copying a local version label.
- Project- and account-level `eas env:list production` both report no variables. Local `.env` does configure diagnostics; the local QA export therefore is not evidence of the future remote build's diagnostics configuration. No secret values were recorded. The final signed candidate remains a separate check.
- Local Apple Distribution and Apple Development signing identities exist. EAS credentials inspection shows the Colibri Code LLC team and an active **Ad Hoc** profile, expiring May 6, 2027. It does not show an App Store distribution profile or configured submission API key for this project. No credentials were created, downloaded, attached or changed.
- The existing Firefox App Store Connect session requires sign-in. The app record, agreements, roles, beta groups and Apple build processing remain unverified.
- No available physical device was reported by `devicectl`; the known iPad is unavailable.
- [Production config introspection](../qa/2026-10-20-testflight-preparation/production-config.json) reports the correct bundle ID, fingerprint runtime compatibility, tablet support, scene lifecycle and no microphone usage description. This is local generated-config evidence, not inspection of a signed IPA.

## Ordered release gates

1. **Content acceptance:** a qualified editor supplies current attributed decisions for every included card. `npm run release:preflight` currently rejects all 1,392 cards. Use the [existing complete inventory](../editorial/content-review.json), [88-card first batch](../editorial/testflight-first-batch.json) and [decision workflow](../editorial/RELEASE_WORKFLOW.md). Do not label AI review as human acceptance. A reduced library requires a separate reviewed runtime/migration/asset change before the preflight can pass.
2. **Account and contact:** sign in to App Store Connect, verify the record matches `com.mikepitts.colombianspanish`, resolve account-only requirements and confirm beta feedback/review contacts. Supply the intended public support/privacy contact and URLs. Do not infer that a website or Apple login address is the selected support channel.
3. **Release configuration:** confirm intended production update behavior and optional diagnostics. If diagnostics are enabled, inspect a signed-build envelope and provider retention/access settings before completing matching disclosures. Use [the data inventory](../privacy/DATA_INVENTORY.md) and [privacy draft](../../PRIVACY_POLICY.md).
4. **Engineering and candidate:** run the documented checks from a clean lockfile installation. Once content passes, build a signed production candidate and record commit, EAS build ID, actual version/build, bundle ID and artifact identity. Preserve the existing content gate.
5. **Installation and acceptance:** upload that exact build, wait for Apple processing and install through an authorized internal group. Complete candidate smoke tests on hardware. Route the seven known iOS QA groups through [the current case map](../qa/2026-10-20-ios-remaining/README.md); unresolved cases retain their exact status. TestFlight provides the installation route for candidate validation, not proof that validation has already passed.
6. **External beta:** after candidate acceptance, supply beta information and assign the intended external group. Record review status and actual install availability. Do not infer external availability from a successful upload or internal group membership.

## Build and upload sequence

Use Node 22 and an installed supported EAS CLI. Run from the repository root after reviewing the named content/account/configuration gates:

```sh
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand --watchman=false
npm run test:calendar
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts/tests -p 'test_*.py'
npm run validate:data
npm run content:validate-reviews
npm run content:review
git diff --exit-code -- docs/editorial/content-review.json
npm run release:preflight
eas build --platform ios --profile production
```

The current preflight intentionally stops this sequence. Once a named production build succeeds, submit that explicit build ID with `eas submit --platform ios --profile production --id ACTUAL_BUILD_ID`. Select the verified App Store Connect record during supported submission setup; do not submit the old preview or use `--latest` across ambiguous builds. Production's post-install hook also enforces content acceptance. Custom native/OTA workflows must run the same preflight explicitly.

Archive and inspect the resulting candidate's identifiers, signature, permissions and actual diagnostics/update configuration. No archive, upload or external group assignment is claimed by this preparation.

The local **source upload staging directory** was inspected with `eas build:inspect --platform ios --profile production --stage archive`. This is distinct from a signed application archive. `.easignore` preserves the existing local exclusions and omits local analysis history and non-build QA/design documents, retaining editorial inputs and app assets. Inspect again after future changes; `.easignore` replaces `.gitignore` for EAS uploads.

## Candidate smoke test

Record exact device/OS, build and results, with sensitive learner data excluded from evidence. Back up any existing progress before upgrade testing.

- Fresh onboarding in Spanish and English; Home recommendation opens the expected study queue.
- Reveal and each grade work; exactly the intended credit is earned and the remaining queue survives termination/relaunch.
- Quiz feedback/results, favorites and custom-card save/edit work without unintended schedule changes.
- Generated audio plays on speaker/headphones; playback stops appropriately on navigation/background and interruptions recover. Check Bluetooth/call routes on hardware where supported.
- Airplane-mode cold launch reaches study and plays promised bundled audio; failed ordinary audio has the documented fallback behavior.
- Files export, valid preview/Cancel and restore work; invalid input is recoverable. Upgrade preserves learning state; reinstall recovery uses a valid exported backup.
- Reminder permission denial remains usable; an enabled reminder is actually delivered and its tap opens correctly on the candidate.
- Maximum text, touch actions, VoiceOver and enabled iPad layouts have the named acceptance results. Reuse prior evidence within its scope; keep the case-map gaps explicit.
- No development preview entry points or microphone request appear. Record crashes, startup responsiveness and hardware performance observations.

## Apple information and local assets

Use [TESTFLIGHT_TEST_INFORMATION.md](TESTFLIGHT_TEST_INFORMATION.md) as staged beta copy. Actual feedback/review contacts and any URLs must be supplied and verified in the account before submission. This app has no implemented sign-in, so reviewer login credentials are not applicable to the current core scope.

Twelve bilingual phone/tablet screenshot drafts already exist in [store-assets](store-assets/README.md). Final App Store screenshot selection and commercial/pricing work are separate from this bounded beta preparation.

Official references checked October 20, 2026: [Apple beta test information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information/), [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/), [Expo iOS submission](https://docs.expo.dev/submit/ios/) and [Expo lifecycle hooks](https://docs.expo.dev/build-reference/npm-hooks/). Upload, Apple processing, internal installation, external review and public App Store release are distinct outcomes.
