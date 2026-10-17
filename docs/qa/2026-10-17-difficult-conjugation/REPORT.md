# Difficult Words and conjugation accessibility — 2026-10-17

## Contract and correction

B08.2-B4 repairs the existing Difficult Words and conjugation flows. Keep the current difficult-card face, queue, pending attempt, dialog and selected tense through text resizing. Successful grading reveals the next prompt; pending/failed saves retain the current card and offset. Controls must remain reachable at enlarged text. Display actual scheduler previews without changing scheduling.

Difficult Words now has a stable vertical ScrollView, stacked enlarged headers/grades and opt-in expanding flashcards. Empty/loading content scrolls and remeasures on live font changes. Grading exposes disabled state while saving; duplicate prevention and retry attempt identity remain. The next-card scroll runs after index advancement. Fixed <1d/1d/3d/7d labels were replaced with the shared scheduler previews (15m/12h and card-specific success intervals).

Conjugation has a named48-point Close control, selected tense tabs, stacked enlarged tabs/rows and one scrollable body including notes and footer. The title/close area remains outside body scrolling. Stateful owners stay mounted while native metric content remeasures by font size.

## Automated evidence

Baseline80 suites/792 tests passed. Four new regressions first failed for missing pending-grade button semantics, missing next-card scroll, missing conjugation trigger button semantics, and incorrect fixed interval previews. After correction, targeted11 tests passed and full80 suites/796 passed. Typecheck/lint, calendar16 cases,47-deck/1392-card/audio validation and editorial-ledger validation passed. The ledger still correctly reports1392 awaiting current human acceptance. Existing asynchronous act warnings remain; no clean-console claim.

Fresh read-only whole-package review found no concrete actionable issues. Final merged-main checks and CI pending.

## Native evidence and limits

Dedicated iPhone18 Pro/iOS27 unsigned SDK57 development client, Metro8098. The pre-fix live maximum empty state reduced text to clipped strips (`empty-before-live-max.png`); corrected text reflows and scrolls (`empty-es-max.png`). Spanish/English populated default layouts and maximum stacked grades are captured. Two ordinary Again grades through Study prepared difficult cards in this dedicated QA fixture. One Difficult Words Bien grade moved1/2→2/2 and immediately exposed director/a at maximum size without manual scrolling. Revealing it and resizing back to default retained director and its full example. Native grade labels show15m/12h/1d/1d for these fixtures; controlled tests independently assert15m/12h/2d/2d for an older card.

Spanish conjugation default→maximum→accessibility-large checks retained Future and hablar forms. The maximum body scrolled to the final form and full regional-use note while Close remained reachable. English default reopening retained Future; maximum translated selectors and Close were checked. Representative screenshots are adjacent. These are representative portrait checks, not complete narrow/tablet/Android or physical screen-reader coverage.

During capture, CoreSimulator updated its framework1171.7→1174.9.2 and shut down the simulator. The pending screenshot timed out; the dedicated simulator and Device Hub were restarted and the conjugation checks repeated successfully. This service restart is not evidence of dialog-state persistence across process death. The known unsigned expo-notifications keychain-entitlement warning was dismissed; no signed notification acceptance is claimed.

Read-only own-app snapshots show1392 cards and daily4/5/newCount3/events6 unchanged through the subsequent conjugation checks. Explicit Continue after the service restart refreshed the checkpoint timestamp; no exact timestamp-preservation claim. Cleanup used the original own backup through the app and a cold restart. Daily1/5/newCount1 and the original Business eight-card queue/session/timestamp were restored with1392 cards. History is merged by design, so events6 remain; no exact history rollback is claimed. Default text size was restored. This normal cleanup does not establish interrupted-restore acceptance.

## Decisions and costs

- Use scrolling and stacked enlarged controls. Cost: full content requires vertical navigation; very large words can wrap within a word.
- Keep the conjugation title and Close fixed above a single body scroller. Cost: the dialog occupies80% height and long content requires scrolling.
- Remount native metric content only. Cost: body/region text position can change on resizing while learner state remains.
- Reuse actual scheduler previews. Cost: compact labels retain the existing shared scheduler abbreviations.

Physical screen-reader behavior, audio-route quality, narrow/landscape/tablet/Android runtime and broader theme/activity consistency remain under B08.2-B/B08.5/B08.6. Human language acceptance is unchanged. No dependencies, external services, release flags or authored conjugation data changed.
