# Barrio Home — actual mini completed state and theme persistence

2026-10-18, documentation/evidence only; base main `3881d7f`, unchanged runtime
`ecf1a2e` on Metro8099. Native preference changes, import, taps and drags used
Device Hub through CUA. Official explicit-UUID simctl launch/screenshots and
read-only own-container captures used pre/post-launch isolation checks.

Device: iPad mini A17 Pro, iPadOS26, UUID
`DF3686C1-A2E7-4870-B127-A83A8B67541D`. Reused verified foundation Debug binary
SHA256 is in fixture-metadata.json; no native build, dependency or runtime edit.
Normal development JavaScript throughout; this is not signed Release acceptance.
The known unsigned notifications/keychain banner was dismissed before screenshots.

## Verified

- Supported clipboard import preview showed48decks/1402cards/11observations and
  acknowledged Restore app state. Host fixture changes only completed plan day
  to2026-10-18 and preferences to Barrio/System/English. The completed mission
  run and all learning history are the existing initialized mini fixture, not
  newly earned results. All11 imported key hashes match independently derived
  expected fixture hashes.
- Home says “Today's plan is complete”, both selected steps Finished and optional
  practice available. A visible coordinate tap on View completed plan opens the
  existing completed summary; all11 keys unchanged. Return Home works.
- Live OS Light→Dark updates Home with all11 hashes unchanged. Save Classic,
  return to original Classic Home, then choose/save Barrio: System is remembered,
  completed plan and all11 hashes return exactly. Normal cold restart preserves
  the same11 hashes and System dark Home.
- Default-text coordinate drag reaches the lower tools, due deck, Browse all
  decks and development previews. A visible coordinate tap on Catch-up QA opens
  Study at Hola4 with6remaining. This deliberately starts ordinary deck practice:
  exact queue catchup4…9, region all, no bounded limits. Only the ordinary saved
  session key changes; completed plan, mission, decks and11events stay unchanged.
  No grade, hint, quiz Start, or mission completion submitted.
- At maximum native text11, a center drag did not move the viewport; an edge
  drag reached the bottom. The bottom screenshot shows full wrapped preview
  labels and two-row tabs. Reverse edge drag returned to the top; wheel0.2 did
  not establish intermediate positioning. **Precise middle/primary touch
  positioning remains open**, along with full visual long-deck acceptance.
- Restored OS Light/Text3/VoiceOver off/Capture Keyboard off, then imported the
  original mini backup through normal Restore app state and cold restarted.
  All11 hashes exactly match the original baseline,48/1402/11events,
  BarrioDark/Spanish and prior-day completed plan restored. The phone was not
  operated in this mini batch; its previous restore evidence is separate.

## Reproduce and verify

`python3 docs/qa/2026-10-18-barrio-home-mini-state/verify-evidence.py`

This passive verifier checks committed snapshots, available field hashes,
fixture hashes, exact complete saved deck session, restoration, preflights and
image digests. It does not replay or prove UI gestures. All9 PNGs were observed
through CUA before official screenshot capture. Maximum-text bottom has a PNG
but no separate storage snapshot; no per-gesture persistence claim is made.

`build-fixture.py ORIGINAL NEW_OUTPUT` creates a host-only supported-import
fixture, refuses overwrite, and never accesses simulator storage. Its output
content was independently compared with the imported host fixture. Original
backups stay outside git; metadata includes their hashes. Capture script is the
unchanged robust read-only collector from the phone follow-up.

Restoration navigation included a recovered stale AX index opening the local
backup share sheet and an incidental audio-preferences visit. No external share
was submitted and no audio setting was saved. Correct supported clipboard
preview/restore was then visibly confirmed, followed by exact hash restoration.

## Still open

Home native goal edit, failure/retry and day-change cells; precise middle/primary
maximum-text touch positioning and full long-deck visual acceptance. Runtime
empty-library cold import follows the existing reseeding policy (see phone
report); do not repeat that as persistent-empty acceptance. Physical audio,
assistive-user, signed build/account and editorial gates remain unchanged.

Prior phone QA [PR20](https://github.com/mikepitts25/Colombian-Spanish/pull/20)
merged3881d7f; all4 main CI jobs passed
[39145635092](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39145635092)
and deployment
[39145635122](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39145635122)
passed. Its independent reviewer found no Critical/Important issues. Deferred
minor: its passive verifier does not enforce the full ordinary resumed review
queue/limits/deck/session identity, although the recorded data was independently
correct. This batch does not alter that reviewed verifier.
