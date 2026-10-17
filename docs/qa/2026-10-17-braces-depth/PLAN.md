# B01.8-C2f — bounded braces walkers

Base c32c7de. Reproduced braces3.0.3 expand with4,900 nested braces (9,801 characters, under its10,000 limit) throwing native stack RangeError. Official advisory GHSA-vfj7-8cjw-p6xm still lists no patched version. Node-forge remains separate.

1. Pin regressions against installed braces: excessive brace/parenthesis/mixed/unclosed nesting and direct AST walkers reject with a controlled SyntaxError; escaped/quoted text and normal glob/range/nested patterns remain compatible. Observe RED on original3.0.3.
2. Vendor exact MIT upstream3.0.3 source/license, recording provenance. Add a fixed128-container depth ceiling in parsing and compile/expand/stringify walkers, including direct AST inputs. Avoid regex character counting so quoted/escaped braces retain semantics. Keep upstream version3.0.3 and explicitly label local patch; do not invent an upstream patched release or suppress the advisory.
3. Pack source into a committed deterministic local tarball and use npm override for every braces consumer. Verify tarball/source equivalence, strict clean installation with scripts disabled, npm dependency tree, real micromatch behavior, upstream compatibility tests where practical, full app suite, both platform exports/prebuild, static/content checks and available native smoke.
4. Obtain fresh branch review, update master/evidence with actual audit and limitations, merge/push and verify CI.

Ruling: Local tarball override was probed in an isolated temporary package. Directory overrides leave dependencies uninstalled; tarball override installs the normal registry dependencies. Preserve3.0.3 so npm audit continues to identify the upstream advisory; mitigation evidence is explicit rather than relying on the audit count.
