# Classic and optional Barrio foundation — 2026-10-18

Classic remains the default for fresh installs and older preferences, and remains permanently available in Settings → Theme. Barrio is optional, with a remembered System/Light/Dark choice. Save applies a durable selection; Cancel discards the draft. This is the shared foundation and route migration, not the later Barrio Home redesign.

## Software verification

Runtime through `1047736`: 115 suites / 1,091 tests pass. Typecheck and zero-warning ESLint pass. Required format, data (47 decks / 1,392 cards / 1,392 audio entries), fixture (7 suites / 107 tests), and four-zone calendar checks are recorded in [software-checks.json](software-checks.json), with commit-specific log digests. Existing asynchronous `act` and PostCSS fixture warnings are not represented as zero-console-warning tests.

Actual root/provider/storage tests cover journal interruption/recovery, stale preference loads, no optimistic theme paint, immutable failed-save retry, concurrent preferences, full-state import at its existing restart boundary, exact grading/editor intents, response drafts, queue retention and learning credit. Native pending-failure injection was **not** performed; those cases have software evidence only.

The complete source audit covers `src` and `App.tsx`: 255 classified color literals and 415 composited foreground/background pairs. All Barrio pairs meet the required ratios. There are 63 explicitly preserved Classic legacy exceptions; Classic preservation is not a new contrast certification. See [color roles](color-roles.json), [audit report](color-audit-report.json), and `node scripts/audit-theme-colors.js`. Spacing-only imports remain legal; static palette/elevation consumers fail the audit.

## Rebuilt iOS candidate

A fresh detached checkout at `fd5384e` generated the native project, installed its existing pods, and built the Debug simulator workspace successfully with Xcode 27.1 and signing/upload disabled. Generated Info.plist is Automatic. The binary includes both arm64 and x86_64. [Build summary](native/build-summary.json), [binary digests](native/binary.json), config and trimmed build output are recorded. Later JS-only fixes (`f81219c`, `a519076`, `1047736`) ran from the normal localhost:8098 Metro checkout, with cache-cleared restarts; native configuration did not change. Generated iOS output is not product source.

Fresh devices were **created, not cloned**:

- Phone: iPhone SE 3 / iOS 26, `2EDF21F0-7DBD-4B09-8D5F-85560FD0E730`.
- Tablet: iPad Pro 13 M4 / iPadOS 26, `F9BC32B5-9591-4CEA-9363-707D3A7E204D`.

Each launch has explicit-UUID own-container preflights. App mutations used supported UI through CUA. Original fixture files were copied in TextEdit and sent with Device Hub’s clipboard menu, then imported with the app’s preview/Restore app state flow. No direct simulator storage writes, source-device app operations, alias launches, account or licensing actions occurred.

## Observed native coverage

| Area                 | Recorded result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Classic preservation | Fresh phone/tablet start Classic. Onboarding and ungraded first Study work. Home/Settings and phone Goal preserve original values, emoji, arrangement and learning meaning. Baseline source values are exact; screenshot comparison is representative, not pixel-identical (clock/greeting and the intentional Theme row differ).                                                                                                                                                                       |
| Identity and modes   | Phone Save transitions through Barrio Light, Dark, System and back to Classic. Tablet Light → System → Classic → Barrio remembers explicit Dark. Cancel and an unapplied picker draft leave all records unchanged.                                                                                                                                                                                                                                                                                      |
| Native appearance    | Phone explicit Light remains light with dark OS, including native backup alert; explicit Dark remains dark with light OS. System follows OS. Tablet explicit Dark paints dark after cold launch under light OS. Native navigation header and status chrome are represented in captures. Startup conservatively paints Classic until recovered selection; no claim of a flash-free boot transition.                                                                                                      |
| Keyboard             | Native RED showed a focused dark keyboard remaining dark while a System light modal repainted. The System-default keyboard trait fix passes Light → Dark → Light with the same typed Rename draft/caret, without a theme remount. Explicit modes and Classic retain explicit traits.                                                                                                                                                                                                                    |
| Text and drafts      | Phone picker draft survives live maximum text and OS change then Cancel. Written reply `Hola` remains in AX after maximum text and System dark change; its maximum-text screenshot shows the top of a tall screen, not touch access to every control. Tablet Add Card `Hola QA` survives default → maximum text and System dark; Back discards it without saving. Font resizing may dismiss the keyboard through the existing font-layout boundary.                                                     |
| Active Study         | Phone reveals `Hello 7`, switches to Classic through Settings, returns to the same face and exact queue `catchup-7,8,9` / original session ID. Only resuming initially refreshes the existing session timestamp. Identity switching itself does not change that session record. No card was graded.                                                                                                                                                                                                     |
| Other routes         | Phone Progress maximum/default, Review, 20 Flagged cards, Add Card, Difficult, unanswered Quiz, Weather Phrases, idle Voice preview and unanswered Listening draft inspected. Daily-plan written reply opened and typed without Check/Hint/End. Draft-language disclaimers remain visible. No recording or microphone prompt was requested. Broader routes and recovery controls additionally have source audits and software tests; this is not all-route native coverage in every mode/size/platform. |
| Voice disabled paint | Native RED exposed faded legacy green/white unavailable controls. Existing semantic disabled background/ink now render readably in native GREEN, with a failing-then-passing real screen test and 115/1,091 full suite. No permission/controller behavior changed.                                                                                                                                                                                                                                      |

