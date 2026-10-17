# B11.2 software acceptance audit

Baseline `516a9de`; no new product behavior proposed. Confirm the complete named B11.2 software matrix against existing implementation/tests, add the missing migration/read-refusal integration evidence, preserve genuine hardware/provider gates elsewhere, then review, merge and push.

1. Inspect corrupt/oversized/legacy/duplicate-ID parser and UI cases, serialized journals, current/legacy portable state, provider startup behavior and existing native interrupted-restore evidence. Do not infer coverage from test names alone.
2. Exercise an explicit legacy seven-section version-3 restore that fails during the canonical streak write after preferences have changed. Reads must remain blocked while the fault persists; successful replay must restore all supported state without losing newer observations or reviving a stale legacy streak. Verify retry idempotence and source immutability.
3. Exercise malformed JSON and unsupported schema in existing local history against an incoming valid full-state replacement; all raw stored keys must remain identical and no journal may be prepared.
4. Prove test sensitivity using isolated source-copy mutations: skip recovery before app reads and accept unsupported history schema. Baseline/restored runs must pass; each deliberate defect must fail the corresponding case. Never modify Metro-served product source.
5. Run current full/static checks, write a requirement-to-evidence matrix, get a fresh whole-branch read-only review and close B11.2 only if the named software cases are covered. Hardware low storage/durability, real cloud/share routes, Android and signed-candidate acceptance remain under B11.5/B12.
