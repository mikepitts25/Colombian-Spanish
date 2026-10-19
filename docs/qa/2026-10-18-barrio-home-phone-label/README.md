# Barrio Home phone long-title checks — 2026-10-18

Bounded follow-up to the mini's eight-view matrix. No product code, dependency or native binary changes. Base main `c8b8585`, runtime `ecf1a2e`, unsigned Debug binary, normal development JS from localhost8099. Explicit phone UUID `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730`; installed executable SHA256 and SE3 device type rechecked in this batch and recorded in `fixture-metadata.json`.

## Observed results and open cells

The phone's own 48-deck/1,402-card/10-event backup was copied on the host, changing only the first deck's name plus Barrio Light preferences. The 100-character name is **Conversaciones largas para conocer el barrio y preparar un viaje por Colombia sin perder el contexto**. Supported Settings Import Backup → Restore app state, then explicit UUID cold launch, loaded the fixture. The mini's separate 11-event original was not imported or operated on in this batch.

| Language | Barrio appearance | Native Text3                            | Native Text11                                                                                 |
| -------- | ----------------- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| Spanish  | Light             | Full title and count, three title lines | Full title across four overlapping views; count not fully captured                            |
| Spanish  | Dark              | Full title and count, three title lines | Full title across four overlapping views; count not fully captured                            |
| English  | Light             | Full title and count, three title lines | Not exercised                                                                                 |
| English  | Dark              | Full title and count, three title lines | Partial title across three views; `conocer el` clipped at page boundaries; full count visible |

See `fixture-metadata.json` for exact PNG mapping. Four default-size title/count cells and two Spanish maximum-size **title-only** cells are evidenced. This is not a completed eight-cell phone matrix. The Spanish Light maximum views precede `phone-deck-opened`; the Spanish Dark and English Dark maximum views have dedicated checkpoints. Screenshots are point observations, not simultaneous views or proof that the whole row fits on one screen.

Default title/count views used touch scrolling with VoiceOver off. At maximum size the title is much taller than the viewport; the enlarged bottom navigation occupies substantial screen height. VoiceOver keyboard focus plus Option-arrow paging exposed the captured sections. Apple documents these scrolling keys in its [iOS26 external keyboard VoiceOver guide](https://support.apple.com/guide/iphone/use-voiceover-with-an-external-keyboard-iph6c494dc6/26/ios/26). Focus sometimes moved into fixed navigation and paging then stopped; moving focus back into content changed the result. Paging boundaries required alternate overlap views. No inference that clipping at a page boundary is product truncation.

Small wheel input did not position the intermediate content. A gutter drag followed by a stopping tap flung farther up instead. Control-Option-PageDown opened Control Center; Escape closed it without settings changes. These routes did not establish touch-only maximum-size acceptance and should not be repeated unchanged.

While positioning Spanish Light at maximum size, a coordinate click on the visible deck opened Study. This was an incidental activation, not a planned touch-target acceptance test. `phone-maximum-study.png` and `phone-deck-opened` record the result: correct ordinary six-card queue `catchup-4` through `catchup-9`, region all, no plan limits. No card flip, grade, hint or mission action followed. Only the ordinary-session record changed. Later UI language toggles and saved theme changes affected only preferences. Plan, mission runs and all ten learning events stayed unchanged at the checkpoints.

## Restoration and evidence limits

The original backup was opened by exact file URL in TextEdit, copied, previewed as 48 decks/1,402 cards/10 observations, then restored through Settings. Before/after explicit UUID preflights surround the normal8099 cold launch. `phone-restored` equals `phone-baseline` and the prior fixture batch's `phone-restored` across **all 11 canonical persisted-record hashes**. Original Classic/Spanish returned visibly. Native Text3, OS Light, VoiceOver off and Capture Keyboard off were observed after restoration. The known unsigned-debug notification persistence diagnostic was dismissed; this is not notification acceptance.

`native/native-state-check.json` has ten read-only own-container checkpoints. `images.json` hashes all17 original simctl PNGs. `build-fixture.py` reproduces the host fixture from the private original; raw full backups are not committed. `verify-evidence.py` checks captured state consistency, expected fixture/session/preference deltas, original restoration and PNG inventory. It does not replay gestures, verify spoken announcements, observe transient writes between checkpoints, prove OS settings, or establish signed-release/physical accessibility acceptance. The collector's journal consistency checks are point observations.

Run from the repository root:

```sh
python3 docs/qa/2026-10-18-barrio-home-phone-label/verify-evidence.py
python3 -m unittest discover -s scripts/tests -p 'test_*.py'
```

Remaining: English maximum-size title coverage, complete Spanish maximum-size count views, precise touch-only middle/primary positioning, live day/time-zone transitions and the other open Home acceptance cells. Home Task4/C3e stay open. No security work was attempted.

## October19 continuation

[C3p](../2026-10-19-phone-max-label/README.md) now verifies both missing English maximum title/count cells with four overlapping native views per theme, including conocer el. The original eight-cell table above remains the historical October18 result. Combined title coverage is eight of eight; full count coverage is six of eight. Spanish maximum counts Light/Dark, touch-only positioning and broader Home acceptance remain open. C3p restores its October19 baseline exactly, including the naturally advanced daily date.
