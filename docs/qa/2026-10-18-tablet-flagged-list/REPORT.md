# English tablet Flagged Cards: maximum text and keyboard navigation

B08.5-B9a adds bounded large-tablet English list evidence on fresh-installed iPad Pro13 M4 / iPadOS26, UUID `DABA2821-3619-4F4A-B0C3-54E70B31511F`. Three own-container preflights bracket interaction/cold launch; normal product entry on localhost8098. Baselinecda709e CI39104782858 and board39104782836 passed, with101 suites/1008 tests. No runtime/source/dependency change or security work.

The initially proposed empty-state check was inapplicable: actual baseline contains20 flags from the previous supported full-state restore. These were preserved. No flags were cleared to manufacture an empty view; English empty acceptance remains open.

## Native observations

CUA Device Hub handled all UI. Settings language row switched Spanish→English, then Manage Decks → Review Translations → Flagged20 opened [the default list](default-en.png). Native Text Size3→11 produced [full header/count/actions, CSV guidance and first card](maximum-header-en.png). App's existing dark palette/native Light, VoiceOver off. Copy as CSV and Clear All were observed, never activated. Editorial content shown is still unaccepted development content; layout evidence is not language approval.

A coordinate drag `(1330,1100)→(1330,300)` did not move the viewport. A distinct native wheel scroll at `(1320,1040)`, down8 pages, also left it unchanged. Neither proves a product scrolling defect or touch-only reachability; the failed routes were not repeatedly retried.

Temporarily enabling Device Hub Capture Keyboard, clicking inert card content `(1220,800)` and pressing native End moved to [the complete final row20](maximum-final-row-en.png): full front/back/example and `ID: llan-020` are readable above the lower edge at maximum text. Native Home returned to the top header. This is specifically **keyboard navigation**, not successful touch scrolling or inspection of every intermediate row. The populated list has CSV guidance; no empty-state editorial disclaimer is claimed.

Capture Keyboard returned off and Text Size11→3. Three coordinate native Back actions returned through Review and Manage Decks to Settings. Language row restored Spanish, Home tab returned Home. After official terminate/launch with before/after own-path checks, [cold Home](cold-home-es.png) shows Spanish/default text. The known unsigned development notification-registration warning appeared and its close control dismissed it; no notification permission, signing or account configuration changed. Final inspector confirmed Text Size3, VoiceOver off and Capture Keyboard off.

## Stored-state evidence and scope

Five read-only snapshots show only temporary UI language changed while English was active. Both restored and cold observations equal all eleven original logical hashes. All20 flagged identities,48 decks/1402 cards, existing11 events, daily/new credit, schedules, Study queue, plan/mission and preferences remain exact; no journal remains. `verify-state.py` checks recorded invariants/own paths, not native layout or action provenance. Collector is retained; it does not write simulator state.

B08.5-B9a closes this bounded English header/final-row keyboard route only. Touch-only scrolling on this surface remains unverified; change input capability before retrying the same failed routes. English empty view/disclaimer, full intermediate content, narrow/window/rotation/theme/assistive/platform/signed/physical acceptance remain in wider B08/B12 parents. No speculative app fix or new product test was added. Blocked security B01.8-C2g remains skipped without retry/bypass; audio-design approval, Android agreements, editorial/recording rights, product/account/signing and actual human/device gates are unchanged.

Validation: passive verifier,11 simulator-isolation unit tests, full repository formatting and whitespace checks pass. Independent before-merge review checked the plan/report/checklist, scripts, five snapshots, three preflights and four PNGs with no Critical, Important or Minor findings. Product baseline remains successful101-suite/1008-test CIcda709e; no runtime source changed.
