# Focused due-count refresh — October 17, 2026

Master B02.6; base 5ff0925. Scope: existing Home/Progress due-now counts on a screen that stays focused through a due-time boundary.

## Reproduction and correction

Two integration cases use the real DeckProvider, storage and screens with one studied card due at 12:00:30. Starting at 12:00, Home and Progress report zero due reviews. Advancing one minute without navigation left both at zero before correction (observed RED); after correction Home reports one due and offers Study due cards, while Progress reports one due (GREEN).

The shared focused loader already had a minute timer, but checked only for a different calendar date. It now refreshes every minute while foregrounded; inactive/background intervals perform no reads, and foreground still refreshes immediately. Latest-request ownership, last-good value/error recovery and cleanup remain intact. No scheduling, counters, schemas or dependencies changed.

Additional controlled tests cover keeping the last snapshot during background intervals and rejecting a late minute result after a newer foreground read. The baseline 29 relevant tests passed; targeted 8 cases passed after three observed failures before correction. Full 80 suites / 781 tests, calendar 16, types/lint/format and content checks passed. The full suite still emits act warnings from unchanged StudyScreen and DifficultWords tests; no test failed. One fresh independent reviewer found no critical or important findings. Minor deferred: explicitly assign native startup AppState values in tests (implementation inspected against native RN source). Native evidence is recorded below.

## Limits

Minute timing tests use a controlled JS clock. No native clock injection, live timezone change, Android, signed or physical acceptance is claimed. Broader fresh/empty/returning/upgrade and timezone matrix acceptance remains open.

## iOS evidence

Own dedicated device 0E1EFA92-01A8-46F6-BAB7-1D20B9F91ED8, iOS27 / SDK57 unsigned debug binary, worktree Metro8098. Restarted server, verified liveness and terminated/launched app; Metro rebuilt the current bundle. The existing unsigned expo-notifications keychain entitlement warning remains and was dismissed for navigation.

On the new local day, Home showed 0/5 and allowance 10 while retaining the prior library and exact nine-card Business session. One normal Bien grade moved jefe/a → gerente and eight remaining; Home showed 1/5, allowance 9, and Progress showed 20%, two studied cards, two self-rated recall attempts and zero due. Returning from simulator Home preserved these totals and the exact eight-card checkpoint. Screenshots and read-only state evidence accompany this report. No direct storage mutation or device-clock change was used. This validates ordinary navigation/foreground integrity; the same-day due-time boundary itself was exercised by controlled integration tests, not native clock manipulation.

## Review boundaries

Reviewer deferred native timezone/clock injection, Android/signed/physical and full fresh/empty/returning/upgrade acceptance. These remain separate open master tasks; this batch makes no acceptance claim for them. The minor startup-state coverage suggestion is recorded for later work.

## Integration

Pending final commit and CI.
