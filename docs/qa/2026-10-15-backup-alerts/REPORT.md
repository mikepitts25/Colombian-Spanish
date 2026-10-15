# Renewed native backup checks — 2026-10-15

After the owner confirmed unlock, Device Hub control was available. Tested existing main code `0c32322` (documentation head `4ccd010`) on the dedicated fresh QA iPhone 16 Pro / iOS 26.0 simulator, Expo Go 54.0.7 through Metro 8098. No functional change was needed.

- Clipboard export showed the native “Backup copied” alert with readable text and working OK action. [Screenshot](01-clipboard-export-alert.png).
- Importing that clipboard backup showed the native replacement confirmation with Cancel and Import. Chose Cancel; no restore was applied. [Screenshot](02-import-confirmation.png). Clipboard export remains version 2 and omits supplemental app state.
- Full file export opened the native share sheet. Save to Files stored the JSON locally under On My iPhone. Read-only inspection confirmed the saved source exactly matched the 372,299-byte export: version 3, 47 decks / 1,392 cards / one simulated learning event and all seven supported state fields. Preferences retained work/Paisa/basic/10-minute/leap-date values; saved queue retained IDs 1801–1808, General region and cardLimit 15 / newLimit 8.
- Native file picker selected that new file. In-app preview correctly showed 47 decks, 1,392 cards, one observation and app-state guidance. Restore app state, Add new cards, Replace decks and Cancel were all visible. [Screenshot](03-full-state-preview.png). Chose Cancel.
- Compared all seven existing local storage sections with the pre-cancellation read: exact equality, including decks, events, preferences, counters and queue. No pending journal. The selected Files source still existed and exactly matched the export.

This is alert/export/picker/preview/cancellation evidence, not a new interrupted-restore or hardware durability test. Prior successful full-state restore has separate evidence. Android/cloud providers, malformed clipboard/picker error cases on native OS, physical hardware and signed native builds remain open. Functional baseline is 60 suites / 646 tests and passed CI run 38754924531; no code was changed by this QA-only package.
