# Durable daily plan

## Intent and scope

Finish B05.3's three/five/ten-minute guided practice: bounded due-first review, a small permitted amount of fresh material, then one applied response. Preserve exact resume, local progress, editorial gates and honest measured estimates. Standing user instructions authorize implementation and merge/push of AI work; implement serially in reviewable packages. This spec defines the persistent contract first. It does not declare the full experience complete before the UI and simulator packages pass.

## Options and decision

Inferring the plan from today's counters cannot distinguish manual practice or recover exact phase membership. Storing navigation parameters alone cannot survive process death or backup. Use one versioned durable plan envelope, serialized through the existing write coordinator and included in full-state backup. Do not introduce a server/account dependency.

## Persistent contract (B05.3-B2a)

`SRS_DAILY_PLAN_V1` stores `{schemaVersion:1,current:DailyPlan|null}`. Missing storage means no plan; malformed/unknown storage throws and is retained. DailyPlan has stable `id`, local `day` label, `minutes` (3/5/10), `createdAt`, `phase` (review/applied/complete), optional exact `review` LastStudySession, and optional `applied` descriptor (missionId/contentVersion/runId). Every identity is nonempty; numbers are finite and bounded. A plan needs at least one activity. Review requires an exact version-1 bounded queue, session identity and limits; the current card matches its first ID. Review phase requires a nonempty review queue. Applied/complete phases require no remaining review IDs. Applied phase requires its descriptor.

A start snapshots all input before waiting for the coordinator. A repeated identical ID returns existing progress without restarting. A different input under that ID is a conflict; a new ID cannot silently replace an unfinished plan. Completed plans can be replaced by an explicitly started new plan. Day/zone or preference changes never silently replace an unfinished plan. This contract does not claim that arbitrary caller-provided activity IDs are accepted/released: the forthcoming UI must select only available registry content.

`AnswerAttempt.planId` optionally links a grade to the current plan. Linked grades must match the plan identity, phase, current card, deck/session identity and exact next queue/region/limits. A successful durable grade removes precisely the first planned ID and moves to applied (if present) or complete. It saves plan, schedule, event, counters and normal resume checkpoint in one journal. Stale linked grades fail before writes. Normal manual grades do not change a plan. Replaying an already retained attempt remains idempotent and cannot advance a replacement plan.

Full-state backup includes optional `dailyPlan` envelope in applicationState. Old version-3 state without this field resets plans to the empty envelope when explicitly restoring all state. Deck-only imports preserve local plans. Validate all plan fields before any restore writes. Existing learning-event history merge semantics stay unchanged. No migration invents a plan for older learners.

## UI and applied phase (B05.3-B2b, remains open after contract package)

Home starts/resumes the persisted next phase. Build a bounded plan from current preferences/budget and actual eligible content; reserve estimated time for one short authored response, using review-only fallback when no applied content is available. The draft source is the existing authored first-morning production content, explicitly labeled and development-gated until real acceptance. A short response is distinct from completing the entire first-morning mission. No language acceptance is inferred from fixtures.

Study receives plan identity, loads its exact queue, and uses linked grades. Explicit independent browsing/filter changes detach the local Study flow and leave the plan resumable. Completion offers a direct applied handoff; leaving the app retains the next phase. Mission start/commands must validate the linked run and complete a plan only from that run's actual completion. Missing/deleted/changed source content offers safe fallback/restart rather than silently replacing IDs. Pending writes disable navigation that could duplicate intent; recoverable failures retain the exact attempt for retry.

## Timing and acceptance (B05.3-B2c, remains open)

Review pace already uses active measured samples. Applied timing must distinguish content version and active interaction from background/save waits, retain retry identity and avoid inventing pre-crash durations. Use initial estimates until sufficient valid complete-activity samples exist. Do not equate speed, attendance or hints with mastery. Budget is an estimate, not a destructive timeout. Capture actual three/five/ten-minute starts, cross-phase restart, errors and English/Spanish layouts in available simulators. Keep native Android, signed/hardware and human editorial/learner evidence separate.

## Verification and invariants

Pin malformed storage/import, copied queued input, competing starts, exact queue advance, stale plan/card/session/limits, normal grades, replay, disk failure/recovery, old-backup reset and deck-only preservation. Full suite, types/lint/format/calendar/content checks and independent review precede merge. Foundation completion alone leaves B05.3-B/B05.3 open.
