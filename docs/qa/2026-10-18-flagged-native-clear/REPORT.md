# Flag clear and empty-state native evidence — 2026-10-18

B02.4-B2m / B08.5-B10 complete this bounded Spanish iOS check. No application code changed. Tested the application tree at `47b5c9380fca5fc141253d8bbdc31f9386569d51` through Metro port 8098 using the existing unsigned SDK 57 development binary.

## Isolation and procedure

Official `simctl clone` created **Colombian Spanish Flag Clearing QA**, UUID `F8D6111F-AD0F-413A-A6B5-86EEB4CB5EB6`, from the shutdown Catch-up QA simulator `E66A88D6-CC87-4F46-A197-3F97EE9ED8CB`. Both are iPhone SE (3rd generation), iOS 26.0. The disposable clone received the existing development binary through official `simctl install`. The source stayed shut down. All app interactions used Device Hub through CUA; no simulator app-storage files were modified directly.

The first source snapshot was after cloning but before clone UI work; this is not a pre-clone byte-level backup claim. The early `clone-before-launch` snapshot captured a different bootstrap image (48 decks and default preferences). After installing/launching the binary, `clone-ready`, `clone-before-clear`, and `clone-clear-baseline` agree exactly on all eleven logical key hashes: 47 decks, 1,392 cards, 20 flags, copied returning-user preferences. Only this stable baseline supports the clear assertions. This is not a fresh-install or upgrade test.

The source daily record was October 17, count 2. The clone was already October 18, count 0 at its first snapshot; the exact rollover trigger was not isolated. No midnight/timezone behavior is inferred from this observation.

1. Open Settings → Manage Decks → Review → Flagged. Confirm the 20 existing flags ([before](es-before-clear.png)).
2. Tap Clear All; inspect the Spanish native confirmation explicitly naming 20 cards; confirm **only on this disposable clone**.
3. Observe the [empty state](es-empty-default.png): no Copy CSV/Clear All actions, and the message explicitly says that no flags does not confirm translation review.
4. Change native Text Size from 3 to 11. The header wraps across several lines on this narrow phone. A coordinate touch drag from `(1093,1016)` to `(1093,415)` in Device Hub reaches the entire [editorial disclaimer](es-empty-max-bottom.png). Restore native Text Size to 3.
5. Leave the route, terminate and launch the app through official `simctl`, then navigate the same route. The [empty state persists](es-empty-cold.png). VoiceOver and Capture Keyboard remain off; Spanish preferences remain unchanged.

The unsigned development build produced the known `ERR_NOTIFICATIONS_KEYCHAIN_ACCESS` warning after launch. It was visibly dismissed; no signing, notification permission, entitlement, or security setting was changed. This run does not verify notification delivery.

## Durable checks

`native-state-check.json` records eight read-only snapshots. `capture-state.py` documents the collector; the optional shutdown-source container registry lookup selects the exact application bundle metadata before reading its storage. Hashes use parsed canonical JSON, not filesystem bytes. `verify-state.py` checks:

- Exactly 20 flags become zero only on the clone, and remain zero after cold launch.
- The resulting entire deck payload equals the baseline prediction with `flagged: false` on every card. Clear All materializes false even where the optional flag was previously absent.
- Removing only `flagged` from each card yields the exact same deck hash: all other content, editorial metadata, schedules and deck structure remain unchanged (47 decks / 1,392 cards).
- All ten non-deck logical key hashes remain unchanged across clear and cold launch: daily plan, missions, preferences, daily progress, streak, seen words, quiz history, saved session, notifications and learning events. No learning credit was added; write journals are empty.
- The shutdown source's full eleven logical key hashes and original 20 flag identities are unchanged before/after the clone UI work.

Run `python3 docs/qa/2026-10-18-flagged-native-clear/verify-state.py`. The verifier checks captured evidence; it does not itself drive UI or establish screenshot semantics.

## Validation and remaining scope

Fresh full Jest verification on this branch: **101 suites / 990 tests passed**, zero failures ([log](full-suite.log)). Captured-state verifier and changed Markdown/JSON formatting checks pass. Baseline main documentation CI39090836075 and board39090836123 both succeeded.

This evidence closes native confirmed-clear persistence and Spanish default/maximum empty-state reachability on one narrow iOS simulator. English empty-state scrolling, native fault injection/interruption, rapid Back warning diagnosis, VoiceOver focus/announcements, Android, tablets/window modes and physical-device acceptance remain open. The prior automated failure/retry tests remain in the application suite. Parent reliability/accessibility matrices remain open.

Security B01.8-C2g remains blocked by the owner-reported Codex cybersecurity-access error. No retry, bypass or security patch was attempted. Audio design approval, editorial acceptance, accounts/signing and physical-device gates remain unchanged.

Independent evidence review found no Critical/Important issues. Minor evidence limitation: the inspected confirmation dialog was not retained as a screenshot. The clone was shut down after checks; Device Hub returned to the existing mini tablet.
