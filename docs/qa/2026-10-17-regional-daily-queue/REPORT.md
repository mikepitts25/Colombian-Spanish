# Regional daily queue — 2026-10-17

## Behavior and bounded design

Home previously ranked decks using the learning profile but Study lost the regional preference when selecting fresh cards. The shared scheduler now selects overdue reviews first without regional exclusions, then preferred regional fresh cards followed by general content. Other regional fresh cards are excluded only for a preference-based Home start. Recommendation counts and estimates use the same eligible bounded queue. Purpose ranking, daily new-card budgets, level/time limits and default unrestricted browsing remain in place.

An explicit Study filter overrides the inherited preference. Saved queues resume their exact IDs, order, session identity and limits instead of selecting again from changed recommendations. Optional trip date remains editable profile data; this package does not add urgency scheduling, an applied activity or measured duration calibration.

## Automated verification and review

- Initial regressions failed for scheduler order, recommendation eligibility/counts, Home handoff and Study forwarding; all passed after implementation.
- Actual DeckProvider storage fixture verifies cross-region due priority, preferred fresh selection and the daily new-card cap; default browsing remains unrestricted.
- Exact mixed-region saved queue resumes despite changed eligible suggestions. Six purpose cases preserve existing deck recommendations.
- Independent review found a P2: tapping the already-selected All filter could not clear an inherited Home preference. A new regression failed, then passed after clearing the preference and triggering queue reconstruction.
- Final full suite: **81 suites / 811 tests passed**. Typecheck, lint, calendar zone matrix (16), data validation (47 decks / 1392 cards / 1392 audio entries) and editorial ledger validation passed. Editorial validation still reports **1392 cards awaiting human acceptance**.

## iOS simulator evidence

Dedicated iPhone 18 Pro / iOS 27 QA simulator, existing unsigned SDK57 development client with the current Metro source. Saved travel/Paisa/beginner/three-minute preferences produced a Travel suggestion with general-content fallback. Home opened `boleto` directly with the three eligible fresh IDs `0039`, `0045`, `0046`, limits 4 total / 3 fresh.

- [Home suggestion](home-paisa-three-minutes.png)
- [Direct Study fallback](travel-general-fallback.png)
- [Cold resume](cold-resume-three-cards.png)
- [Read-only native state comparisons](native-state-check.json)

Tapping explicit Todo started a new session identity while retaining bounds. Terminate/relaunch and Continue preserved that session identity, exact three-card order and limits. No grades were submitted: daily count 1, new count 1, six learning events and all 1392 cards remained unchanged, with an identical SHA-256 of deck data throughout.

Cleanup used the app's normal backup-file restore, restarted the app, and restored Spanish UI through Settings. Final read-only comparison matches the original preferences, eight-card Business queue, session identity/timestamp, daily counters, history count and deck hash. This normal restore is **not** evidence for interrupted restore recovery.

The native Travel deck is general content: this proves the fallback and preference handoff, not mixed regional ordering on device. Mixed regional ordering is covered by scheduler and actual-provider fixtures. The unsigned client displays the known expo-notifications missing-keychain-entitlement warning; notification delivery/signing, Android interaction, physical-device checks and timezone acceptance are not claimed.

## Checklist scope

B05.2-A/B1/B2 together complete B05.2 and B05.2-B: editable profile, purpose/region recommendations, general fallback, time/new-card bounds and exact resume. B05.3-B, B05.4-B and B05.5-B remain open for their broader contracts.
