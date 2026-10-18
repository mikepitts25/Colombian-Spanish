# Barrio Home — native goal edit and real read/start recovery

2026-10-18; base main9a6e1a0, unchanged product runtimeecf1a2e. Actual iPad mini
A17Pro /iPadOS26, UUID`DF3686C1-A2E7-4870-B127-A83A8B67541D`, own container
preflighted before/after all three cold launches. Spanish/BarrioDark, native
Text3/OSLight/VoiceOver off/CaptureKeyboard off throughout. All UI actions used
CUA Device Hub; screenshots are official explicit-UUID simctl captures after
CUA observation. No phone/source/alias device operated. No security work.

## Goal edit on normal product entry8099

Settings→Meta Diaria: choose10 instead of5. Read-only capture proves this draft
changes none of11 storage keys. Save shows the native confirmation and Home
updates from0/5 to0/10, preserving its recommendation and exact stored prior-day
completed plan. Only daily progress target changes5→10; count/newCount/date,
preferences, decks, queues, missions and11events remain exact. Cold restart
retains the exact changed11 hashes and visible0/10. The cold-state capture was
made after opening Settings/goal editor again; these intervening actions were
read-only, with no additional edit/save. Save5 and return Home restores all11
original hashes immediately. [Saved Home](native/mini-goal-saved-home.png),
[restored Home](native/mini-restored.png).

## Bounded fault injection on an isolated test entry8100

The [test-only harness](native-harness.jsx) wraps the real App. It arms exactly
one `AsyncStorage.getItem('SRS_DAILY_PLAN_V1')`, holding its promise until Reject
or Release. It never changes returned data, app files, storage files, providers,
controllers or navigation. This is a deterministic read failure, **not actual
low storage, disk damage or OS process death**. No new product dependency or
entry/config change. Existing verified unsigned foundation Debug binary reused.

An isolated host copy `/tmp/colombian-home-fault-wly09pkt` was created from
`git archive9a6e1a0`, with cloned dependencies and only its package main pointing
to the harness. Normal8098/8099 servers and product package main were preserved.
Executed harness digest is in metadata. Checked-in harness is exactly the
Prettier output of that executed file (confirmed by formatting/comparing it);
formatting only. The overlay covers the greeting cup or part of the Study
remaining badge, so these images do not establish those details visually.

1. Settings→arm→Home holds the real focused refresh. Reject produces
   [read error](native/mini-refresh-rejected.png): stale plan phases, activity
   counts and due-deck rows are hidden, independent tools/browse remain.
   Visible coordinate Retry restores the recommendation on Home
   [without starting practice](native/mini-refresh-retried.png). All11 keys
   remain exactly original throughout held/rejected/retried captures.
2. Arm on loaded Home, then press Empezar mi plan. The existing controller holds
   at its fresh plan read; [primary shows disabled loading](native/mini-start-held.png).
   Reject yields the [start error and Retry](native/mini-start-rejected.png),
   still with all11 original hashes. Coordinate Retry opens
   [Study Hola4](native/mini-start-retried.png). Storage proves exactly one
   current plan object with new identity/day2026-10-18/review phase, initial and
   remaining queue catchup4/5, limits card2/new2, exact linked Study session and
   applied mission reference. Only daily-plan and ordinary-session keys change.
   No new mission run or learning event/grade/hint/reward is recorded. This
   verifies retrying a plan start, not the separately tested direct-deck retry.
3. Settings clipboard preview visibly confirms original48decks/1402cards/
   11observations. Restore app state acknowledges restart. Terminate and launch
   the normal product entry8099, then stop only verified harness Metro PID23451.
   [Final Home](native/mini-final-normal.png) has no QA overlay. All11 hashes
   match baseline exactly, including prior-day plan, original queue and11events.
   The known unsigned notifications/keychain banner was dismissed for captures.

## Verification and remaining scope

`python3 docs/qa/2026-10-18-barrio-home-goal/verify-evidence.py`

Twelve snapshots/eight images; passive verifier checks available field hashes,
complete retry queue/identity/limits, exact goal-only changes, no events and
baseline restoration, image digests and own-container preflights. It does not
replay UI procedures. Original backup remains outside git with hash metadata.

Native read/start failures and goal editing are now evidenced for this mini
Spanish/default-text configuration. Live day/zone changes, phone/bilingual/font
fault combinations, precise touch-only middle/maximum-primary positioning and
full long-deck visual acceptance remain open. `cua.getApp('Simulator')` returned
Invalid app; installed Xcode's enumerated app inventory did not expose a
standalone Simulator.app. No repeated failed gesture route or app defect claim.
Signed/physical/assistive/editorial/Android gates and blocked security remain
separate. Existing prior phone-verifier minor remains deferred, not fixed here.
