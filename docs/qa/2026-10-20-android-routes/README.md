# Android Study resume, local picker preview and voice denial

October20,2026; source main `d946d39`, reusing the existing development ARM64 APK from PR63. No product source/dependency changes or native rebuild. This packet fills bounded Android cells only; **all five broader QA packages remain open**. It reuses PR64 onboarding/grade/cold/System-appearance acceptance without repeating those actions.

## Actual routes and saved-state protection

The sole dedicated `Colombian_Spanish_QA` AVD started after both runtime inventories were empty. Its OS Dark setting was restored to Light through Studio's native Device UI Shortcuts; [Android UI mode](os-light.txt) confirms night mode no. The saved emulator snapshot retained a development process whose app controls did not respond after the old Metro connection ended. A fresh app process against the current Metro bundled successfully and restored responsive navigation. Treat that as development-session recovery, not a demonstrated release defect.

Docked CUA clicks work. Wheel scrolling did not move the Study list; a CUA touch drag did expose the retained session. Continue opened [actual `boleto`, nine remaining cards](resumed-card.jpg), matching saved card0039 and the prior queue/session identity. [Read-only saved-state summaries](state-summary.json) show only the normal checkpoint timestamp changed on opening Study; all other six values remain byte-exact. No grade was added.

Settings changed Spanish to English through the existing language control. [English settings](english-settings.jpg) show the actual translated controls. Theme remains Barrio/Light. Language cold persistence, maximum text and other theme cells are not inferred.

## Native backup share limitation and real picker preview

Save backup file generated a372,357-byte full-state JSON backup, but the [native share sheet](share-sheet.jpg) reports **No apps can perform this action** on this default emulator image. No native provider save, share-recipient read, overwrite, cloud or restore success is claimed.

For the distinct picker/preview cell, the product-generated cache JSON was read through official adb/run-as and copied unchanged through adb to the dedicated emulator's labeled `Download/colombian-spanish-qa-generated-backup.json`. This is SDK fixture transport, not a native share save. The full backup stays host/device-local and is not committed. Source and Downloads copy both have SHA256 `c2425af318909a72dc5a927393e674fd076035e1a4c1f482f43a660f3d7fd7cf`.

The actual native document picker selected that local file. [Preview](backup-preview.jpg) shows47 decks,1392 cards and1 observation, with Restore app state/Add new cards/Replace decks/Cancel reachable. Cancel returned to Settings/Home without applying an import. The post-preview snapshot differs from the resumed checkpoint only in the intentionally changed language preference; all six learning values remain exact. The Downloads source still has the original hash after preview/Cancel. This closes local picker/preview/Cancel protection, not Android restore/reinstall/version-upgrade acceptance.

## Voice denial, text alternative and unresolved recording retry

Home's existing labeled development preview opened voice self-check. Record invoked Android's actual microphone prompt; Don't allow produced [the explicit denial message](microphone-denied.jpg). Android reported RECORD_AUDIO granted=false; the [cache inventory](denied-cache.txt) contains no recording. [Practice without recording](voice-text-alternative.jpg) remained usable and showed the unscored `buenos días` example. Android Back returned to Home. This is denial/text/navigation acceptance, not real pronunciation/audio-quality acceptance.

A retry offered Only this time. Android then reported RECORD_AUDIO granted=true with ONE_TIME, but the [subsequent attempt remained Ready](voice-record-attempt.jpg), with no observed take. A fresh voice-screen entry did not establish capture either. **Record/Stop/Replay/Delete remains open; no cause or fix is claimed.** The permission request and AppState paths were inspected locally. Temporary diagnostic logging was prepared afterward, but the runtime overlap interrupted diagnosis before a fresh diagnostic launch. All three instrumented source files were restored byte-exact from originals; no diagnostics are in the committed runtime. At the next exclusive boot, force-stop/relaunch against normal current Metro before further QA so a restored development snapshot is not used as clean-process evidence.

No final post-voice database snapshot was captured, so this packet's exact persisted-state claim ends at preview/Cancel. The final observed app language is English and theme Barrio/Light. Check/reset the one-time microphone grant at the next exclusive boot; process/OS expiry is not asserted as observed.

## Interruption, cleanup and remaining scope

The [two-second inventory monitor](exclusive-watch.jsonl) initially sampled empty inventories, then our Android runtime alone. At00:00:30Z, it detected the other chat's PyQuest iOS runtime, verified our AVD identity and [stopped only our emulator](exclusive-abort.json). Sampling does not prove zero transient overlap. The other runtime/chat was untouched. Owned Metro and Android Studio were stopped; no own emulator or monitor remained. OS Light restoration is complete; Spanish preference restoration and microphone recheck remain pending after interruption. The labeled backup fixture remains local for later recovery checks.

B01.5-B3/B4/B5 close visual retained-session traversal, local picker/preview/Cancel, and voice denial/text/Back respectively. Android recording, native share destination/restore, authored practice, remaining appearance/language/accessibility cells and the other named five-package cases remain open. Unapproved content/features, skipped security, signed distribution and physical/human acceptance remain separate.

Validation is limited to evidence digests, saved-state/queue assertions, checklist-index consistency and formatting. The existing build/full local regression/iOS cells were not repeated. One fresh final reviewer and required CI precede merge; passive checks do not replace screenshot observations.
