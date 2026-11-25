# Deck editorial decisions and release checks

`content-review.json` is a generated inventory, not approval. Its `editorial` section gives the current deck/card IDs, teaching fingerprint, candidate content version, effective status, attribution and stale flag. Existing card `reviewStatus` values are learner/editor UI metadata and do not establish qualified editorial acceptance.

## Record an actual decision

1. Regenerate with `npm run content:review`; select the exact text and contextual/regional claims to review. Read grammar/audio acceptance as separate work.
2. A qualified human reviewer supplies identity/attribution, date, rationale and decision. No outreach or approval is invented by tooling. Reviewer `kind: human` is a repository assertion supplied by the editor/owner; the validator does not independently verify identity or linguistic competence.
3. Add/update the card's record in `review-ledger.json`, using the current inventory fingerprint and content version. Each card has at most one current decision; preserve earlier versions in Git history. `draft` records have null/absent reviewer/date. `reviewed` and `needs-correction` require a nonempty reviewer ID, `kind: human`, parseable date and nonempty note. `needs-correction` remains excluded until corrected and reviewed.
4. Run `npm run content:validate-reviews` and `npm run content:review`. Review the source and ledger diff together. Never manually edit the generated inventory.

Example shape (illustrative; no real acceptance is established by this document):

```json
{
  "deckId": "the actual deck ID",
  "cardId": "the actual card ID",
  "contentVersion": 1,
  "fingerprint": "copy the exact current 64-character fingerprint from the inventory",
  "status": "reviewed",
  "reviewer": { "id": "actual consenting reviewer attribution", "kind": "human" },
  "reviewedAt": "2026-10-15T00:00:00.000Z",
  "note": "Actual scope, rationale and any qualifications of the decision"
}
```

The example fingerprint is deliberately not valid: copy a real current value after actual review. The checked-in ledger starts empty. This makes all 1,392 seed cards effective drafts, without claiming that nobody previously reviewed them.

## Versions and changes

The SHA-256 fingerprint binds deck ID/name/description and card ID/text/example/IPA/tags/register/regions/conjugation. SRS scheduling, timestamps, favorites, flags and legacy local review markers do not alter teaching acceptance. A mismatch makes the effective state draft, clears effective attribution and proposes the next integer version. Several edits before a new recorded decision share that candidate number; the fingerprint distinguishes their exact content. Record the new version/hash only after review. Git retains earlier decisions.

Audio files and grammar outside cards are not covered by this text fingerprint. Generated audio remains labeled generated and not human-reviewed. This ledger is not a pronunciation, recording-rights, or whole-app release certification.

## Filter and gate

- `npm run content:release -- --output /absolute/path/pack.json` writes only currently reviewed deck cards and their review metadata, preserving IDs. Draft, needs-correction and stale cards are omitted; an empty accepted set fails rather than producing an apparently shippable empty pack.
- `npm run release:preflight` checks the **entire currently bundled deck library**. It fails while any bundled card lacks current text acceptance. The current expected result is failure with 1,392 blocked cards.
- The standard EAS `production` profile runs that check through `eas-build-post-install`. Development/preview builds retain the working library and do not claim release acceptance. CI validates ledger structure and exercises positive/negative fixtures, while ordinary project-generation/JS-bundle jobs do not certify release content.

### Christmas free-only subset inputs

The proposed [C0 inventory](christmas-c0-candidate.json) identifies the exact free cards, two café visits and files for review. Record the card decisions in `review-ledger.json` and the visit decisions in `src/adventures/acceptance.json`. Store pronunciation listening evidence and distribution rights with the owner and reviewer. The release approval record references that evidence without embedding it in the generated manifest.

When a clip speaks an expanded alternative, its candidate `audio` entry must also pin the exact spoken text in `transcriptOverride`. An ordinary card-front pronunciation needs only its path and checksum.

After approval is given, create `docs/editorial/christmas-release-approval.json` with this structure. Use the SHA-256 of the exact candidate file bytes. The `offer` and `distributionRights` entries come from the owner, and `pronunciation` comes from the human reviewer who heard the selected clips. Each `evidence` value points to the applicable decision or review record. The placeholders below are illustrative.

