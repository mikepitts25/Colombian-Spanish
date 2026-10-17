# Daily plan layout/lifecycle — 2026-10-17

## Changes

B05.3-B2b2-B1 fixes three reproduced problems:

- Parent End remained enabled while its player saved an assigned answer. Synchronous paired saving notifications now guard End through commit; the parent counts outstanding saves, including a save that settles after player unmount. A settled failure retains explicit exit/retry behavior.
- Live largest-text changes left stale native text measurements in the response. Font-scale keyed presentation scrolls reflow labels without remounting player state, pending intent or timing ownership. Completed/recovery views use the same pattern. Changing text size intentionally resets presentation scroll position.
- The pinned End action occupied roughly half a narrow screen at the largest text size. Recovery actions now share the response's safe-area/keyboard-aware scroll. Ending may require scrolling to the action.

No durable schema, learning counters, editorial release gate, dependency or permission changes.

## Tests / review

Observed RED/GREEN tests for parent End during a pending linked answer, saving notification settlement after unmount, and shared response/recovery scrolling. State-preservation coverage checks live text changes retain a controlled draft and exact run with no extra storage writes, including during a pending answer. Native RED/GREEN screenshots provide the layout evidence that Jest cannot measure.

Final full local verification: **90 suites / 876 tests passed**. Types, lint, format, calendar-zone checks, data/audio inventory and editorial validation passed. One fresh whole-branch review of 33501a9..156b217 found no blockers and independently ran 17 passing affected-screen tests. Merge/CI results will be recorded after execution.

## Native fixtures and evidence

Existing unsigned SDK57 client, Metro 8098; native UI actions through CUA. New narrow iPhone SE 3 / iOS 26 fixture 5E9A8854-135A-4675-A437-4EFCA043F656. Tablet fixture B51A3777-8E81-4049-B101-C2B18390E2B1 cloned the earlier shutdown tablet and upgraded its client, preserving the original fixture. Native read-only storage evidence is in [native-state-check.json](native-state-check.json). No app data was mutated through the filesystem.

Tablet: fresh onboarding/profile (work/all, target 5, three-minute preference), Spanish Home → exact two-card review → applied. Largest accessibility text (`accessibility-extra-extra-extra-large`, inspector 11) reproduced clipped live labels; resetting default 3 and changing live to 11 after the fix showed full reflow, including End. The actual response prompt/input and submit/hint were scroll-reachable at largest text. The automation later surfaced Expo Go and its native accessibility tree became intermittent; the native client was foregrounded again. Its actual storage remains at applied with two graded cards. After unlock, captured hardware-keyboard entry of unaccented `Buenos dias` produced “Revisa las tildes”; touch-scrolling exposed “Continuar con ayuda”, which completed the exact plan. Read-only native storage confirms completed/assisted, an incorrect answer event, unchanged two-card daily count and unknown active timing. Software-keyboard visibility remains unverified.

Narrow: English default Home and direct two-card plan. Largest text review controls remained in the scrolling flow. English applied phase reproduced the pinned-footer crowding; after moving End, input and full Check answer were reachable without the fixed pane. Keyboard entry retained Buenos días; scrolling dismissed the keyboard and exposed the full submit control. Checked correct, cold terminated/relaunched, and Home Continue restored the exact feedback. Back → Home → Settings → switch English to Spanish → Home Continue retained correct feedback. Continue committed the same plan as complete at largest text. After unlock, an actual upward touch drag exposed the full final Home action, and a coordinate tap returned Home. See [scrolled completion](narrow-complete-scrolled-es.png).

Narrow saved-state comparison: daily/new count 2, target 5, three events (two review grades plus one applied answer); final completion preserves the same deck hash and counts/events. Tablet feedback/completion screenshots: [accent feedback](tablet-feedback-es.png), [assisted completion](tablet-complete-es.png). Both dedicated fixtures retain their actual QA progress. No fake learner timing or language acceptance was added.

Screenshots: [narrow English Home](narrow-home-en.png), [tablet review](tablet-review-es.png), [tablet live-text failure](tablet-large-before.png), [tablet live-text reflow](tablet-large-after.png), [narrow pinned footer](narrow-large-footer-before.png), [narrow keyboard before](narrow-keyboard-before.png), [narrow submit after](narrow-submit-after.png), [narrow completion](narrow-complete-es.png).

## Remaining gates

B05.3-B2b2-B and its parents remain open: tablet software-keyboard behavior and remaining iOS matrix gaps. Android native runtime, signed notification behavior and physical-device acceptance are separate. The unsigned client's known expo-notifications keychain warning was visible; dismissing that development banner is not a fix or verification of signed behavior. All 1,392 cards still await current human editorial acceptance.
