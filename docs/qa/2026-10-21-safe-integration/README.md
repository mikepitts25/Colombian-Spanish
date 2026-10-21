# Safe TestFlight source integration — October 21, 2026

Base: main `92697365927c50217753b068c4f1510591143dfb`. The owner authorized merging only safe, useful iOS work with no conflicts or duplication of existing main behavior. Selection was prepared in an isolated worktree; the original local edits were preserved.

## Included

- Dedicated editorial-review beta profile, release-hook regression and strict public-production content gate; EAS upload exclusions, release handoff and historical beta/privacy evidence.
- All 60 corrected alternative-pronunciation MP3s, versioned manifest references and expanded transcript metadata, the developer recording generator/helper and generator regressions. Editorial inventory is regenerated to reference the actual replacement files. Deck/card identities, display text, review decisions and learner storage are unchanged.
- Flashcard horizontal responder capture/retention and only the three study-session ScrollView bounce/directional-lock properties, with their tests. No Study layout or theme changes are included.

## Excluded and preserved locally

Broader Study and Quiz layouts, palette changes, Android QA PR78, `.DS_Store` and local R history are excluded. The runtime `tts.ts` normalization and its tests are also excluded: Cartesian expansion of repeated inline slash alternatives can produce excessive output from ordinary editable/imported custom text. The normalizer is used only by the developer generation script in this integration. Existing runtime playback selects the corrected MP3s through the unchanged card IDs; device-speech fallback retains main's behavior.

The October21 swipe/audio notes in MASTER_PLAN and the swipe evidence folder describe historical working-tree checks. This document records the narrower selected integration. The earlier Apple build1.0.3 and its evidence remain a distinct candidate; these changes require a future build to reach TestFlight.

## Verification

Verification is performed with Node22.16.0 from a clean lockfile installation. Fresh local verification passes all117 Jest suites /1,187 tests, TypeScript, ESLint, formatting, all14 Python QA tests, calendar integrations, data/ledger validation and iOS project generation/export. Regenerating the editorial inventory changes only60 audio paths; all acceptance values and content fingerprints remain unchanged. After staging the refreshed inventory, regeneration leaves it unchanged. The public preflight and production hook both refuse1,392 unaccepted cards, while the editorial-beta hook explicitly reports that count and succeeds. Independent review found no remaining blocking issues after excluding runtime normalization. CI results for the exact committed tree are recorded in the pull request. iOS project generation and production JavaScript export are build-input checks, not native signing or hardware acceptance. No new TestFlight build, upload or release is performed by this integration.

Editorial acceptance, physical-device swipe/listening/fallback behavior and the existing named QA gaps remain open. Public `release:preflight` must continue rejecting all1,392 cards until attributed acceptance exists; the dedicated beta hook must report the unaccepted catalogue explicitly.
