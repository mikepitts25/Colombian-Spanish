# Maximum-text Hard focus and touch — 2026-10-17

> **Storage provenance update — 2026-10-18:** Current alias evidence includes `6A8A8DE1-3A9A-480B-9D9A-9082E5C6F5B1` → `5E9A8854-135A-4675-A437-4EFCA043F656`. This historical report did not establish requested-device data-path isolation at capture time. Same-store transitions and UI observations retain their stated scope; independent-store/source-runtime protection is unverified unless separately proved. See the [claim audit](../2026-10-18-simulator-claim-audit/REPORT.md).

Baseline `0cc4bad`, normal unsigned SDK57 development client, Metro 8098. Existing dedicated iPhone SE (3rd generation) / iOS 26 maximum-grading QA clone `6A8A8DE1-3A9A-480B-9D9A-9082E5C6F5B1`. No app code, clock or storage file was modified. UI actions used CUA; own-app storage inspection was read-only.

## Native result

Device Hub VoiceOver was enabled at native Text Size 11. A rightward simulated swipe did not reliably advance focus. Enabling Capture Keyboard, clicking the visible simulator and sending Control-Option-Right did advance the real VoiceOver focus rectangle and automatically scroll the content. Followed focus from the Study header through region/card controls to Hard. [Focused screenshot](hard-maximum-voiceover-es.png) shows the full Difícil / 12h control above the fixed tabs. No grade or durable app state changed during focus navigation: all eleven captured key hashes match the initial checkpoint.

Disabled VoiceOver and Capture Keyboard, leaving the same row visible. [Standard touch screenshot](hard-maximum-touch-es.png) shows its complete label and interval. An actual coordinate click at [1110, 560] submitted Hard for catchup-6 once. Total count 6→7, new count 0→1, retained events 9→10, ordinary queue 4→3. catchup-6 was previously new, so the one introduction debit is expected. Only that synthetic fixture card changed in the captured subset. The separate linked plan remains in its applied phase; mission history and app preferences remain identical.

A cold terminate/launch preserved the complete post-grade state. After cold launch, app accessibility nodes were unavailable through Device Hub, although the actual app remained visible and coordinate controls worked. Used the visible Study tab, temporarily set default text size, touch-scrolled to the saved-session entry and tapped Continue. [Cold-resumed screenshot](cold-resume-three-es.png) shows Hola 7 and three remaining. Stored queue is exactly catchup-7/8/9, with the same session identity and no added grade. Restored Text Size 11 afterward. VoiceOver and keyboard capture remain off. A subsequent midnight scenario separately uses default text size on this clone.

The known unsigned expo-notifications keychain banner was dismissed through its visible close control; this is not notification acceptance.

## Interpretation and remaining scope

B12.5-C3 completes full Hard maximum-text visibility, native keyboard VoiceOver focus/scroll access, standard coordinate grading after focus positioning, exactly-once new credit and cold resume. It does not close precise touch-only positioning at maximum text: available short/downward drags remain unreliable, and a later vertical drag on the card flipped its face. That ambiguity is not enough to diagnose an application scrolling defect. No speculative fix was applied. B12.5-C remains open for that route.

This is a narrow screen-reader focus check, not full VoiceOver announcement, audibility, order/rotor, every activity, Android or physical-user acceptance. Existing Again/Good/Easy evidence remains in the earlier reports. No broader learning-effect or language acceptance is inferred.

Run `python3 docs/qa/2026-10-17-maximum-text-focus/verify-evidence.py` to check the recorded transitions, unchanged focus checkpoints, exact grade/counters/queue, selected fixture mutation, linked-plan preservation and cold-resume invariants. The verifier never accesses a simulator. Formatting and whitespace checks are required before integration; unchanged application code does not require another full Jest run for this evidence-only package.
