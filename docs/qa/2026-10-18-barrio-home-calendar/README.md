# Home acceptance evidence — calendar control probe and exact resume verifier

2026-10-18, base main26ddb8d. Product code/entry/dependencies/native configuration
unchanged. This closes the prior phone evidence-verifier minor, and records the
actual simulator calendar-control limit without calling a live zone/day check
complete.

## Exact resume verifier: RED → GREEN

The PR20 reviewer identified an evidence-only weakness: the phone verifier
checked the retained plan queue and resumed card ID but did not assert the whole
ordinary resumed session. The recorded session itself was independently correct.
This new package fixes the previously deferred finding outside that review pass.

New `scripts/tests/test_home_fixture_evidence.py` runs the actual committed phone
verifier with read-only in-memory snapshot substitutions. Ten invalid variants
change deck, queue order, extra card, card limit, new limit, session identity,
region, queue schema, missing queue or extra session field. Each recomputes the
saved session hash, so internal hash consistency cannot disguise the incorrect
resume. The original verifier accepted all10 invalid variants: [RED](verifier-red.txt).
Baseline evidence and a timestamp-only refresh passed.

The verifier now compares every resumed session field against the retained plan
session, allowing only updatedAt to differ. The same10 invalid variants now
raise assertions; baseline and timestamp-only controls still pass. All14 Python
QA tests pass (three verifier tests, including10 negative subcases, plus11
simulator-isolation tests): [GREEN](verifier-green.txt). CI's existing Python step
now discovers both test files under `scripts/tests/test_*.py`; its name explicitly
states that these tests do not establish native runtime acceptance. No historical
snapshot/image was edited or new native review-resume success inferred.

Run:

```
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts/tests -p 'test_*.py'
python3 docs/qa/2026-10-18-barrio-home-fixtures/verify-evidence.py
python3 docs/qa/2026-10-18-barrio-home-calendar/verify-state.py
```

## Actual mini calendar-control probe

Own-container preflight passed for actual iPad miniA17Pro/iPadOS26,
UUID`DF3686C1-A2E7-4870-B127-A83A8B67541D`. Current normal product entry8099.
All UI used CUA Device Hub. Read-only state collection and explicit-UUID official
simctl screenshots were used; no app-storage files were written directly.

Device Hub Home opened SpringBoard. A horizontal drag/page-dot tap did not
establish first-page navigation; the Home control again did. Opened visible
Settings. General showed no Date & Time entry. Focused the native Settings
search, enabled Capture Keyboard temporarily and typed Date: the actual UI
showed [No Results for Date](native/mini-date-no-results.png). Replaced the query
with Time Zone: the actual UI showed
[No Results for Time Zone](native/mini-zone-no-results.png). These observations
establish the available Settings UI result at this time, not the absence of
every possible simulator tooling capability.

Cleared the query, disabled Capture Keyboard and returned to ColombianSpanish
through its visible recent dock icon. Home was observed on the same original
Spanish/BarrioDark recommendation,0/5. Return preflight passed; all11 original
logical hashes,48decks/1402cards and11events exactly match the baseline and
prior batch's final normal state. Native Text3, OSLight and VoiceOver off remain.
No date, region, time zone, account or Mac clock setting changed. This probe
includes one real background/foreground return, not a calendar transition.

The passive state verifier checks two checkpoints/two image digests and own-path
preflights. It does not replay the UI or prove live day/time-zone behavior. That
acceptance remains open, alongside precise touch-only middle/maximum-primary
positioning and full long-name visual acceptance. A new supported input route,
targeted layout diagnosis or natural calendar transition is needed before
repeating unchanged failed routes. Physical/signed/Android/assistive/editorial
and blocked security gates remain explicit.