There are [40 native captures with dimensions and SHA-256](native/screenshots.json). Files containing `red` or `stale` are diagnostic failures, not passing acceptance images. Accessibility actions sometimes position offscreen controls; these checks do not establish full touch scrolling. After the final tablet cold launch, Device Hub exposed inspector AX but no app AX; a visible Settings-coordinate attempt did not navigate. The settled native screenshot and exact persisted state are verified, but post-cold tablet touch acceptance remains open. Repeated unchanged gestures were not retried. Existing unsigned expo-notifications keychain-entitlement debug banners appear after launch; signed notification behavior was not tested.

## State preservation

[28 read-only snapshots](native/native-state-check.json) record hashes of all 11 logical records, exact session/plan/mission/event details and own-container paths. Fixtures carry 48 decks / 1,402 cards / 20 flags and 10 phone versus 11 tablet observations.

- Original source phone and tablet remain **all 11 records exact** before/after this batch.
- Fresh phone’s final supported restore and cold launch return **all 11 records exact** to its source. Its final selection is legacy Classic default, Spanish, OS Light, default text. Earlier temporary unassessed mission/draft activity was restored, with no learning observation added.
- Fresh tablet’s final cold state matches all ten non-preference records exactly; original preference fields are exact, with only `themeId: barrio, appearanceMode: dark` intentionally added. Spanish / OS Light / default text. No tablet card was saved or learning action assessed.
- Known alias UUIDs remain Shutdown in [final quarantine snapshot](native/quarantine-states-final.json).

Run the passive verifier (no simulator access):

```sh
PYTHONDONTWRITEBYTECODE=1 python3 docs/qa/2026-10-18-theme-picker/verify-evidence.py
PYTHONDONTWRITEBYTECODE=1 python3 docs/qa/2026-10-18-theme-picker/baseline/verify-baseline.py
```

## Remaining acceptance and next work

The later Barrio Home composition, owner visual approval, Android license/build/device coverage, signed distribution/native notifications, physical keyboard/audio/microphone behavior, full touch-scrolling and assistive-user acceptance remain open. Content still needs human language review and recording/rights decisions. Security B01.8-C2g remains blocked by the owner-reported Codex cyber-access error; no security bypass or additional audit is claimed. Audio-download B06.4-A2 still needs its written-spec approval.

Portable backup v3 accepts the optional new theme fields and older backups. Downgrading to older app versions may reject backups containing those new fields. Full-state restore retains its disclosed restart requirement.

The [independent final review](final-review.md) found three Important visual issues, all fixed with observed RED→GREEN regressions and a 115-suite/1,091-test full pass. Native corrected-frame/badge captures and final exact restoration follow that fix. Two Minors remain explicitly tracked in the master checklist. Merged and pushed to main as `d7d5c478ea243fecd89a192d9d354f1988b18fd7` in [PR11](https://github.com/mikepitts25/Colombian-Spanish/pull/11), after [candidate CI39124622375](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39124622375) passed all four jobs. The merged main tree independently passes 115 suites / 1,091 tests and both passive verifiers. Final main CI/board publication is verified after this checklist-closing documentation push.
