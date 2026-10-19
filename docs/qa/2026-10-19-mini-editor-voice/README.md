# Smaller-tablet editor and active-voice bundle

October 19, 2026, unchanged source main `3555ca0`. One existing own-path iPad mini A17 Pro / iPadOS 26 development simulator, `DF3686C1-A2E7-4870-B127-A83A8B67541D`, ran normal SDK57 JS from the barrio-controls worktree on Metro8099. No product/native/dependency changes. This packet closes only B08.5-B8j and B09.2-B2f; all five QA packages retain open cells.

## Spanish editor: maximum-text portrait and landscape

Settings → Manage Decks → Review Translations opened the editor without starting an ordinary Study session. Its original translation was `Hello 0 — independent tablet retry`. A cancel-only 610-character translation draft was entered at Text3 with the software keyboard visible. Live Text3→11 retained the draft; the [landscape AX draft](editor-es-retained-draft.txt) matches all 610 characters. The font change hid the keyboard. That first keyboard-hidden image was rejected; refocusing the filled native field reopened the keyboard.

- [Portrait](editor-es-portrait-keyboard-actions.jpg) shows all four complete Spanish maximum-text action labels together above the open keyboard: Anterior, Saltar, Necesita revisión nativa and Guardar y seguir. Previous is disabled on the first card as expected.
- Rotating left retained the draft and open keyboard. Accessibility positioning produced a [lower-actions view](editor-es-landscape-keyboard-save.jpg) with full native-review/Save labels, then a [Previous/Skip view](editor-es-landscape-keyboard-previous.jpg). These are separate real viewports, not simultaneous full-screen coverage or a composite.
- The visible native Back arrow canceled the draft. No Previous, Skip, native-review or Save action was submitted. All eleven durable hashes remained unchanged.

This extends the already fixed measured-header avoidance to the actual smaller tablet's Spanish portrait/landscape keyboard-open cells. The phone regression and bilingual phone acceptance from B8i are reused, not rerun. Positioning was accessibility-assisted; the coordinate Back action is not a full touch-only or assistive-navigation pass. It does not accept the entire editor, other themes/platforms, signed builds or a saved long-card patch on this mini.

## English attempt: keyboard-open action cells remain unverified

The normal Settings language toggle changed only uiLanguage. Reopening the editor showed the original translation, confirming the canceled Spanish draft was absent. The same long draft was entered and retained through live maximum text. Refocusing opened the keyboard, but the first action-target positioning stayed at [the long translation field](editor-en-portrait-draft-only.jpg), without action visibility.

Focusing the separate example field eventually changed the native field/AX structure. One stale action identifier was rejected; a fresh full tree was used rather than activating a stale control. A screenshot-grounded outer-margin drag exposed the actions **after dismissing the keyboard**, so it was rejected as keyboard-open acceptance. Device → Keyboard → Toggle Software Keyboard left [the keyboard hidden](editor-en-toggle-keyboard-hidden.jpg); no hardware-keyboard option was changed. These failed routes were stopped. No English landscape acceptance is inferred or claimed.

English maximum keyboard-open portrait/landscape action views therefore remain open; do not repeat these field-target, margin-drag or unfocused-toggle routes unchanged. No app defect is diagnosed from them. The English draft was canceled with native Back. Restoring Spanish through the normal toggle recovered the exact original preference object without importing a backup.

## Active voice capture, rotation and retained take

The mini began with unasked microphone permission and zero take files. Record requested the actual prompt; Allow granted permission without creating a take. A subsequent Record entered [portrait recording](voice-portrait-recording.jpg). Native Rotate Left retained active capture in [landscape](voice-landscape-recording.jpg), with the same PID96799. AX sampled11seconds and the subsequent screenshot15seconds; those observations are sequential, not an atomic frame.

Stop in landscape produced [one take lasting 20.1 seconds (305 KB)](voice-landscape-take.jpg) and one `.m4a`. Rotate Right retained that [same take in portrait](voice-portrait-retained.jpg). Live maximum text and another landscape rotation retained the same displayed duration/size. After accessibility positioning, [all five maximum-text landscape action labels](voice-max-landscape-actions.jpg) are complete; Record is disabled while a take exists. Delete there returned ready with Replay/Delete disabled and zero files. Default text and portrait were restored before editor work.

This proves the distinct smaller-tablet active-capture rotation/retained-take case. It does not prove sound quality, uninterrupted acoustic content, playback-end behavior, real calls/routes, English/theme/window matrices, Android or signed/physical acceptance. The older written-alternative rotation, phone live-font and background/permission packets are reused within their existing bounds. Actual audio is not committed.

## State, provenance, cleanup and limits

[Nine read-only checkpoints](state.json) preserve 48decks/1402cards/11events, original plan/missions/ordinary queue and no write journal. All eleven hashes match baseline except the English checkpoint, whose sole difference is preferences. The restored-before-cold, restored-cold and restored-visible checkpoints match all eleven baseline hashes exactly. No card save, grade, checked exercise or new learning event occurred.

[Four own-container preflights](preflights.json) bracket the initial and final launches. The requested device is the actual mini, with its own `C44142DA-0CDC-4927-A01A-38E7B024B9D1` container; no clone/source/alias operation. The supported host-only v3 recovery backup was reconstructed from read-only storage and checked against baseline as preparation; it was **not imported or needed**. No direct storage writes were used.

[OS/file checkpoints](os.json) record unasked/zero → granted/zero → one rotated take → granted/zero after Delete → unasked/zero after supported simulator privacy reset. Normal cold launch PID97681 visibly returns [Spanish Barrio Dark Home](restored-cold-home.jpg), with native Light/Text3/portrait/VoiceOver off/Capture Keyboard off. The familiar unsigned notifications diagnostic returns on cold launch; it is not fixed or accepted here. Home app AX attachment was absent at that final instant, so restoration is a visual observation plus separate read-only hashes, not an uninterrupted AX journey.

Only this simulator ran, then it was shut down; Metro and idle Device Hub stopped. No TextEdit document was opened for this batch, no simulator was erased and no unrelated app/document was closed. The eleven unmodified JPEGs are1972×1368 Device Hub window captures, not full-resolution app-only captures. [Metadata/image hashes](verification.json) and AX sidecars bind the recorded observations; visual inspection is required.

Run `python3 docs/qa/2026-10-19-mini-editor-voice/verify-state.py` for passive artifact consistency. It cannot replay UI or independently prove historical processes, focus/touch provenance, pixel readability or audio. Product source is unchanged, so no broad local test suite is repeated; required CI evaluates the committed candidate. All five packages and127 unchecked parent/requirement rows in29overlapping groups remain open.
