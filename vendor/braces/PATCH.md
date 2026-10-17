# Local depth guard — braces 3.0.3

Upstream package: MIT, https://github.com/micromatch/braces/tree/3.0.3 (commit74b2db2938fad48a2ea54a9c8bf27a37a62c350d). Registry tarball: https://registry.npmjs.org/braces/-/braces-3.0.3.tgz, integrity `sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==`. Original source, package metadata, README and MIT LICENSE retained.

Local mitigation for https://github.com/advisories/GHSA-vfj7-8cjw-p6xm: add lib/depth.js; call its fixed128 semantic-container ceiling in parse.js (parentheses and braces) and recursive compile.js / expand.js / stringify.js walkers. Walkers also guard directly supplied ASTs. Quoted/escaped text remains literal. Inputs beyond the ceiling now throw a controlled SyntaxError. This deliberately restricts extreme nesting; it is not an upstream release and does not address arbitrary expansion cardinality or unrelated advisories.

Keep version3.0.3 so vulnerability scanning continues to report the upstream advisory. Do not infer security from an audit-count reduction when replacing packages with local files. Remove this override only after verifying a supported upstream release against the security and compatibility tests.

Run `npm run security:pack-braces` to regenerate vendor/braces-3.0.3.tgz. Source diff and tests are reviewable; the installed tarball is checked against source by regression tests. The root explicit development dependency anchors npm's local path resolution; the `$braces` override applies it to every consumer. No lifecycle script is needed, including with `npm ci --ignore-scripts`. Upstream formatting is excluded from app lint/formatting to keep the patch small; executable security tests remain in the normal Jest suite.
