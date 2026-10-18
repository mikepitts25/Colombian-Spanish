# Voice self-check live text-size correction — 2026-10-18

Baseline `ee675884851ed998cb40e7aa38c2301205644c42`; existing unsigned SDK57 development client, Metro8098. B08.2-B14 fixes a reproduced live text-size defect in the development-only local voice self-check. Production visibility, permission/capture/controller code, retained recordings, scoring and learning credit are unchanged.

## Defect and correction

On iPad Pro13 M4 / iPadOS26 `A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F`, temporarily set native Text Size3, open Home → voice self-check, expand the text alternative, then change3→11. [The native layout retains its old short slots](tablet-es-live-resize-red.png): Back/action labels, heading and explanatory paragraphs are severely clipped. Text Size11 is Device Hub's maximum.

`VoicePracticeDraft` now observes `fontScale` and recreates only its native SafeAreaView subtree at a scale change, following the working audio-preference screen pattern. Its recorder hook, memoized VoicePractice controller, subscription/focus cleanup, timer and React state remain above that subtree. The text-alternative disclosure also exposes its actual expanded/collapsed accessibility state; other actions retain disabled semantics without a disclosure state.

The native RED screenshot establishes the measurement failure, which Jest does not render. A new automated disclosure regression fails against the baseline because expanded state is absent ([RED](red.log)), then passes after correction ([GREEN](green.log)). It also checks that the expanded text survives live resizing without requesting permission. A second lifecycle regression holds a real-controller permission request across resize, prevents another request, releases it into Recording, retains its ready take through another resize, replays and cleans up only on explicit Back. The latter is a preservation regression that also passes on the baseline; do not present it as a reproduction of native clipping. Tests stub only the external audio/navigation/language boundaries already used by this screen suite; they do not establish actual microphone capture or sound quality.

## Native verification

All UI interaction used CUA Device Hub; official simctl handled infrastructure, screenshots and read-only own-app storage. Native Light/app existing dark palette unchanged. No Record, microphone-permission, replay, delete-take, grade, quiz or mission action was activated in this batch.

### Spanish large tablet

After correction, repeat size3 → expand text alternative →11. [Back, heading, complete notice/prompt, ready status and upper actions reflow legibly](tablet-es-max-header-green.png). Available coordinate drags and mouse-wheel scroll did not move the lower viewport. A temporary VoiceOver/Capture Keyboard attempt focused Back but Control-Option-Right did not advance that focus; this does not establish a screen-reader or app scrolling defect. Restore both toggles off.

Back by coordinate works at maximum text. Reopen at size3, expand the alternative and resize3→11→3: [the example and full default-size content remain visible](tablet-es-retained-alternative-default.png). Return Home and restore original size11, terminate/launch normally and observe Spanish Home. Dismiss the known unsigned expo-notifications keychain registration warning without changing permissions or entitlements.

Full maximum-text tablet lower content, touch-scrolling and complete VoiceOver navigation remain unverified; only the upper layout and retained-state/default content claims above are closed.

### Spanish and English narrow phone

Disposable iPhone SE3 / iOS26 `F8D6111F-AD0F-413A-A6B5-86EEB4CB5EB6`:

- At size3, open voice self-check and expand the alternative through its AX action. Resize3→11: the inspector reports the alternative expanded and the same `buenos días` text. AX-position the example: [full Spanish example is readable](phone-es-max-retained-example.png).
- AX-activate the disclosure to collapse and reveal its full maximum-size button; coordinate tap `(1010,450)` expands it again, confirmed by AX expanded state and example. [Full Spanish control after touch](phone-es-max-alternative-touch.png).
- Back, restore size3 and toggle the normal Settings language row to English. Repeat open/expand/resize: [the same retained example is readable](phone-en-max-retained-example.png). AX-collapse/reveal, then coordinate `(1010,495)` expands the [full English button](phone-en-max-alternative-touch.png), confirmed by AX state/example.
- Back, restore size3 and Spanish, cold terminate/launch and observe Spanish Home. Shut down only this disposable clone after the final storage snapshot.

These phone lower-content checks used AX automatic positioning before coordinate activation. They are not full touch-only scrolling or complete notice/retention-paragraph reading checks at maximum text. Both buttons reflow without clipping their own labels. Speech announcements, route quality, every recording/error phase, tablet English/window modes, Android and physical/signed acceptance remain open.

## State and automated checks

Five read-only `native-state-check.json` snapshots: tablet baseline; phone baseline; tablet cold-restored; English-only phone; phone cold-restored. Each has47 decks/1,392 cards and an empty write journal. `verify-state.py` asserts the exact eleven logical key set, device/phase identity, per-device baseline/cold hash equality and a sole Spanish→English preferences change during the English phone phase. All eleven hashes restore on each device; no durable content, schedules, queue, learning credit or notification preferences change. The verifier checks stored evidence, not UI geometry.

Full Jest: **101 suites /995 tests passed** (`full-suite.log`); voice screen5/5 (`green.log`). Types, lint, project data and editorial-ledger checks pass. All1,392 cards still await current human editorial acceptance. Baseline CI39095309374 and board39095309364 completed successfully.

Broader B08.2-B/B08.6/B09.2-B2 remain open. Written downloadable-audio design approval, language/recording rights, product/provider/account/signing decisions and physical/human acceptance remain distinct dependencies. Security B01.8-C2g is access-blocked and skipped, with no retry or bypass.

Final premerge: full formatting and whitespace checks pass. Independent review found no issues after reading the complete delta and all seven screenshots, and independently rerunning5/5 screen tests and the captured-state verifier.
