# Progress evidence — October 16, 2026

Scope: B08.4-B1, bounded extension of existing Progress; no storage migration, provider or content changes.

## Behavior

Shows retained checked attempts and correct counts for recognition, recall, listening and speaking separately; self-ratings do not become checked results. Assisted counts combine explicit hints, model reveal and transcript reveal once per attempt. Missing hint history, or missing listening transcript history without another known assistance marker, remains unknown. Includes draft missions and retries explicitly; at most 5,000 retained observations, not lifetime ability or efficacy scores. Local voice self-check remains unscored. Existing quiz-only recognition stays separate. Removed inactive Share; explicit practice actions navigate Quiz and Study.

## Verification

Pure summary tests first failed for missing module; screen behavior test first failed for missing evidence UI, then passed. Final suite: **76 suites / 757 tests passed**; types/lint passed. Fresh whole-package review found no actionable issues. Summary is read-only; no events, SRS or daily counts written.

Dedicated iPhone16Pro/iOS26.0 simulator, Expo Go54.0.7 UUID `121168CB-C271-4202-AC19-94F8DAE7B8B1`: Progress accessibility tree reported recognition 0/1 (mission only; quiz-only empty), recall 3/4 with 2 assisted and 1 self-rated, listening 3/3 with 1 assisted, speaking empty. Practice recognition opened Quiz with one available studied word; Back returned Progress. Review flashcards switched to Study and preserved the existing Business resume entry. No answer was graded. Device Hub scroll/drag did not reliably reveal the entire long section visually; all row counts and actions were checked through its accessibility tree. Full large-text, both-language, tablet and Android visual acceptance remain open.

Voice batch `acd2baf` was merged/pushed and CI38857476897 passed quality/content plus both platform project-generation/JS-bundle jobs. This Progress batch merge/push and CI are recorded separately once complete.
