# Study session large text — October 17, 2026

Base `5e0ba29`; bounded B08.2-B3 correction under the existing master plan. Preserve grading/checkpoints, active card/face, audio ownership and navigation while making existing Study controls reachable with enlarged text. This does not close B08.2-B or the whole AI roadmap.

## Cause and correction

Live maximum-size simulation reproduced stale native glyph heights across the session plus independently crowded horizontal rows. Session content had no vertical scrolling, region text was capped at44 points, flashcard faces were absolute inside a fixed278-point box, and the resume action squeezed the deck title into a narrow column. See `session-before-max-live.png`.

Study now uses a stable vertical ScrollView; headers/hints/grade rows stack at fontScale>=1.4, region strip height grows and labels expose button/selected/disabled semantics. Header/region/hints/grading native content remeasures by font scale, without remounting screen state or pending-save refs. Back/favorite targets are48 points. The resume action stacks below the full deck name.

Study opts into a content-sized single-face flashcard for enlarged text. It retains flip/audio/gesture state in the component, uses instantaneous transitions, and refreshes native face content measurements on scale changes. Text continues to scale without a maximum multiplier; long words may wrap across lines. The normal animated card remains available at default size. Difficult Words has not opted into expansion until its own container is adapted.

## Verification

Baseline80 suites/787 tests passed. Observed RED: missing selected region button semantics, enlarged flip still invoking the fixed 3D animation, and unintended changed behavior in consumers without scrolling. All three passed after correction. A pending-grade resize case also verifies disabled controls and exactly one write/advance. Full80 suites/792 tests passed; existing act warnings remain. Types/lint and calendar16 passed. Final formatting/data/content and fresh review results follow below.

## Native evidence

Dedicated iPhone18 Pro/iOS27, existing unsigned SDK57 binary and worktree Metro8098. No unrelated simulator was changed. Spanish/English default and accessibility-large session checks show intact rows and answer face; maximum headers show full names/counts and growing region controls. Spanish maximum scroll checks reached the full example, Listen/Stop and stacked grade labels/intervals. Both languages' maximum resume rows show full Business name, card count and Continue; English Continue reopened the same first card and nine-card queue. Representative screenshots are adjacent. No grade was submitted during these checks.

The answer remained revealed through maximum→default→large and language/tab changes. Read-only own-app storage snapshots prove exact queue/session/timestamp, daily1/5/newCount1,2 learning events and1392 cards unchanged across the recorded live-resize/reveal interval. Development Fast Refresh before the final-code baseline expanded the old eight-card development queue to nine; this is recorded rather than described as font-resize preservation. Later explicit Continue can refresh the checkpoint timestamp. Pending-grade timing is controlled-test evidence, not native fault injection.

## Decisions and limits

- Ruling: use vertical session scrolling and stacked controls for enlarged text. Cost: reaching distant controls takes scrolling.
- Ruling: use content-sized, immediate single-face cards at large text. Cost: no 3D flip there; the enlarged word uses a28-point base while still fully scaling.
- Ruling: make expansion opt-in for the scrolling Study consumer. Cost: Difficult Words retains its existing presentation until its container/layout package is completed.
- Ruling: remount only native metric content, retaining stateful owners. Cost: region-strip/native content scroll position can reset on font changes.

Physical screen-reader, narrow/landscape/tablet/Android runtime, signed notification/audio and all other activity/modal layouts remain open. No dependencies, scheduling rules, translations, release claims or paid/network services changed. The unsigned simulator's known expo-notifications keychain-entitlement warning is not signed-production acceptance.

## Review and integration

Fresh whole-package review found one P2: the stable ScrollView retained its bottom offset after a grade. A regression first failed because no scroll request occurred, then passed after adding a session-version-owned layout-effect scroll to the card area only after successful advancement. Pending writes retain their viewport. The full 80-suite/792-test run, typecheck, lint and formatting passed after this correction. Data validation passed for 47 decks/1392 cards/audio entries; editorial validation correctly reports all1392 awaiting current human acceptance.

Native follow-up at maximum text size: `session-before-grade.png` shows the visible Bien button at the bottom; one press immediately exposes the next director/a prompt in `session-next-card-visible.png`, without a manual scroll. Own-app snapshots show count/newCount1→2, learning events2→3, and exactly the queue suffix1802…1809. The original saved QA backup was restored through the app and the app restarted: daily1/5/newCount1 and original eight-card queue/timestamp returned. Learning history merges during import, so the single test observation remains (eventCount3); this is recorded rather than claimed as an exact history rollback. The size was returned to default and the interface to Spanish. This normal cleanup restore does not establish interrupted-restore acceptance.

Integrated as `186eb7a` on main and pushed. Merged-main verification passed80 suites/792 tests, typecheck and lint. [CI39025762291](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39025762291) passed all four jobs: types/lint/format/tests/content, Android project generation/bundle, iOS project generation/bundle and validation results. [Board deployment39025762296](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39025762296) also passed. Generation/bundling does not establish Android native runtime or signed release acceptance.
