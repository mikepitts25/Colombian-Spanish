# Café adventures and passport verification

October 31, 2026. Implementation on `codex/cafe-adventures`, based on approved design commit `7e0d327`. This report distinguishes automated behavior, native startup and unverified native interaction.

## Implemented

Two connected café visits with Ana and Nico, optional three-phrase warm-ups, durable story milestones and passport stamps. Both Home themes expose an optional adventure entry after the main daily action. Progress contains the passport. A saved daily plan remains primary and keeps its original identity.

The mode-scoped store preserves legacy mission state and records required-node evidence. Correct retries can qualify; skipped incorrect or accent-only responses cannot. Warm-up support is recorded in both stamps and learning events. Replay cannot duplicate stamps, downgrade the best support status or relock visit two. Backup replacement includes adventure progress, with older backups restoring an empty collection and explicit user-facing warning.

Content is bound to exact fingerprints, including authored structure and referenced teaching text. Stale first starts and pending retries retain the originally displayed identity. Changed unfinished visits ask before replacement. Historical authored structures remain readable without being silently adapted to new nodes. Malformed known-structure imports fail before writes.

The acceptance manifest is intentionally empty. These stories are development previews, not accepted public teaching content. Ordinary builds cannot open draft routes or earn accepted stamps. Genuine language review, device acceptance, retention observations and publication are separate.

## Automated evidence

- Baseline: 123 Jest suites / 1,241 tests passed before implementation.
- Final full-suite result is recorded in `verification.json`.
- TypeScript, ESLint, full-repository Prettier and `git diff --check` passed.
- Data validation retained 47 decks, 1,392 cards and 1,392 audio references.
- Editorial-ledger validation passed structurally and still reports all 1,392 cards awaiting current acceptance.
- Calendar/timezone checks and the semantic-theme inventory audit passed; the inventory was regenerated for the new themed controls and shifted source lines.
- Fresh independent review found six material cases across two reads. All were addressed; the reviewer independently reran the content/storage/scene tests (3 suites, 30 tests) and found no remaining Critical or Important issue. The minor completed-visit action label was changed to “View saved visit.”

Coverage includes complete visit and next-visit handoff in both themes; warm-up reveal after persisted support; hidden release drafts; required-node qualification; correct retry and accent correction; mode coexistence; legacy-state preservation; no daily/SRS inflation; no stamp downgrade; stable unlock; stale content; malformed imports; old-backup reset; interrupted answer and final-completion recovery; historical node changes; and adapter binding across failed-start retries.

## Native attempt and limits

Created a fresh iPhone 16 Pro / iOS 27 simulator, `D526D97E-05FD-4830-A49D-288A3896210C`, without cloning or changing the pre-existing Library QA simulator. The saved preflight reports establish that this device's app data container resolved to its own device root before and after launch.

Exported the current ordinary iOS JavaScript bundle and all referenced assets successfully. Installed it in a copied, existing local simulator native shell with the same dependency set; this is not a freshly compiled or signed native release. The ordinary app booted to Home and retained the free starter library; see `ordinary-home-smoke.png`. Draft adventure entry is correctly absent in this ordinary build. This is startup evidence only.

Device Hub control acquisition timed out, so no reliable native touch/scroll/keyboard/VoiceOver session was available. A development bundle embedded into the Release shell failed with “Cannot create devtools websocket connections in embedded environments.” An additional temporary render fixture did not provide usable adventure-screen evidence and was removed from the source tree. Neither attempt is counted as acceptance. The isolated copy had Expo Updates disabled to avoid the earlier failed embedded-bundle recovery; this was confined to `/tmp/colombian-cafe-native`, not app configuration or source.

The new adventure tap-through, cold-resume UI, large-text/keyboard/restore interaction and physical-device comfort remain unverified natively. Automated tests do not close those gates. The dedicated simulator was shut down after collecting the ordinary startup screenshot; no unrelated simulator, source app, service, account or release state was changed.

## Editorial and learner handoff

The [pilot/editorial worksheet](../../pilot/CAFE_ADVENTURES.md) names both definitions, the exact identity functions and the observations to collect. It supplies no fabricated acceptance records or learner outcomes. Use a genuine development build for hands-on adventure review; the regular release entry retains its strict availability gate.
