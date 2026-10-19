# Release Barrio Home: native process timezone, real midnight and theme retention

2026-10-19, source main0891b60. The installed unsigned Release executable/plist/embedded bundle still match the independently reviewed [Release build](../2026-10-19-release-bundle/README.md), built from2b6665d; later commits change evidence only. This completes bounded B08.3-C3k: optional Barrio/System behavior plus a real focused day boundary in a native process configured for America/Anchorage. It does not establish live system-timezone changes or close the complete Home/R4 matrix.

## Scope and supported setup

Only fresh own-path SE3/iOS26 `D5502A06-4858-428C-901C-587B58280F64` was operated. Six before/after preflights and each read-only capture validate its container. No fixture import, deck/card change, grade, media action, direct app-storage write, host clock change, JS time mock or product-code modification. The normal development Metro8099 remained alive; this is the previously compiled Release app with its embedded bundle.

Apple's installed `xcrun simctl help launch` explicitly supports propagating `SIMCTL_CHILD_` variables to a launched process. `simctl ui` exposes no timezone control. We used the official child-environment route, not a modification to device Settings or global timezone:

```sh
SIMCTL_CHILD_TZ=Pacific/Honolulu xcrun simctl launch --terminate-running-process D5502A06-4858-428C-901C-587B58280F64 com.mikepitts.colombianspanish
SIMCTL_CHILD_TZ=America/Anchorage xcrun simctl launch --terminate-running-process D5502A06-4858-428C-901C-587B58280F64 com.mikepitts.colombianspanish
```

Honolulu PID99362 changed the normal Release Home to Buenas noches and persisted October18 while the device status-bar clock stayed on Berlin time; the preceding normal launch had observed October19. Only the daily record's date changed; count0/target5/new0 and the other ten records stayed exact. Anchorage PID195 also observed October18. A proposed native `/bin/date` read was unavailable (spawn code111), so no assertion relies on it. Host Python zoneinfo supplied expected IANA dates/UTC boundary, without changing the clock. These are **native app-process timezone** checks, not a live change to the simulator OS timezone.

## Release theme and language checks

The original preference record is explicit Classic/System/Spanish. Selecting Barrio without Save leaves all eleven hashes exact. Save applies Barrio/System; Home visibly follows native Light→Dark without a preference or learning-state change. Live Text3→11 retains the production review-only presentation; full Spanish and English primary labels fit after accessibility-target scrolling, with no primary activation. English changes uiLanguage only. These are bounded visual observations, not touch-only or assistive-user acceptance. Saved Classic/Spanish, Text3 and native Light then restore the exact pre-theme Anchorage record hashes.

Because earlier native midnight reports covered Classic, we reapplied Barrio/System/Spanish for the remaining Barrio-specific boundary cell. This changes only prefs before the boundary. Production Home has no authored reply phase or development preview route; no plan or queue was started. The existing ordinary Greetings0009–0013 session/limits/timestamp remain exact.

## Real focused midnight

Barrio Home was left focused before the actual America/Anchorage midnight at **2026-10-19 08:00:00UTC**. PID195 stayed alive before and after. No UI navigation or app restart occurred between the before-boundary Home and the sampled date transition. The [read-only acquisition sampler](capture-midnight.py) sampled every two seconds, writing only host evidence when hashes changed. It observed the date change at **08:00:25.050490UTC**,25.05seconds after real midnight, before subsequent CUA navigation. It did not set a time or invoke a refresh. Home's existing focused minute timer is in `src/hooks/useFocusedAsync.ts`.

Full before/after snapshots differ **only in SRS_DAILY_PROGRESS_V1.date**, October18→19. All ten other canonical records—including full ordinary session, exact checkpoint time, preferences, decks and absent plan/mission/event records—stay exact. Counts were already zero: this is not positive-counter reset, allowance consumption or nonzero-streak acceptance. The sampler records three change points (initial Classic, saved Barrio, midnight); it is not a continuous archive of every read or proof that no transient write occurred.

The first post-boundary full native AX tree, before navigating, showed **Buenos días**, **meter presión**, and0/5. The prior word was **tinto**. Those heading/word claims are recorded CUA observations; the passive verifier cannot replay them. Progress subsequently showed0 of5,47decks/1392cards and no practice evidence. Its snapshot preserved all eleven new-day hashes. The post-midnight Home PNG was captured **after returning from Progress**; it is not an image taken at the instant of automatic refresh.

## Exact cleanup and recheck

Saved Classic again and plain-launched without SIMCTL_CHILD_TZ (PID6384), returning to the default device timezone. Both the restored and final plain-cold snapshots match **all eleven original baseline hashes** exactly:47decks/1392cards, zero events/daily credit, unchanged Greetings session and explicit Classic/System/Spanish. Native Light/Text3, VoiceOver/Capture Keyboard off were observed. No backup restoration was needed. The retained QA app remains on Classic Home.

Run `python3 docs/qa/2026-10-19-native-zone/verify-state.py`. It checks15full snapshots, three timeline points, six own-path preflights, nine native PNG digests, installed binary identity metadata, date/prefs-only transitions and exact final restoration. The collector remains [the existing read-only wrapper](../2026-10-19-fresh-graded-editor/capture-state.py). Verification does not replay UI/OS actions, rebuild the binary, re-observe process environment/PIDs, prove continuous execution or establish signed/physical acceptance.

Still open: live OS timezone/DST changes, positive-counter/new-cap/retained-plan midnight cases beyond this fresh profile, precise touch-only controls and long-label cells, remaining window/theme/platform/interruption checks, Android agreement, signed candidate, physical audio/assistive and content/learner/account gates. Blocked security remains skipped. Native process setup is a bounded validation choice; any system-zone or signed-candidate claim needs its own test.
