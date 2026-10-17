# Applied active timing

## Goal and existing authorization

Implement the remaining active-time/calibration portion of B05.3, under the durable-daily-plan specification and standing instructions to complete AI work without repeated approvals, validate and merge/push. This extends the existing two-node authored written-response flow; it does not release draft language or add proficiency rewards.

## Contract

Reuse the focused/foreground Study timer for the single production-response → complete mission shape. Each actionable hint/answer command snapshots optional `activeDurationMs` (number or null). Unknown/unobserved or interrupted pre-answer segments are null. Saving, feedback, navigation blur, OS inactive/background and Android interaction blur are excluded. Revision changes reset the segment; retained retry uses the original command. Existing answer-event timing is a separate legacy observation and is not a calibration source.

New eligible runs have optional `activeTiming` {durationMs:number|null}; legacy runs without it stay unknown. Hint/answer segments accumulate durably; any missing/null segment makes the total unknown. Cold load with an unanswered response marks the next segment unknown, because pre-crash time was not checkpointed. Cold feedback resume can complete an already fully measured run. New fields validate strictly; old envelopes/backups remain valid.

The existing mission envelope gains optional bounded `timings` samples (max100). Each sample contains runId, missionId, contentVersion, occurredAt and durationMs. Record once only when that actual run transitions to complete, in the same durable transaction as mission/linked plan, not by creating a learning event. Retain samples through future mission starts and unrelated commands; retry cannot duplicate them. Backup already carries the envelope, so no new key is needed. Malformed/unknown fields fail before writes.

Use the last30 valid samples within30days, matching mission ID and content version, with distinct run IDs and 2–180 seconds active duration. Require five runs, take the median and clamp 15–90 seconds. Before that use60 seconds. Home preview and atomic plan factory share this calculation; production/unavailable content reserves zero. New calibration never changes a persisted queue or plan identity. Report estimates honestly without claiming speed indicates skill.

## Options

Rejected: reuse old learning-event wall-clock timings (background contamination and no completion/version proof); mutate old answer events on completion (breaks immutable merge identity); add a separate timing key (unnecessary backup/schema surface). Selected optional bounded mission-envelope samples and per-run active accumulator.

## Verification

RED/GREEN tests for strict old/new envelope validation, accumulated hint/retry durations, unknown segments, changed timing replay conflicts, version/future/old/duplicate filtering, five-run threshold and clamp, atomic final-write recovery, retention across run replacement and full-state backup. UI tests exercise focus/background/save retry and cold unanswered/feedback resume; Home/factory must agree and preserve frozen plans. Full suite/static/calendar/content and one fresh branch review. Available iOS checks verify active answer, background exclusion, completion, retained sample and cold resume. Broader platform/layout/hardware/editorial gates remain explicitly open.
