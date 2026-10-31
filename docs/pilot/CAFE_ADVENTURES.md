# Café adventures: editorial review and first learner pilot

Prepared October 31, 2026. Draft material and an evaluation worksheet, not acceptance or learner results.

## Material to review

Review the two authored definitions in `src/adventures/content.ts`: Breakfast at Ana’s café (first-morning-medellin, version 2) and Back at Ana’s café (back-at-anas-cafe, version 1). The legacy firstMorning.ts draft is preserved for its existing consumers; it is not this pair's new version. Review every English/Spanish scene, cue, answer alternative, correction, hint and completion label, including `adventure.*` interface copy.

For each episode record the exact full identity from `adventureIdentity(definition, currentDecks)` and the authored-structure identity from `definitionFingerprint(definition)`. Recompute after corrections. The full identity binds required nodes, warm-up IDs and source-card teaching text, so a changed card or scene requires renewed acceptance. The manifest `src/adventures/acceptance.json` intentionally has no acceptance records.

A qualified human reviewer should check:

- Beginner comprehensibility, plausible café interaction and consistency of register/pronouns.
- Ana/Nico representation, recognition on the second visit and absence of claims about all Colombians.
- All accepted variants, including the water request; expand or correct variants when needed rather than treating the current finite matcher as exhaustive Spanish.
- Whether prompts/hints/corrections leak an answer before an assessed response. Warm-up is intentionally supported practice.
- English/Spanish help, incomplete outcome and support labels. A stamp means recorded task practice, never fluency or speaking/listening certification.

Only after genuine review, add the reviewed fingerprint/version, attributed human reviewer identity, date and status to the acceptance manifest. Existing card/audio acceptance and whole-library release requirements remain separate. Test-only synthetic acceptance fixtures are not records for this manifest.

## Small pilot worksheet

Use the existing [pilot readiness map](READINESS.md) to settle consent, candidate identity and collection arrangements before recruiting. Do not automatically collect analytics or personal data.

Record the exact candidate, locale/theme, available support, episode versions/fingerprints and agreed participant code. Do not record names or raw answers in the app. Begin with these observations:

1. Without explanation, can the learner identify the first action and understand the practical task?
2. Do they choose warm-up or hints comfortably? Can they explain the support label afterward?
3. Can they complete the visit, find their passport and recognise the invitation to the next visit?
4. Ask what, if anything, they want to return for; record their words rather than a leading satisfaction score.
5. If consented follow-up is arranged, note voluntary next-day and week-one return separately from prompted return.
6. Several days later, use comparable greeting/request/thanks cues outside the app, recording independent versus supported recall. Merely replaying the same scene or recognising a stamp is not retention evidence.

For each observation record: observed / not observed / not attempted, support offered, confusing point and one possible improvement. No target percentage, participant count or retention uplift is claimed. Review observations before adding further episodes.
