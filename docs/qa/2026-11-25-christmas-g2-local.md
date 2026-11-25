# Christmas local accessibility and recovery checks

November 25, 2026. These checks cover the proposed free-only iOS release from the Christmas checklist worktree.

## Route and accessibility checks

- Production navigation exposes 23 learner surfaces across the tab and stack routes. The five developer routes remain gated. Expo's Christmas iOS configuration disables café previews and over-the-air updates. Introspection returned no microphone usage key or microphone entitlement.
- The Home pronunciation control and Study search pronunciation controls now have 48-point targets.
- Classic Study and Difficult Words interval labels now use the opaque grade colors. Measured ratios are 5.35, 5.00, 7.48 and 4.56. The enabled Classic End plan label now uses an existing role with a 6.45 ratio on its background.
- The crash screen scrolls at larger sizes, identifies Retry as a button, and tells the learner that recent changes may be unsaved.
- The theme audit still reports 57 pre-existing Classic exceptions across the wider token matrix. Real VoiceOver focus order and performance on an older supported phone remain open.

## iPhone response and feedback

The local iPhone 17 fixture completed the first café visit in English, earned an unassisted stamp, and showed the action to start the second visit. The simulator used synthetic editorial records and a separate installation. The response field and Check reply were visible above the software keyboard, and correct feedback was visible after submission. [Reply with keyboard](2026-11-25-christmas-fixture/iphone-reply-keyboard.png) · [Correct reply feedback](2026-11-25-christmas-fixture/iphone-reply-feedback.png)

The iPhone replayed the first visit, completed the second, and showed one stamp for each in the passport. The walkthrough's later assumption that an all-correct visit would offer a phrase review failed. Phrase review is conditional on items marked for review. [Both stamps after replay](2026-11-25-christmas-fixture/iphone-both-stamps.png)

## iPad at maximum Dynamic Type

On an iPad (A16) running iOS 27.2 at the largest accessibility text size, the Spanish walkthrough completed both visits and opened the second stamp from the completion screen. The test verified correct responses through the software keyboard and scrolled to reachable actions. The native fixture's saved data contained exactly two independent outcomes, one for each approved-version fixture visit. The run's general ScrollView identifier assertion failed against the native accessibility tree. The open passport was observed in the simulator and the stored outcome count was checked separately. [Open passport at maximum text size](2026-11-25-christmas-fixture/ipad-large-passport.png)

On a separate iPad launch, the free Library reported four starter collections and 61 cards. The native test also checked that the unlock action was absent. [Free Library](2026-11-25-christmas-fixture/ipad-free-library.png)

## Backup and reminder checks

On iPhone 17, the Settings action produced a native version-3 JSON file with all four decks and 61 cards, both café outcomes, and 12 learning events. The simulator fixture used synthetic progress from the completed café walkthrough. [Backup controls](2026-11-25-christmas-fixture/iphone-backup-settings.png)

The first native iPad import attempt reached the Files folder but stopped before selecting the JSON. The follow-up generated a fresh v3 export in a separate source app on the iPad and found it through the native Files search. The destination app previewed and restored it. A comparison against the source export confirmed all 61 card records, both stamps, and eight learning events. The destination stayed in the free cohort. [Native restore confirmation](2026-11-25-christmas-fixture/ipad-native-restore.png)

The version-3 café backup integration test serializes and parses the export, clears destination storage, restores into that storage, and compares the exact adventure records, passport stamps and learning events.

The app navigation harness uses the real Reminder Word screen. It verifies that a valid notification tap while the app is running opens the promised word, an expired cold-start tap shows an explanation and a route to Home, and neither tap writes study credit.

The signed candidate still needs a physical-device file handoff, delivered notification taps, audible playback, headset and interruption checks, and signed purchase restore.

## Bundled playback and VoiceOver

On the iPad A16 simulator running iOS 27.2, tapping the speaker beside **Gracias** in Study search played the bundled clip for card `1148`. Fixture-only logging captured the native player loading the file and reaching the end at 0.836 seconds. All 61 packaged pronunciation clips decoded with audio signal.

The Study search result originally grouped Listen with the whole row in the native accessibility tree. Study and Listen now use sibling buttons with separate accessible names in both languages. On the iPhone 17 simulator, VoiceOver read **Study Gracias. Thank you** as a button and reached **Listen: Gracias** on the next swipe. Tapping Listen left the search visible. The regression test confirms that Listen plays audio without starting or changing a study session. [Separate Listen focus stop](2026-11-25-christmas-fixture/iphone-study-voiceover.png)

Actual VoiceOver output, read through Xcode 27.2's VoiceOver test service, confirmed that opening the passport from Progress landed on **Close passport**. Moving forward read **Your practice passport** as a heading. Dismissing the modal returned focus to **Open passport**, which announced two stamps. The final native run passed all four tests, including restoration of the original VoiceOver setting. [Study playback control](2026-11-25-christmas-fixture/ipad-study-listen.png) · [Passport with VoiceOver](2026-11-25-christmas-fixture/ipad-passport-voiceover.png)

## Automated regression

The final Jest verification passed 1,495 tests across the full run and an isolated rerun. A Jest worker exited with SIGSEGV while loading the asset-validation suite in the full run. The remaining 137 suites passed. All 10 asset-validation tests passed in the isolated rerun. Typecheck, lint and formatting checks passed.
