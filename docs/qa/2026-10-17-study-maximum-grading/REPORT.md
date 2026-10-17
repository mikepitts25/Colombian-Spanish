# Narrow Study maximum-text evidence — 2026-10-17

Baseline main `11ea040`, normal unsigned Expo SDK 57 development client, Metro 8098. Dedicated iPhone SE (3rd generation) / iOS 26 clone `6A8A8DE1-3A9A-480B-9D9A-9082E5C6F5B1` was copied from the restored QA fixture after shutting down its source. The source fixture was preserved. UI actions used CUA; snapshots were read-only own-app AsyncStorage inspection. No application code or app-storage files were edited.

## Verified evidence

- Cold-launch → Study → Continue restored ordinary session catchup-3 through catchup-9, with seven remaining. The separate linked daily plan was already in its applied phase.
- Set native Text Size to maximum (11), flipped the card and scrolled to grading. Long upward drags exposed Good/Easy; available short/downward drags did not reliably position the earlier row.
- An attempted short drag beginning on Good submitted a Good grade for catchup-3. This is explicitly part of the fixture history, not a successful backward-scroll check. Daily count 3→4, events 6→7, queue 7→6; only that fixture card changed.
- Focusing the static grading prompt through the native accessibility tree brought Again fully above the fixed tabs. [Maximum Spanish Again screenshot](again-maximum-es.png) shows Otra vez and 15m. An actual coordinate tap at the visible control submitted quality 1 for catchup-4: daily 4→5, events 7→8, queue 6→5. This proves full-label visibility and coordinate touch after accessibility positioning; it does not prove a precise touch-only scroll route.
- Cold terminate/launch preserved the five remaining IDs and counters/events. Study Continue reopened the same session/card.
- The exposed native Hard action (Difícil, 12h) submitted quality 2 for catchup-5 once. A held-click attempt did not provide a pre-grade screenshot, so no full Hard visual or coordinate-touch acceptance is claimed. Daily 5→6, events 8→9, queue 5→4.
- A second cold terminate/launch → Study Continue returned to Hola 6 with exactly catchup-6/7/8/9 and the same session identity. No duplicate events or grades. The separate linked plan, mission history and preferences remained identical at every checkpoint. All unselected synthetic fixture cards remained unchanged at each grade; shipped-card immutability is not independently asserted from the subset snapshots.

The source fixture's existing edited QA translations were retained. This is controlled synthetic history, not learner acceptance or evidence of proficiency.

## Validation and limits

Run `python3 docs/qa/2026-10-17-study-maximum-grading/verify-evidence.py` from the repository. It checks the recorded transitions, exactly-once event appends, counter/queue changes, intended fixture-card changes, linked-plan preservation and exact cold resume. It never accesses simulator storage.

B12.5-C remains open for Hard's full maximum-text visual/coordinate touch and touch-only positioning. B12.5-C2 records the completed Again and action/persistence subchecks. No persistent app clipping defect was established and no speculative product fix was applied. The drag ambiguity remains an automation limitation/acceptance gap; this evidence does not diagnose its cause.

The known unsigned expo-notifications entitlement banner was dismissed through UI before initial checks and reappeared after cold launches. Notifications, Android, signed-candidate, physical device and complete screen-reader acceptance remain separate gates. The clone is left at maximum text size with its four-card ordinary session resumed. No full Jest suite was rerun for this evidence-only package; formatting, whitespace and the native-evidence assertions were checked before integration.

Fresh independent evidence review reran the verifier and inspected the screenshot, recorded transitions and checklist scope; no actionable inaccuracies or merge blockers found.
