# Explicit shared/multiple regions

October 15, 2026. Base `7d3bfcf`. Scope B03.2.

Cards can declare a unique nonempty `regions` array. Explicit metadata overrides inferred deck/tag membership and can include both shared/general and multiple named regions. Study and Quiz filter by any membership. Quiz renders all localized labels. Legacy cards and backups without metadata preserve the old inference behavior without an irreversible storage migration; malformed runtime metadata falls back defensively. Seed-content merging retains stored explicit regions.

Backup imports and authored-project validation reject unsupported, empty, duplicate and invalid region arrays. Schema-2 editorial inventory distinguishes explicit metadata from legacy inference and keeps regional verification unestablished. Existing card text/claims were not rewritten or editorially approved. See the authoring guidance in `docs/editorial/REGIONS.md`.

Eight initial region/project-validation regressions failed before implementation. Tests cover multi-region matching, general metadata overriding regional deck names, shared/general membership, legacy fallback, custom backup round trips, stored metadata through seed updates, and inventory provenance. Review found no blockers and identified a sparse-array edge; its regression failed before the validator correction. Both runtime malformed-value fallback and sparse-array rejection are now covered.

No simulator acceptance is claimed while the Mac remains locked. Actual editorial correctness, broad layout/accessibility/platform coverage and physical-device checks remain open. **44 suites / 448 tests passed**, plus types, lint, formatting, data validation and diff checks. Inventory regeneration includes all 1,392 cards, with region provenance explicit and verification unchanged. Independent follow-up found no blockers. Integration/CI results follow.
