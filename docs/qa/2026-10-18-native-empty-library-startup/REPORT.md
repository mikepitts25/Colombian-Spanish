# Native startup from zero stored decks, with preserved history

B02.6-B2b records a bounded iPadOS26 Spanish/default-text startup fixture and Home/Progress refresh on fresh-installed own-path DABA2821-3619-4F4A-B0C3-54E70B31511F. Baseline12eb4f4 CI39106179353 and board39106179340 passed;101 suites/1008 tests. Normal product entry on localhost8098; no runtime, dependency, content or startup-policy change.

## Existing policy and actual native result

Code inspection established `DeckProvider.seedOrMerge`: an empty stored array seeds bundled decks, while missing bundled decks are merged during later startup. Existing provider initialization tests explicitly exercise seeding and new-deck merge. This report verifies that policy, not persistent empty-library support. The broader runtime-empty/upgrade contract remains open.

Before import, read-only own-container capture and validated local v3 backup preserved all eleven original records:48 decks/1402 cards/20 flags/11 observations. A derived local v3 fixture changes only decks to[], retaining all app state/history. Both import files are temporary; fixture metadata/hashes and generator are retained. `build-backup.py` requires a matching live baseline; passive verification does not require or reconstruct those future temporary files. The collector now tolerates no first card by recording null; no simulator state is edited directly.

CUA TextEdit Open/Select All/Copy → Device Hub Send Clipboard → Settings Import Backup/Allow Paste opened [the accepted0-deck/0-card/11-observation preview](empty-preview-es.png). Restore app state persisted exactly[] with all ten other key hashes unchanged before restart. The acknowledgement requested restart; no immediate in-memory Home refresh was claimed.

Official terminate/launch with before/after own-path preflights loaded [Home with0 reviews due,1392 new library cards, new allowance10 and unchanged goal0/5](seeded-home-es.png). Suggested deck changed from missing Catch-up QA to Greetings. This observed startup count plus the known seed policy supports the seeded-library interpretation; every seeded content field is not individually inspected here. No plan was started or grade submitted.

Coordinate Progress navigation displayed [1392 total cards,47 decks,0 in review/0 due, unchanged streak1 and goal0/5](seeded-progress-es.png). Practice evidence retained1/2 checked recall responses and9 self-rated attempts. Read-only snapshot confirms all eleven observations, plan/mission, original saved Study session, daily/new counters, streak, preferences, seen words, quiz history and reminder preferences remain exact; only decks differ. This is a populated seeded-library view, not an empty Progress acceptance claim.

## Exact original restoration

Native TextEdit copied the distinct original48-deck backup. Send Clipboard → Settings Import/Allow Paste opened [the48-deck/1402-card/11-observation preview](original-preview-es.png). Restore app state acknowledged success. Immediate saved state matched all eleven original hashes, including all20 flags, synthetic edits/schedules and original three-card Study queue. A second official cold launch with before/after own-path checks matched the complete baseline again; [final Home](final-home-es.png) returns to original Catch-up QA suggestion and1 due review. This is read/navigation evidence, not a new Study-resume/grade claim.

Native Text Size stayed3, VoiceOver/Capture Keyboard off, native appearance Light/existing app dark palette. Known unsigned notification-registration warnings appeared after each launch and their close controls dismissed them; no permission/signing/account configuration changed. All app input used screenshot coordinates; Device Hub app AX nodes were intermittent/omitted. No alias/source device was operated.

Six snapshots/five preflights and `verify-state.py` establish actual zero-deck storage, subsequent47/1392 counts, preservation of all ten non-deck records and exact original restore/cold hashes. They do not prove UI semantics/action provenance; retained screenshots and observations supply the bounded native evidence. No speculative product fix or new behavior tests were added. Live timezone/DST, runtime-empty views, all fresh/returning/upgrade paths, themes/large-text/assistive/platform/signed/physical acceptance remain open. Security B01.8-C2g remains skipped; audio design approval, Android agreements, editorial/recording rights, product/account/signing and genuine human/device gates are unchanged.

Validation: passive verifier,3 focused suites/67 tests, full repository formatting and whitespace checks pass. Independent before-merge review checked all six snapshots, five preflights, five screenshots, generator/metadata, collector null guard and checklist/report scope with no Critical, Important or Minor findings. Runtime unchanged; successful baseline101-suite/1008-test CI remains the product result.
