# Release Home: new-card allowance and retained review plan

2026-10-19, source main `3d4bba8`. Bounded B08.3-C3n native acceptance under the approved [Home plan Task4](../../superpowers/plans/2026-10-18-barrio-home.md). Product code is unchanged. Same compiled unsigned Release SE3 as the [bundled-startup packet](../2026-10-19-release-bundle/README.md); this is not signed-candidate or complete Home acceptance.

## Controlled inputs and device scope

Only own-path QA device D5502A06-4858-428C-901C-587B58280F64 was operated. Nine preflights bracket four launches; thirteen read-only snapshots use the [existing collector](../2026-10-19-fresh-graded-editor/capture-state.py). No other device/source, direct app-data write, host clock change, JS time injection, new grade/event, media, account or blocked security operation.

Baseline matches the previous [unavailable-plan packet](../2026-10-19-release-plan-recovery/README.md) exactly: normalized empty portable records, one prior QA event, original Classic/System/Spanish/five-minute prefs, daily0/5/new0 and ordinary Greetings0009–0013 session. Verified each canonical backup field/deck/history hash before using the host-only baseline backup.

The cap fixture changes only prefs (Barrio/System/English/newCardsPerDay1) and daily (count1/newCount1, same current day/target5). The counter values are prepared QA inputs, not newly earned credit or a new observed grade-exhaustion sequence; cards remain1392new and the prior event unchanged. The UI minimum new-card limit is1, not0. The second fixture uses the same cap state and adds an old-day review-only plan: ID release-retained-review-plan-20261019, day2001-01-01, minutes3/createdAt1000, initial/remaining0009–0013/current0009, all regions, limits6cards/5new, session release-retained-review-session-20261019 and checkpoint1000. Exact plan archived in verification.json. This is imported test state, not a naturally created or completed plan, and has no applied/reply phase or mission run.

Each fixture was opened in TextEdit, copied through UI, previewed in Settings as47decks/1392cards/one observation, and applied with Restore app state followed by cold launch. No full backup/deck payload is published.

## Exhausted fresh allowance

Cold launch PID27567 retains the cap fixture exactly. English Barrio Home shows Choose something to study, Today's new-card allowance is used, Browse all decks,1/5 and zero new available. No fresh start or draft reply is offered. Browse opens the Study library with the original ordinary Continue entry, changing none of the eleven records. Switching interface language to Spanish changes prefs only; Home shows Elige qué estudiar, exhausted-allowance explanation and Ver todos los decks. These are default-text Light observations; zero new available also appeared in AX. No capped grade or arbitrary deck-start behavior is inferred.

## Original review plan wins and resumes

Cold launch PID28563 retains the second fixture exactly. Home now shows Pick up where you left off, five remaining, Review cards · Current, Continue my plan and Manage plan despite zero fresh allowance. It displays no fictitious reply phase. Manage was visible but not separately activated.

Saved future study time5→10minutes through normal preferences, then switched language to Spanish. Only prefs changes. The saved plan remains exactly its original three-minute/old-day definition, queue and timestamp; Home shows Quedan5tarjetas and Continuar mi plan.

Continue opens actual Study at hola with five remaining. The complete plan stays exact; only the global SRS_LAST_STUDY_SESSION_V1 adopts the plan's saved deck/current card/queue/session ID/limits and refreshes updatedAt. This intentionally replaces the previous ordinary checkpoint ownership; it is not a claim that the global session remained byte-identical after starting the plan. No flip, grade, mission or new event occurred.

Plain cold launch PID29456 preserves all eleven started-state hashes. Home still offers the same retained plan. Study tab's Continue then reopens hola/five remaining using the linked plan session; only global updatedAt refreshes. The plan's own checkpoint stays1000, IDs/limits remain exact, and daily counters/history/deck digests do not change. This verifies ungraded continuation under prepared exhausted-budget input, not permission to grade new cards beyond the daily allowance.

## Exact baseline recovery and boundaries

Used supported baseline backup import, then plain cold launch PID30312. All eleven current-batch baseline hashes match immediately and after restart: original empty plan, prefs, daily counters and original ordinary session/timestamp restored, one prior QA event retained. This does not claim a pristine zero-history installation. Final native Light/Text3, VoiceOver/Capture Keyboard off; Classic Home left visible. No unrelated device or development server was stopped.

Run `python3 docs/qa/2026-10-19-release-home-budget/verify-state.py`. It checks13snapshots, recomputed archived record/event hashes, fixture-only deltas, cap Browse no-write behavior, preference-only changes, exact plan invariants, global session ownership/timestamp transitions, cold persistence, exact recovery, nine preflights and eight PNG digests/dimensions. It does not replay UI, read screenshot pixels, independently prove launch PIDs, rebuild the app or archive every intermediate instant. UI claims are native AX observations plus the portions visible in the images. Full deck equality relies on recorded digests, not published card payloads.

Still open: full Home empty/read/start-error/theme/window/platform/touch matrix, actual focused calendar/DST/live OS-zone cases, graded allowance/retained-plan boundary combinations beyond these inputs, Android agreement/runtime, signed candidate and physical audio/performance/assistive checks. Editorial/content/learner/account decisions remain distinct. Blocked security stays skipped and production content remains gated.
