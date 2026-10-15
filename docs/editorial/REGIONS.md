# Explicit region metadata

Cards may declare `regions: ['general', 'rolo']` (nonempty, unique members of `general`, `paisa`, `rolo`, `costeno`, `valluno`, `llanero`). `general` indicates shared/general content; add a specific membership only when editorial evidence supports it. Arrays allow multiple regions without forcing a phrase into one exclusive bucket. `all` is a UI filter, never stored metadata.

Explicit membership overrides deck-name/tag inference. Missing metadata retains legacy inference without rewriting old backups. Invalid runtime values fall back defensively; authored data and backup imports reject invalid arrays. Seed merging preserves stored explicit membership, and backups preserve the field. Quiz uses all localized region labels; Study/Quiz filters match any declared membership.

Inventory schema 2 adds `regions` and `regionSource` (`explicit` or `legacy-inference`). `inferredRegion` remains for legacy-inferred cards and is null for explicit cards. `regionVerification` stays `not-established`: declaring metadata does not prove linguistic validity. Existing library claims have not been promoted to editorial acceptance or automatically rewritten into explicit declarations. Editors should review memberships alongside phrasing, register, speaker context and source evidence before accepting release content.
