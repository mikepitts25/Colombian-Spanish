# Progress accessibility — 2026-10-17

Completed bounded task B08.4-B2a. Broader platform, activity and assistive-technology acceptance remains open.

## Change

Live font-size changes previously left clipped native text measurements (see `native-large-before.png`). Remount only the Progress presentation when font scale changes; retain the loaded evidence snapshot above that subtree. At large sizes, stack streak, goal, statistics and motivation content; let the percentage flow outside the fixed ring. Wrap full deck names and describe due counts explicitly. Expose the daily bar as an accessible progress indicator with a capped percentage and exact count/target, name the Study action, add pressed feedback and fix singular day/día.

No learning calculations, evidence classification, scheduling or storage schemas changed.

## Native checks

Used the normal app via Metro, with actual Device Hub touch/navigation and text-size controls; no injected app-storage writes.

- iPhone SE (3rd generation), iOS 26, restore-recovery QA clone: reproduced the live default-to-maximum clipping before the fix. Spanish maximum goal shows 3 of 5, readable percentage and Study action (`native-es-maximum-goal.png`). Touch-scrolled through the content. Final English default screenshot (`native-en-default.png`) shows 1 day, 60%, 3 of 5 and the four statistics. English maximum lower content was also inspected. Restored Spanish and native text size 3.
- iPad Pro 13-inch (M4), iPadOS 26, keyboard-tablet QA fixture: Spanish maximum goal shows 80%, 4 of 5 and the full Study action (`tablet-es-maximum-goal.png`); lower deck rows show full names, including Hotel & Accommodation Phrases (`tablet-es-maximum-decks.png`). At default size, tapped Study more and observed Study landing selected (`tablet-study-handoff.png`); did not start a session. Restored its prior maximum native text size 11.
- `native-state-check.json` contains read-only own-app snapshots. All eleven durable key hashes match between the phone initial/final rows, including preferences after restoring Spanish. All eleven also match between tablet-before-launch and tablet-study-handoff. Six retained events per fixture remain unchanged; no grades or new sessions were submitted. Journals remain absent.

Tablet app accessibility tree was unavailable, so its checks used screenshots and actual touch controls. Phone native named controls were exposed. This is not full VoiceOver, Android, light-theme, every activity or physical-device acceptance. The unsigned Expo notifications keychain banner was dismissed; no notification fix is claimed.

## Automated verification

- Initial accessibility regression run: 2 failed / 5 passed (`targeted-red.log`).
- Final focused Progress suite: 8 passed (`targeted-green.log`), including exact daily values, above-goal capping, working navigation and live font changes preserving evidence.
- Full suite: 94 suites / 925 tests passed (`full-suite.log`).
- Typecheck, lint and data validation passed (47 decks / 1,392 bundled cards); formatting checked before integration.
- Independent code review found no actionable defects and independently passed all eight focused tests.

Security task B01.8-C2g remains open with the owner's reported Codex cybersecurity-access error recorded in the master checklist. No signature-validation patch was applied in this batch.

## Integration

Fast-forward merged and pushed to main at `67ef116`. The merged local suite passed 94 suites / 925 tests. [GitHub CI 39052931950](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39052931950) passed all four jobs, including quality/content and iOS/Android project generation plus production JavaScript bundles. [Checklist board run 39052931925](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39052931925) passed. These checks do not establish signed native compilation or physical-device acceptance.
