# Smaller-iPad written voice alternative — 2026-10-19

This closes only B09.2-B2b: the existing unscored written alternative on the actual iPad mini A17 Pro / iPadOS26 development simulator. No product code changed. The approved Barrio Home implementation is already merged; its remaining Home-specific acceptance cells stay open.

## Setup and observed behavior

Own device `DF3686C1-A2E7-4870-B127-A83A8B67541D`, own container `C44142DA-0CDC-4927-A01A-38E7B024B9D1`, normal Metro8099 from the barrio-controls worktree at133c19b. Four preflights bracket the initial and final cold launches. No clone, cross-container operation, direct app-storage write, fixture import or grade.

Initially Device Hub exposed host nodes but omitted the app subtree. Its Controls menu → Home actually opened SpringBoard; a screenshot-grounded app-icon click reopened the same app, and a coordinate diagnostic dismissal restored app accessibility nodes. This is a working mini route, not proof that earlier phone input limits are fixed. The final cold launch again omitted app AX nodes; the rendered Spanish Home was inspected visually. The development expo-notifications diagnostic was dismissed separately; no notification registration repair is claimed.

At default text3, Spanish and English Practice without recording expanded an explicitly unscored example, `buenos días`. Replay/Delete were disabled, Ready to record remained visible and the screen explained that recording/replay awards no learning credit and does not assess pronunciation. Record and Stop were never pressed, and no microphone prompt appeared. No OS permission-state or recording-file audit is claimed in this packet.

At maximum native text11, each language showed the complete alternative action, full unscored label and full model together after accessibility positioning. Rotating left retained the expanded example and showed the full action/label/model in landscape; Controls → Rotate Right returned to portrait. Default portrait screenshots show all screen content without truncation. Maximum screenshots deliberately cover the alternative subsection, not the entire long screen at once.

One Spanish coordinate drag from the top revealed the full model and lower privacy paragraph. A reverse Spanish drag and a later short English drag did not visibly reposition; successful exact action/model positioning used accessibility-target scrolling. Consequently this is bounded visual/state/rotation acceptance, **not complete touch-only scrolling or assistive-user acceptance**. VoiceOver and Capture Keyboard stayed off during these checks.

## Preservation and cleanup

Eight read-only snapshots use the [existing collector](../2026-10-19-fresh-graded-editor/capture-state.py). Baseline:48 decks,1402 cards,11 learning events, daily0/5/new0, streak1/freezes1, existing ordinary queue catchup-7/8/9 and prior completed plan. The English snapshots differ only in uiLanguage. The normal Settings toggle back to Spanish restored the exact original preference object; all eleven records match baseline after restoration and actual cold restart (new PID74919). No backup recovery was needed.

Final settings match initial: portrait, text3, native Light, Barrio Dark, Spanish, VoiceOver/Capture Keyboard off. Learning data and session timestamps are exact, not merely equal counts. Screenshots were captured through explicit-device simctl and inspected during acquisition; file digests bind the archived images.

Run `python3 docs/qa/2026-10-19-mini-voice/verify-state.py`. This passively checks eight snapshots, logical record digests, four own-path preflights and eight image digests. It does not replay UI, prove touch provenance, establish OS microphone state or validate physical audio. Permission-granted capture/replay/interruption, app-specific Settings targeting, broader theme/window/platform/signed/physical tests and remaining R3/R4 cells stay open. Blocked security remains skipped.