```json
{
  "schemaVersion": 1,
  "candidateSha256": "<SHA-256 of christmas-c0-candidate.json>",
  "offer": {
    "reviewer": "<owner attribution>",
    "reviewedAt": "<ISO timestamp>",
    "evidence": "<scope decision reference>"
  },
  "pronunciation": {
    "reviewer": "<human reviewer attribution>",
    "reviewedAt": "<ISO timestamp>",
    "evidence": "<listening review for the selected clips>"
  },
  "distributionRights": {
    "reviewer": "<owner attribution>",
    "reviewedAt": "<ISO timestamp>",
    "evidence": "<distribution clearance for the selected audio and café artwork>"
  }
}
```

Run `node scripts/release-content.js --emit-subset /absolute/path/manifest.json` to emit the reviewed input manifest. Run `node scripts/release-content.js --check-subset /absolute/path/manifest.json` to compare it with current approved inputs. An existing output can be reused when its contents match exactly. Recheck any corrected card, visit or asset and obtain sign-off for the resulting scope before generating a new manifest.

The iOS `christmas-subset` profile generates its deck catalogue, visit definitions and pronunciation registry from the same verified inputs. It requires current approvals at preflight and bundle time. Run the scoped preflight with:

```sh
COLOMBIAN_SPANISH_CATALOGUE=christmas-subset npm run release:preflight
```

Preflight prints the bundle digest and writes the generated manifest to `.expo/christmas-subset/<digest>/manifest.json`. Metro regenerates and checks the outputs against current approved inputs before bundling.

The subset profile exposes free learning and prior purchase recovery. It disables new checkout and over-the-air updates. The standard production preflight and build hook continue to check the full library.

Subset startup adds missing reviewed cards and preserves stored records for cards outside the release. A progress export still includes those records. A restore classifies the existing device before loading the file, and the original installation's courtesy status stays on that device. The purchase provider continues to verify ownership separately.

A verified purchase can be recognized in the subset, whose study catalogue only contains reviewed release cards and the learner's own cards. If an existing customer depends on any excluded purchased collection, resolve their continued access before shipping this profile as an update. The signed candidate still needs the physical-device upgrade and store restore checks in the Christmas release plan.

### Owner-authorized editorial-review TestFlight beta

On October 21, 2026 the owner explicitly directed using TestFlight to perform the pending editorial review and authorized building/uploading that beta. The dedicated `editorial-beta` profile inherits production signing/build behavior and uses store distribution, with development previews and microphone recording still excluded. Its build hook validates the real ledger, reports the exact number of cards awaiting acceptance and labels them **not accepted for public release**. It does not add human decisions or change fingerprints.

This named beta exception is for collecting editorial and device feedback. It does not make `npm run release:preflight` or the standard `production` hook pass; both continue to reject unaccepted teaching content. Record exact beta build identity and tester access separately from language acceptance, physical-device checks, external beta review and public App Store release.

The editorial beta continues to bundle the full working library. The separate Christmas subset profile performs the reviewed catalogue substitution during its own build.

Manual native builds, OTA updates and custom EAS workflows must explicitly run `npm run release:preflight`; custom build jobs do not automatically execute EAS npm hooks. See [Expo's lifecycle hook documentation](https://docs.expo.dev/build-reference/npm-hooks/). Do not bypass this check to publish the development library. No build signing, account settings, submission or publication is performed here.

## November 2 internal café-preview exception

The owner explicitly authorized exposing the two draft café adventures in the internal Editorial Review TestFlight build. Only the `editorial-beta` profile sets `extra.cafeEditorialPreview`; runtime `SHOW_CAFE_DRAFTS` exposes labeled preview-mode adventures and preview stamps. Production and ordinary preview profiles keep this flag false. `SHOW_REVIEW_TOOLS` remains development-only, and recording/microphone access remains excluded. This does not create accepted content, promote preview progress into accepted outcomes or authorize external beta/public release. The whole-library public release gate remains unchanged.
