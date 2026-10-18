# B02.4 editor/grade race audit

Scope: actual StudyScreen + DeckProvider + durable storage + grade coordinator. Audit existing behavior before deciding whether a fix is justified. No product redesign, schema change or synthetic native failure claim.

1. Hold the grade journal write; queue rename, same-card editorial correction and new-card insertion; release and verify all edits, exactly one grade, unchanged ordered remaining queue and cold remount.
2. Fail grade application after its journal is durable; let a real editor operation trigger recovery, then retry the original UI save. Verify the original attempt is acknowledged once, the correction survives, counts and scheduling stay unchanged by retry and exact queue resumes.
3. Run targeted integration tests, types/lint/format and full suite if adding substantial integrity coverage. Record whether failures are actual product defects or test-harness mistakes; do not invent a RED→GREEN fix if current behavior passes. Obtain independent review before merge/push.

Human/editorial acceptance, native OS faults and platform/device checks remain outside this software audit. Security access remains blocked and untouched.
