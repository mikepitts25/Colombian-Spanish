# Mini Home long-name visual acceptance

Current base main bb5f57c; product runtime ecf1a2e unchanged. Actual iPad mini A17 Pro/iPadOS26, explicit device `DF3686C1-A2E7-4870-B127-A83A8B67541D`. Installed foundation Debug binary was rehashed and matches metadata. Normal development JS uses Metro8099; no product, native, dependency or production gate change.

## Completed observations

The 100-character Spanish deck name is fully readable, wraps within its Home row and keeps its count text separate in all eight mini views: Spanish/English × Barrio Light/Dark × native Text Size3/11. See `fixture-metadata.json` for the exact image matrix. Default Spanish Dark, English Dark and English Light were positioned by coordinate drag. Spanish Light default and every maximum-size view used actual VoiceOver keyboard focus to scroll to the named action. The maximum Spanish Dark row remained fully visible after VoiceOver/Capture Keyboard were disabled; a coordinate tap opened the intended Study deck with six remaining cards. No flip, grade, hint or mission/quiz start occurred.

The focused maximum images show the full name, rather than inferring visual acceptance from AX text. The Spanish Dark Study header also shows the full name at maximum size; this does not change or broadly accept the existing Study header on other devices.

## Data protection and provenance

`build-fixture.py ORIGINAL NEW_OUTPUT` derives the fixture from this mini's own full v3 backup with eleven events. Only catchup-qa.name changes; no plan, session, card, preference or event is changed in the host fixture. The original and fixture SHA256 plus expected durable hashes are recorded in metadata. Raw backups remain temporary.

TextEdit's exact file URL was checked before Select All/Copy. Device Hub Edit → Send Clipboard transferred the file. Settings Import Backup/Allow Paste showed 48 decks/1402 cards/11 observations before Restore app state. An initial paste was denied before explicit transfer and reported empty clipboard; no state changed. The imported storage matched the one-name fixture, while Home retained the old in-memory title until the requested restart. Explicit own-container preflights bracket both cold launches. The fixture cold launch loaded the long name. Later Settings toggled the UI language and saved Barrio Light through the normal picker.

Nine read-only checkpoints prove the durable deltas: import/default/max changes only decks; deck activation adds only an ordinary six-card saved session (catchup4..9, no bounded limits); later matrix cells additionally change only the stated language/appearance preferences. Plan, missions, schedules, counters and all eleven event payloads stay exact. Full original Restore app state followed by normal cold launch returns all eleven key hashes to baseline. Final observed native state: Text3, OS Light, VoiceOver/Capture Keyboard off, original Spanish Barrio Dark Home. The known unsigned notifications diagnostic was dismissed through its visible close control.

## Remaining acceptance

This closes the mini long-name **visual** matrix and one coordinate activation after focus positioning. It does not close pure touch-only maximum positioning, phone long-name visuals, full assistive usability/announcements, live day/zone transitions, Android, signed release, physical-device or editorial acceptance. Native input was intermittent: several immediate post-navigation/font-change drags did not move content; live font change with VoiceOver on needed toggling VoiceOver off/on to restore focus navigation. These are recorded input observations, not a diagnosed product defect or a passing touch-only result. All actual launches used the named device; phone and alias devices were not operated.

Run `python3 docs/qa/2026-10-18-barrio-home-long-label/verify-evidence.py` to check committed snapshots, expected fixture hashes, exact session/prefs deltas, original restoration, eight image-matrix entries and ten PNG digests. This passive verifier does not replay native input, independently measure native font size or prove absence of transient writes between checkpoints.
