# Store and release preparation

Updated **2026-10-16** for B14.1. [MASTER_PLAN.md](MASTER_PLAN.md), especially B03/B11/B12/B14, owns implementation and acceptance status. This file is preparation, not permission to publish or proof that a release is ready. No price, age rating, support boundary or store approval is assumed.

## Candidate facts and catalogue gate

- Repository configuration currently names Colombian Spanish, version 1.0.0, with iOS bundle ID / Android package `com.mikepitts.colombianspanish`. EAS uses remote app versions and production auto-increment; read the actual built candidate's identifiers/build number before submission. The in-app Settings version string is not evidence of the binary version.
- iPad is enabled and the configured interface is dark. Do not promise both themes or a fully accepted tablet experience yet.
- Development inventory: **47 decks / 1,392 cards / 1,392 bundled generated audio mappings**. The actual release count must come from the accepted release export. All current cards await current editorial acceptance; production content preflight intentionally blocks the empty accepted catalogue.
- Text mission and three-clip listening practice are development-only editorial previews. They must not appear in released-feature marketing until deliberately accepted and included in a candidate.
- There are no implemented payments, hosted conversation service, sync accounts or accepted human dialogue recordings. Do not advertise them or assign a price to hypothetical entitlements.

## Copy for candidate review

Working name: **Colombian Spanish**. Working subtitle: **Practice words and phrases**. Both need product selection and current store field validation before entry.

Candidate description draft, subject to accepted-content and device verification:

> Practice Spanish words and phrases for everyday situations in Colombia. Review cards at a manageable pace, save your own phrases, and back up your local learning progress.
>
> Use scheduled flashcard review, recognition quizzes, favorites and custom cards. Adjust pronunciation speed and choose whether revealing an answer plays its Spanish pronunciation.
>
> Bundled pronunciation is generated audio. Device speech may be used as a fallback for ordinary cards and can depend on installed voices. The app does not certify an accent, offer pronunciation scores or guarantee fluency.

Use this only if the final candidate contains the described features and accepted material. Add a factual release card/deck count only after exporting that library. Add an offline claim only after airplane-mode cold launch, all promised bundled assets and actual candidate/device acceptance. Do not include generated listening previews in public copy by implication.

Remove the historical “only app,” “clearest accent,” “master expressions,” “speak like a true Colombian,” “authentic recordings,” universal no-network/no-tracking and unsupported learning-effect claims. [Current competition and positioning](COMPETITIVE_ANALYSIS.md) documents the evidence and product hypothesis.

## Release gates

- [ ] **AI + language editor:** accept exact card/mission/audio versions; generate the selected release library and run content preflight. Region/register assertions, slang suitability and human recording rights require real evidence.
- [ ] **AI + owner:** verify final name, subtitle, descriptions, keywords, support contact and privacy/support URLs against actual behavior; keep gated/planned functionality out of screenshots and text.
- [ ] **AI + owner:** complete current age/content-rating questionnaires from the actual accepted catalogue, including slang, vulgar/flirty material and any later recording/service features. No default 4+ rating is assigned here.
- [ ] **AI + owner:** reconcile [privacy policy](PRIVACY_POLICY.md) and [data inventory](docs/privacy/DATA_INVENTORY.md) with the signed build's diagnostics/update behavior and account/service configuration. Fill accurate platform disclosures; file/clipboard export can transmit data outside the app.
- [ ] **AI + simulator:** capture actual candidate screens in both interface languages, supported layouts, long/large text and accessibility states. Choose required formats from current store submission guidance when preparing B14.5; do not reuse the old obsolete phone-size list or resize one layout as evidence of another device.
- [ ] **AI + device access:** build and test the named signed candidate on promised iOS/Android support boundaries and enabled iPads. Cover backups/restore/reinstall/upgrade, offline cold launch, interruptions, audio routes, permissions/reminders, accessibility, performance and crash behavior. Expo Go and JavaScript bundles are supplementary evidence.
- [ ] **Owner + AI:** confirm code licensing and content/asset/audio rights; the repository currently has no checked-in LICENSE file.
- [ ] **Owner + AI:** resolve developer identity, distribution/signing access, agreements, required account data and production settings. AI can prepare builds and metadata; owner actions and publication remain explicit.
- [ ] **Owner + AI, conditional:** select whether charging is justified, then implement/configure entitlements and restore purchases. Test purchase/cancellation/refund/offline/reinstall in the appropriate sandbox and on hardware before advertising paid access. No billing SDK/provider or price is selected by this document.
- [ ] **Owner:** approve the concrete candidate and submitted listing. Store submission/publication is not authorized by a development merge.

## Reproducible engineering checks

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand
npm run validate:data
npm run content:validate-reviews
npm run content:review
git diff --exit-code docs/editorial/content-review.json
npm run release:preflight
```

The final command is expected to reject the current unaccepted catalogue. A passing technical suite does not substitute for editorial, learning, privacy, physical-device or account acceptance. Use the master plan and dated QA reports to record exact candidate/OS/results, gaps and any deliberate scope reduction.
