# TestFlight engineering and distribution preparation

October 20, 2026; source main `9269736`, with the release preparation files described here. B14.6-A/B are bounded preparation tasks. [The release handoff](../../release/TESTFLIGHT.md) owns the continuation order; this report does not establish signed candidate acceptance or TestFlight availability.

## Engineering verification

The initial existing installation lacked the declared `expo-system-ui` package and failed two configuration tests. `npm ci --no-audit --no-fund` restored the lockfile dependencies without changing either manifest. No app-source fix was needed. The final checks used Node 22.16.0:

| Check                            | Evidence / result                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                       | [typecheck.log](typecheck.log), exit 0                                                                                                 |
| ESLint                           | [lint.log](lint.log), exit 0                                                                                                           |
| Full Jest suite                  | [jest.log](jest.log), 117 suites / 1,175 tests pass                                                                                    |
| Calendar integrations            | [calendar.log](calendar.log), four tests in each of Berlin, Bogotá and New York                                                        |
| Python QA tools                  | [python.log](python.log), 14 tests pass                                                                                                |
| Data/assets                      | [data.log](data.log), 47 decks / 1,392 cards / 1,392 pronunciation mappings validated                                                  |
| Editorial ledger structure       | [ledger.log](ledger.log), valid; all 1,392 cards await acceptance                                                                      |
| Deterministic inventory          | `npm run content:review` then `git diff --exit-code -- docs/editorial/content-review.json package.json package-lock.json`, exit 0      |
| Local production config          | [production-config.json](production-config.json), no microphone usage description, tablet/scene support and fingerprint runtime policy |
| iOS production JavaScript export | [ios-export.log](ios-export.log), exit 0; includes local diagnostics configuration and is not the remote signed candidate              |
| Content preflight                | [content-preflight.log](content-preflight.log), expected exit 1: all 1,392 cards lack current attributed acceptance                    |

The local Hermes export is `/tmp/colombian-spanish-testflight-ios-20261020/_expo/static/js/ios/AppEntry-ed87e62ff194b548015b37fe545adb78.hbc`, SHA-256 `dcf8adcf2b60a3e3feaf5d50367969d091eb33d3fa115717f5de55280b7c661a`. It is not committed, signed, uploaded or installed. Exporting JavaScript does not compile or sign an IPA.

## Editorial handoff

[The first batch](../../editorial/testflight-first-batch.json) contains 88 exact current inventory rows from Greetings, Travel, Food and Daily Life, with the source fingerprints/versions and empty decision fields. Compared each row to the regenerated complete inventory: exact match. The actual review ledger remains empty. The 88-card batch does not reduce the installed library or satisfy any language/audio/rights gate. Actual decisions follow [the existing workflow](../../editorial/RELEASE_WORKFLOW.md).

## Live access inspection

Expo project access and remote version lookup succeeded. Current remote iOS build number is `1.0.1`; the three latest listed iOS builds are old preview builds. Project and account production environment listings report no variables. The Mac has distribution/development signing identities; EAS shows this app's active Ad Hoc profile, not an established App Store profile/submission key. The browser App Store Connect session needs sign-in. No credentials or service settings were changed or secret values retained.

`devicectl` reported no available physical device; the known iPad is unavailable. No simulator was booted or learner data changed. The seven known iOS groups remain open in [the existing case map](../2026-10-20-ios-remaining/README.md). Android remains paused and skipped security work is unchanged.

## Upload packaging

The initial `eas build:inspect --stage archive` staging copy included local `.Rhistory` and approximately 263 MB of QA/design documentation. Added `.easignore`, preserving root `.gitignore` exclusions and excluding those non-build files while keeping required editorial inputs. Local history was not read, edited or deleted.

Validate the final staging copy against [upload-inspection.json](upload-inspection.json): every asset file must remain byte-exact, required build inputs must match, excluded paths must contain no upload files, and the content gate executed against the staging root must still reject the 1,392 drafts. EAS may leave empty excluded directories in staging. A first wildcard/negation proposal omitted editorial files; it was rejected by the required-input check and replaced with explicit non-build directory exclusions before acceptance.

Only the final staging result is acceptance evidence. Source staging is not a signed Xcode archive, an upload or an accepted candidate. Refresh the inspection after future packaging changes.
