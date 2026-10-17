# Istanbul YAML migration — 2026-10-17

Base: `ad6b553`. Scope: B01.8-C2e, removing the remaining sprintf-js chain from test/coverage configuration tooling. No application UI or native module behavior changed.

## Change and compatibility boundary

An exact-parent override resolves `@istanbuljs/load-nyc-config@1.1.0` to existing root `js-yaml@4.3.2`. Its loader uses only public `load()` for YAML files; it does not call removed `safeLoad` APIs. The lockfile removes its nested js-yaml 3.15.2, argparse 1.0.10 and sprintf-js 1.0.3. Argparse 2.0.1 remains for current YAML consumers. Other dependency versions/ranges remain unchanged.

YAML coverage configuration is now data-only: JavaScript-specific YAML tags such as `!!js/regexp` are rejected. Existing `.js`/`.cjs`/`.mjs` config loading is unchanged. This intentional schema restriction is preferable to retaining obsolete YAML object constructors; users with such legacy YAML need ordinary YAML values or an explicit JavaScript config. The regression exercises the actual Istanbul loader in a separate Node process, not a mock of YAML parsing.

## Verification

- Before the override: focused suite **1 failed / 2 passed**. The failing case demonstrates JavaScript-specific YAML object construction. [RED log](targeted-red.log).
- After the override: all **3 focused tests pass**, preserving relative YAML extends, kebab-case settings, aliases, arrays, booleans and thresholds; malformed YAML and circular inheritance still fail.
- Initial npm install/update retained the old nested package despite reporting an override. `npm ls` exposed the invalid resolution. Removing only the stale nested lock entry and regenerating the lockfile eliminated the obsolete chain. A subsequent **clean `npm ci --ignore-scripts --strict-peer-deps` passed** and `npm ls` reported a valid tree. The resolved installed Istanbul YAML is 4.3.2.
- Full **coverage** execution passed **91 suites / 892 tests**. Aggregate coverage: statements 88.51%, branches 84.74%, functions 84.9%, lines 90.22%. [Full output](full-coverage.log). Generated coverage artifacts were kept outside the repository.
- Typecheck, ESLint with zero warnings, and focused Prettier checks passed. Documentation/JSON formatting and git whitespace checked before commit.
- Fresh independent review found no actionable issues after checking actual loader use, resolved dependency tree and all three focused tests.

## Audit evidence

Full audit: **56→51 findings**, removing all five moderate inherited/direct findings; 51 high, zero critical remain. The remaining advisory roots are braces and node-forge. After migration the omit-dev tree reports **28 high / zero moderate / zero critical**. Omit-dev includes Expo build tooling and is not a mobile runtime exploit count. Exact [before](audit-before.json), [after](audit-after.json) and [omit-dev after](audit-omit-dev-after.json) snapshots are retained. Audit exit code 1 is expected because unresolved high findings remain.

Registry checks still list braces 3.0.3, node-forge 1.4.0 and sprintf-js 1.1.3 as latest, with no fixed release for the tracked advisories. This package removes the sprintf-js consumer path instead of downgrading Jest or Expo as suggested by npm audit. B01.8-C2 remains open for the other two roots and their separately verified fixes/backports.

## Simulator investigation kept separate

Largest-text Study touch drags in Device Hub repeatedly jumped between top and bottom. Code inspection confirms the flashcard responder claims only horizontal-dominant moves and the parent remains a vertical ScrollView. Text-size reflow, physical-size and magnified host display controls did not yield a completed upper-label inspection. No app clipping fix or new native acceptance is claimed; B12.5-C remains open. Continue independent AI work rather than repeating the same coarse gestures indefinitely.

## Integrated verification

Implementation `cb3f27c` merged and pushed to main. [CI 39042396347](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39042396347) passed all four jobs: quality/content, iOS generation/export, Android generation/export and validation summary. [Board deployment 39042396346](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39042396346) also passed. Local calendar integration passed 16 cases across Berlin, Bogotá, New York and Auckland; data/audio validation passed 47 decks/1,392 cards; editorial validation passed while retaining all 1,392 pending human acceptances. The local calendar runner emitted the existing Watchman recrawl warning; no test failed.

Remaining no-patch statements were reconfirmed against the primary [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and [node-forge advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv). They are open dependency work, not human-only tasks.
