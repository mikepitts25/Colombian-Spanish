# Bounded brace-pattern traversal — 2026-10-17

B01.8-C2f. Base `c32c7de`. Local mitigation for [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm); the advisory and registry still list no fixed upstream release (latest braces3.0.3). Node-forge is separate open work.

## Reproduction and correction

On the installed Node24.5.0 package, braces.expand with4,900 nested braces throws native `RangeError: Maximum call stack size exceeded`. Its9,801-character input is below the existing10,000-character limit. A length guard alone does not bound recursive AST traversal. Compiler/stringifier and caller-supplied AST paths need their own ceiling, and parentheses also form AST containers.

Vendor the original MIT braces3.0.3 source/license and add a fixed128-container semantic depth ceiling. Parsing checks before pushing either parentheses or brace containers; recursive compile/expand/stringify walkers check container depth even when called directly with an AST. The ceiling cannot be disabled through options. Exceeding it throws a controlled SyntaxError; normal, quoted and escaped patterns retain their semantics. This deliberately rejects extreme nesting and does not address arbitrary expansion cardinality or arbitrary malformed AST parent links.

[Minimal source diff](source-diff.patch), [provenance/maintenance](../../../vendor/braces/PATCH.md). Upstream version3.0.3 is retained; this is an app-maintained patch, not a claimed upstream release. The deterministic `npm run security:pack-braces` archive is installed through a root local-tarball dependency and `$braces` override for every consumer. The explicit root dependency anchors npm's relative path resolution; a bare relative file override failed under a preexisting graph. A directory override also skipped dependency installation in the probe. No lifecycle hook is needed.

## Verification

- [RED](targeted-red.log):13 failures / two compatibility passes against original3.0.3. [Clean GREEN](targeted-green.log):16 passes covering source nesting, mixed/parenthesis/unclosed/range paths, direct AST walkers, literal escaping, ordinary expansion/glob output, depth128/129 and archive/source/installed byte parity.
- Upstream tag3.0.3, commit74b2db2938fad48a2ea54a9c8bf27a37a62c350d: unchanged test files with the five locally patched library files: **764 tests pass** ([log](upstream-tests.log)). Temporary runner used Mocha10.8.2, bash-path2.0.1 and fill-range7.1.1 with lifecycle scripts disabled; no runner dependencies were added to the app.
- Strict clean installation with scripts disabled passes on Node24.5.0/npm11.5.1 and separately Node22.23.3/npm10.9.9. [Node22 result](node22-clean-test.log):16 security/parity cases pass. `npm ls --all` is clean. Only root dependency metadata and braces resolution/integrity changed in the lockfile; no package versions were upgraded or removed.
- Repacking twice produces identical integrity: `sha512-HlhkV5VQ6G2snEnx2RjvpAXkMRH61oGChFXE80CfUwf9F3Zsyp5MZySsyx/rxo2ARUpgcXLVWhe3rNKIkq0BKQ==`, matching the lockfile and installed contents.
- Full app: **94 suites / 922 tests pass** ([log](full-suite.log)). Types, zero-warning lint, format and data47decks/1,392cards/audio pass. Both production iOS/Android exports pass; both platform native projects generate under Node22 with no package manifest change ([log](node22-prebuild.log)). These are not signing or native-compilation claims.
- Fresh independent review reran16 tests and additional brace/parenthesis boundary cases across all four APIs, checked direct AST paths, consumer resolution, archive/source/license and EAS inclusion; no actionable findings.

## Native smoke

Restarted normal Metro8098 from the patched worktree. A port-close race initially left the replacement server stopped; after confirming that terminal process and no listener, restarted and verified the running status before native relaunch. No app change was required.

Existing unsigned SDK57 iPhoneSE3/iOS26 fixture `738E7A96-DCC0-459A-BDC3-EBAC4E6FBA04`: normal cold Home shows3/5; Study → Continue resumes **Hola3 / seven remaining**, then native flip reveals its saved translation. [Capture](native-cold-resume.png). No grade submitted. [Read-only state](native-state-check.json) preserves all library/learning state and exact queue/session identity; only the checkpoint timestamp refreshes. No app storage was edited directly. This exercises Metro startup/bundling/navigation with the override, not hostile data through a mobile UI.

## Audit boundary

[Full audit](audit-after.json) remains **51 high**, zero moderate/critical; [omit-dev](audit-omit-dev-after.json) remains **28 high**. Braces3.0.3 continues to be reported intentionally. Scanner counts are not evidence that a custom tarball is safe; regression/compatibility/source evidence establishes this bounded mitigation. Replace the local fork only after a supported upstream release passes these checks. Node-forge and other remaining migration/advisory work stay open; no publication or external vulnerability report was sent.

## Integrated verification

`05d874f` merged and pushed to main. A strict clean main install with scripts disabled passes; merged full suite **94/922** passes. [CI39049683788](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39049683788) passed all four jobs (quality/content, both platform generation/exports and summary). [Board39049683842](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39049683842) also passed. Native and upstream results above are retained with the branch evidence. Audit51high/28omit-dev and the local-fork maintenance boundary remain explicit; B01.8-C2g and broader roadmap work stay open.
