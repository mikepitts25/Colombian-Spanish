# Café Home verification — November 3, 2026

Implemented the owner-approved illustrated café Home in both existing themes. Native text and controls sit around bundled day/night artwork; afternoon adds a warm wash. Home keeps the existing controller, bounded session recommendation, exact retry intent, daily-plan precedence, topic chooser, and adventure eligibility. Existing word audio, tools, Favorites, Explore, direct deck starts, and detailed statistics remain below the invitation. English uses Practice and Neighborhood.

## Automated evidence

- Full Jest command: `npm test -- --runInBand --watchman=false` — **128 suites, 1,317 tests and 1 snapshot passed** (121.204 seconds).
- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run validate:data` — passed. Data validation: 47 decks, 1,392 cards, 1,392 audio entries.
- Existing color inventory updated through `node scripts/audit-theme-colors.js --record`: 267 classified literals, 418 composited theme contrast pairs, zero audit errors. Café colors are centralized separately from other route themes.
- Nine additional café text/control contrast pairs pass at 4.5:1 or better; actual minimum **8.15:1**. See `contrast.json`.
- New coverage verifies US-English primary handoff in both themes, preserved Favorites/Explore routes, local-hour boundaries, exact next-minute changes, foreground refresh, focus/background pausing, live Reduce Motion, and delayed-query races. Existing real-provider tests retain budget, retry, saved-plan, and read-error coverage.
- First new Home tests failed on the old interface before implementation. Review findings for lost tool routes and minute alignment each received a failing test followed by a passing implementation.

An earlier full run exposed stale UI-label assertions and the expected color-inventory changes; these were updated for the approved interface. One intermediate full run had a transient failure in the unchanged AddCard retry test (`retains the exact failed card payload and identity for retry instead of losing or duplicating it`). The final complete run passed it without an AddCard source change. The test runner retains an existing Expo notification warning in the navigation suite; it reports no test failures.

## Native rendering

Used a new dedicated iPhone 16 Pro / iOS 27 simulator, `3AA6A4B7-A29E-465E-A0BC-0B450B208AC8`. `preflight.json` verifies the fixture data container resolves inside this device. Seeded only this new simulator with completed onboarding and English preferences, retaining its ordinary free library. No existing simulator data was copied or overwritten.

Exported the final iOS JavaScript and assets into a copy of an existing compatible local simulator native shell. Expo Updates is disabled only in this temporary copied shell at `/tmp/cafe-home-native`. This is native rendering of the current source, not a fresh Xcode archive or a signed release.

- `morning.png`: launch process timezone `America/Los_Angeles`, actual local morning greeting, clear daylight artwork, morning surface.
- `afternoon.png`: process timezone `America/Bogota`, actual afternoon greeting, warm daylight artwork and afternoon surface.
- `evening.png`: process timezone `Europe/Berlin`, evening greeting, night artwork and café lamplight.
- `large-text.png`: maximum iOS accessibility text size. Decorative headings are bounded and the illustration is omitted to prioritize content; primary/secondary controls remain in the scrolling layout. Café navigation labels remain readable.
- `steam.mp4`: short native screen recording of the decorative steam. Animation uses the native driver, does not hold an interaction handle, and is stopped on blur/background or Reduce Motion.

Inspection of the first maximum-text render led to the compact decorative header and bounded tab labels. Independent code review also caught missing existing tool routes and the former nonstacking secondary layout; those findings were corrected.

Adventure content was not artificially accepted to create a screenshot. The compact invitation continues to use the existing availability and historical-entry checks.

## Limits

Native Simulator UI control was unavailable through the connected computer-use surface, so no claim is made for native tap/scroll feel or VoiceOver interaction. Native screenshots and recording establish rendering; automated interaction tests establish controller handoff. Physical-device interaction, animation comfort, and a fresh signed build remain unverified. No TestFlight or App Store change was performed.
