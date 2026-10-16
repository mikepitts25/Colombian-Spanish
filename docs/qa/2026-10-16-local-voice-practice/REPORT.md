# Development-only local voice practice — October 16, 2026

Scope: B09.2-A. Expo54, RN0.81.5, expo-audio1.1.1; no new dependency or hosted provider.

## Delivered

Explicit Record permission request, one cache take, native 30-second limit plus JS safety timer, 2 MiB replay limit, Stop/replay/delete, no overwrite, retryable errors and unscored text alternative. Stop/leave/background invalidate pending permission, prepare and playback. App-close cleanup is attempted; process termination can leave a cache file. No transcription, assessment, uploads, learning events, SRS/daily credit or audio backups. Development-only navigation; production/preview native recording permissions blocked.

## Automated evidence

Final `npm test -- --runInBand`: **75 suites / 754 tests passed**. Typecheck, lint, repository formatting, data validation and editorial-ledger validation passed. Inventory remains 47 decks / 1,392 cards / 1,392 audio entries; all 1,392 await actual qualified acceptance.

Controller, native adapter, screen and config tests were first observed failing before implementation. Fresh whole-package review identified two defects: native Stop failure lost the active-capture retry path, and native automatic completion can reset reported duration to zero. Five additional regression cases were observed failing, then corrected. The final 21 controller/adapter cases pass, including background retry and preserving the JS safety timer after Stop failure. Permission denial survives OS-prompt backgrounding. Native playback cleanup failure is reported without losing take identity.

Native-config introspection: production blocks Android RECORD_AUDIO and omits the iOS microphone usage key; development explicitly declares usage/permission. These checks do not establish a signed installed build's behavior.

## Simulator evidence

- iPhone16Pro simulator, iOS26.0, Expo Go54.0.7, dedicated UUID `121168CB-C271-4202-AC19-94F8DAE7B8B1`: Home → draft voice → text alternative; Record alone opens the Expo Go microphone prompt; selected **Don’t Allow**. Denied status, Settings action, text alternative and disabled replay/delete remain available. Back returns Home; daily count remains 0/5. No access granted or take captured. [Screenshot](iphone-denied.png).
- iPadPro13M4 simulator, iPadOS26.0, dedicated UUID `5EAE09E7-828A-4306-B727-E2BBB307C24C`: cold launch → Home → draft voice → text alternative; controls/privacy copy fit. [Screenshot](ipad-text.png). Device Hub lost the app accessibility subtree after cold launch, so this layout/navigation check used screenshot-grounded clicks; no VoiceOver acceptance claim.
- Metro had retained stale module paths after an earlier clean install. Restarted only dedicated port8098 server and its exact worktree Watchman root; fresh iPhone/iPad bundles loaded successfully.

## Open

Actual authorized microphone capture, recording audibility/duration, replay/delete at the native file boundary, Bluetooth/routes, incoming interruptions, permission changes, low storage and signed-client behavior need further simulator/device checks. Android SDK license authorization remains pending. Human content/rights and any assessed feedback validation remain open; this prototype makes no pronunciation score or efficacy claim.

Merge/push and CI results are recorded in the master plan once available.
