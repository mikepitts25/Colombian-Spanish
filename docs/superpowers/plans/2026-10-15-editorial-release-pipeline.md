# Editorial status and release filtering

B03.3 under the authorized master plan. Implement a separate repository editorial ledger for deck/card text: draft, reviewed, needs-correction; stable card/deck IDs; an integer content version; exact teaching-content SHA-256 fingerprint; reviewer attribution/date/rationale. Reviewed requires an attributed human decision for the current content. Existing local reviewStatus is not editorial sign-off. Start with an empty ledger; never invent approvals.

Compute teaching fingerprints from text/examples, deck context, tags/register/region/IPA/conjugation; exclude schedule/favorites/legacy local review flags. Inventory exposes current fingerprint and effective status. Changed content makes previous acceptance stale. Validate duplicates, unknown IDs, unsupported schema, malformed status/reviewer/date/version and contradictory acceptance. Export a filtered JSON pack containing only current reviewed cards, preserving IDs and deck metadata. Reject empty release packs by default.

The current app still bundles the full development library. Add a production EAS build hook that fails if any bundled deck card lacks current text acceptance, instead of claiming the filtered artifact is already integrated into the runtime. Ordinary development/preview and validation builds remain usable. Manual/local/OTA release routes require the same explicit preflight; publishing remains unauthorized. Grammar outside decks, audio acceptance and human review remain separate gates. A later deliberately selected pilot library can use the filtered pack; this package does not silently delete learners' stored cards.

- [x] Pin ledger/status/fingerprint/filter/production-gate behavior with failing tests.
- [x] Implement ledger validation, deterministic inventory metadata, filtered export and production hook.
- [x] Document editor workflow, release limits and exact human dependency; full checks and independent review.
- [x] Merge/push, verify CI and record checklist evidence.
