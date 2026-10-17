# Phrase browsing maximum-text correction

Base `334862a`; B08.2-B and B08.5-B. Existing mini SDK57/iPadOS26.0 binary1.0.0/build1.0.0; Metro8098.

- [x] Reproduce and capture live text-size clipping in topic browsing before editing.
- [x] Add meaningful behavior coverage for selected-topic/action retention across live dimensions; expose favorite state and preserve in-flight saves without duplicate actions.
- [x] Invalidate native measured content on font changes while retaining screen state, make enlarged topic/card actions fit and scroll, and provide 48-point named action targets.
- [x] Verify representative native bilingual/default/maximum topic, favorite and Study handoffs without grading; confirm durable effects. Run quality checks and fresh review, update master checklist.

Integration: merge/push after these gates, then verify resulting CI.

No new subsystem or content acceptance. No security patches, SDK license acceptance, signing or media rights work. Native screenshots establish geometry; Jest behavior tests do not.

Scope extension from direct native evidence: Favorites showed the same clipped scaled icons and unnamed actions after the saved-phrase handoff. Include its measured-content refresh, named 48-point actions, scrolling header and query/pending-removal retention tests in this bundle. Search text survives font changes; focus/scroll position may reset when the measured subtree remounts.
