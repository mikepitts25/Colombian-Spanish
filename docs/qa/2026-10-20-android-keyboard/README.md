# Android maximum-text mission keyboard

October 20, 2026; base main `4e32987`. B01.5-B7 closes this bounded Android defect. The five QA packages remain open; this is not complete Android or editorial acceptance.

## Defect and correction

On the dedicated API36 ARM64 Pixel6 emulator, Spanish/Barrio Light at font scale2.0, the first-morning draft mission's focused response remained behind the software keyboard. The existing measured-response scrolling could not compensate because Android's outer keyboard-avoiding container had no behavior and retained the full viewport. Actual software-key touch entered `Buenos dias`; the [before image](spanish-max-keyboard-position-red.jpg) shows the partially covered draft and hidden actions.

MissionScreen now uses the native keyboard-avoiding container's `height` behavior on Android. iOS retains `padding`; no controller, storage, theme, native configuration or dependencies changed. With the final source loaded through Metro Fast Refresh, the [after image](spanish-max-keyboard-position-green.jpg) shows the full unchanged draft, Check and Hint above the open keyboard, without an intervening manual scroll. Coordinate touch on Check dismisses the keyboard and produces the expected [accent feedback](spanish-max-mission-feedback.jpg), `Revisa las tildes`, with model `Buenos días` and Try again. This proves action access/submission, not correct accent entry, complete mission acceptance or native cold re-entry of feedback.

The regression exercises the real KeyboardAvoidingView: lay out a700px viewport, show a keyboard at400px, expect400px available height and retained draft, then hide the keyboard and expect the height restriction removed. The [old behavior fails](regression-red.txt) on missing reduced height; [all20 MissionScreen tests pass](focused-green.txt) with the fix. Early test attempts did not supply the native layout event's `persist` method and are excluded from regression proof. Typecheck and lint pass. Required full CI supplies broad regression; accepted iOS and native builds were not repeated.

## Other bounded observations and state

Spanish maximum-text [Home top](spanish-max-home-top.jpg) and [lower tools](spanish-max-home-tools.jpg), the [draft intro](spanish-max-mission-intro.jpg), and [scene Continue](spanish-max-mission-scene.jpg) were traversed. These are observations of named positions, not full Home primary/Study count/action/window/theme acceptance. Native text injection did not enter the response; the Android software keyboard was used instead.

The [sanitized state summary](state-summary.json) contains hashes and only the relevant QA metadata. Stable cold boot after the earlier audio crash recovers all seven original records byte-exact against PR65's final preview/Cancel state. At the end, decks, daily1/5, seen words, streak and nine-card checkpoint remain byte-exact against this start. The original SRS event remains semantically identical; one intentional checked-response event is added, with accent feedback stored in the new draft mission run. The original event's JSON field order changes during normal serialization, so event-storage byte equality is not claimed. Spanish replaces English through normal Settings. No ordinary Study grade or SRS/daily credit was added. No raw decks, full backup, database or recording is committed.

Font scale is restored from2.0 to the original1.0 through Studio's native Device UI Shortcuts, verified by SDK read. Changing scale recreates the app at [Home](restored-default-home.jpg); retained route is not claimed. Microphone access reads `granted=false` after cold boot and at finish; no recording was attempted in this non-audio session. OS Light remains unchanged.

## Working control route and resources

The installed SDK emulator can run without host audio and still use Studio's embedded display/input. The successful process uses `-no-snapshot -no-metrics -audio none -no-window -qt-hide-window -grpc 8554 -grpc-use-token -idle-grpc-timeout 300 -cores 2 -memory 2048`. Token authentication remains enabled on localhost; no token/discovery values are retained. The existing development APK SHA256 is `063edd5f14639d85108bee27a916ba71c62fb5c06cfbdaa1cb271c8c82743102`; only working-tree JavaScript changed. No AVD/global configuration, agreements or permissions were changed for the route.

Earlier setup attempts are not acceptance: normal Qt startup waited for a previous-crash consent dialog; plain headless boot was not discovered by Studio; the embedded marker needed an explicit gRPC port, and this Studio's client could not authenticate with the JWT variant. The final token-authenticated launch worked. A premature second launch was refused by the same-AVD lock. Prompt-bound owned processes required forced termination after normal termination did not work. No crash report was submitted, authentication disabled, UI input through adb, or audio-crash route repeated.

All UI actions/screenshots used CUA. Official SDK commands were limited to lifecycle/configuration reads and read-only storage transport. The [two-second runtime samples](runtime-inventory.jsonl) show empty or only our AVD, with no detected overlap; sampling cannot exclude a transient unsampled overlap. After testing, both runtime inventories are empty and owned emulator, Metro, Studio and monitor are stopped. Other user applications were left alone.

## Remaining scope

Continue only unaccepted named cells in the five consolidated packages. Android authored-practice breadth, English/rotation/window cells, maximum Study Again/Hard and Home primary/count, forms/editor, calendar boundaries, actual recording/Stop/Replay/Delete, share-provider export/restore and signed/physical/human gates remain open as applicable. Audio is explicitly disabled here; this does not resolve the prior CoreAudio host failure. Existing passed onboarding, grade/cold recovery, appearance, backup preview/Cancel and permission denial checks are reused. Security stays owner-skipped; the three feature approvals remain pending.

Run `python3 docs/qa/2026-10-20-android-keyboard/verify.py` to check the bounded state claims, runtime samples and evidence digests.
