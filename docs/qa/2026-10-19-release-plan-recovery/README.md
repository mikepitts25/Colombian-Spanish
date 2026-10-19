# Release Barrio: unavailable saved-plan recovery

2026-10-19, source main6068b4c. Bounded B08.3-C3m validation against approved [Home plan Task4](../../superpowers/plans/2026-10-18-barrio-home.md). Product code unchanged; same unsigned compiled Release SE3 installation as [bundled startup](../2026-10-19-release-bundle/README.md). No signed candidate or complete Home acceptance claim.

## Controlled fixture and own-path scope

Only QA device D5502A06-4858-428C-901C-587B58280F64 was operated. Seven explicit own-path preflights bracket the three launches. Twelve read-only snapshots use the [existing collector](../2026-10-19-fresh-graded-editor/capture-state.py). No other simulator/source, host clock, direct app-data file, grade, recording, playback, network control, account or blocked security task was operated.

The starting baseline is exactly the normalized, one-QA-event final state of [C3l](../2026-10-19-release-calendar-return/README.md). A host-only supported v3 backup combines those current portable records/history with original decks whose canonical digest matches the live baseline. A copy changes only prefs.themeId to barrio and dailyPlan to an applied-only plan: ID release-unavailable-plan-20261019, day2001-01-01, minutes3, createdAt1000, daily-morning-greeting version99, retained run release-retained-run-99. The exact plan is archived in verification.json. This is explicitly imported QA state, not a naturally completed review or newly accepted mission; it contains no review phase. The independent ordinary Greetings0009–0013 queue remains unchanged.

Opened the exact fixture in TextEdit, copied it, allowed paste in Settings, inspected47decks/1392cards/one observation and selected Restore app state. Imported state changes only plan and prefs; cold launch PID20000 preserves those exact eleven hashes. Source content stays gated in Release: this observes unavailable content under the production gate as well as a mismatched fixture version; it does not isolate version mismatch as the sole cause or prove version1 would run in Release.

## Observed recovery and preference retention

Spanish Barrio/System/Light Home reports Tu plan guardado necesita atención, unavailable greeting activity, Abrir plan guardado and Gestionar plan. Open saved plan leads to the original DailyPlan recovery, with unavailable explanation, Terminar plan (conservar progreso) and Volver al inicio. Opening and Return Home leave every durable record exact, including plan/run IDs, day/version and ordinary queue timestamp. No mission run/event is created and no replacement plan starts. Manage was visible but was not separately activated.

Switched UI language to English and saved future learning time5→10minutes through normal preferences. Only prefs changes; the original plan keeps minutes3/day2001/identity. Home continues to show the saved-plan recovery state. Applied native Text3→11, opened the same plan, then used accessibility-target scrolling to position the full End plan and Return Home buttons. The six native PNGs include the initial maximum-text top view and separately positioned controls. Both buttons fit fully in the final positioned image. The explanation spans scrolling views; this is AX positioning/activation, not touch-only scrolling or assistive-user acceptance. No maximum-text Home-primary full-visibility claim.

Pressed End plan (keep learning progress). Only SRS_DAILY_PLAN_V1 changes to its empty current:null envelope; ten other records, decks, one existing event and full ordinary session stay exact. Home returns to ordinary guidance based on the new ten-minute preference (eight-card suggestion observed through AX, not started). Plain cold launch PID21651 preserves all eleven ended-state hashes, with no replacement plan or grade.

## Exact recovery to this batch baseline

Restored native Text3. Opened the exact current-batch baseline backup in TextEdit, copied it and used Settings Import Backup→Restore app state, acknowledging restart. Because this baseline already has normalized portable defaults and the same one event, supported restore matches all eleven starting hashes immediately and after plain cold launch PID22323. This does not undo C3l history or claim a pristine zero-event installation. Final Classic/System/Spanish, five-minute preference, daily0/5/new0, original five-card queue/session/timestamp and one prior QA event all match this batch baseline. Native Light/Text3, VoiceOver/Capture Keyboard off; app left on Classic Home.

## Verification and remaining boundaries

Run `python3 docs/qa/2026-10-19-release-plan-recovery/verify-state.py`. It checks all twelve snapshots, recomputed archived record/event hashes, exact fixture-only delta, cold persistence, read/open/return invariants, preference-only changes, plan-only End, exact baseline recovery, seven preflights and six PNG digests/dimensions. It does not replay UI, read pixels, prove PIDs/launch environment, rebuild the binary, or exercise every intermediate instant. Exact deck preservation relies on the captured deck digests; the complete deck payload is not published. Narrated UI facts come from native AX observations; only the pictured portions are screenshot evidence.

Still open: complete Home state/error/window/theme/platform/touch matrix, retained review-phase plans across live native calendar changes, signed candidate/Android agreement/runtime, hardware audio/performance/assistive checks and content/learner/account decisions. B01.8-C2g remains skipped. Production content remains gated; fixture import is test preparation, not content publication.
