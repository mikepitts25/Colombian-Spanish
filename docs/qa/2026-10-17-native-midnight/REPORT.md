# Actual native midnight refresh — October 17–18, 2026

> **Storage provenance update — 2026-10-18:** Current alias evidence includes `6A8A8DE1-3A9A-480B-9D9A-9082E5C6F5B1` → `5E9A8854-135A-4675-A437-4EFCA043F656`. This historical report did not establish requested-device data-path isolation at capture time. Same-store transitions and UI observations retain their stated scope; independent-store/source-runtime protection is unverified unless separately proved. See the [claim audit](../2026-10-18-simulator-claim-audit/REPORT.md).

Baseline `0cc4bad`, unsigned SDK57 development client on dedicated iPhone SE (3rd generation) / iOS 26 QA clone `6A8A8DE1-3A9A-480B-9D9A-9082E5C6F5B1`, Metro 8098. Device local calendar was Europe/Berlin. CUA operated the UI; own-app storage inspection was read-only. No clock injection, app storage edits, grading, source edits/HMR or navigation occurred during the foreground boundary interval.

## Observed result

Left Spanish Home focused at default text size from approximately 23:50 through actual midnight. [Before](home-before.png) and [23:59](home-before-boundary.png) show the completed goal (5/5 display, seven stored credits), nine available new cards, one due review and an unfinished applied daily plan. A read-only watcher first observed the app-written October 18 daily key 14.84 seconds after midnight: count 7→0, newCount 1→0, target remains 5. [Home immediately after](home-after.png) shows 0/5 and ten available new cards before navigation.

Then opened [Progress](progress-after.png), which shows 0 of 5 / 0% and the retained one-day streak. Returned Home and confirmed the same new-day totals. All eleven captured durable key hashes except daily progress match across midnight; all eleven match again after subsequent tab navigation. Ten events, exact ordinary queue catchup-7/8/9, session identity, separate applied daily plan, mission state, preferences, streak history and deck contents remain unchanged. No recovery journal is present. The fixture contains 1,402 cards including ten synthetic catch-up cards; these totals are not shipped content counts.

Run `python3 docs/qa/2026-10-17-native-midnight/verify-evidence.py`. It validates the recorded timing and daily transition, unchanged other keys, exact queue/linked-plan retention and absence of duplicate credit during navigation. It does not touch simulator storage.

## Limits

This closes B02.6-B2a: one actual focused native midnight in one timezone on one returning-state iOS fixture. Live timezone changes, DST, fresh/empty/upgrade flows, background/resume boundaries, Android, signed candidates and physical devices remain open. Greeting wording is outside this check. Device Hub app accessibility nodes were unavailable after the earlier cold launch; screenshot-derived coordinate controls worked. No screen-reader or notification acceptance is inferred. A later separate contrast change occurred only after all midnight checkpoints were captured.
