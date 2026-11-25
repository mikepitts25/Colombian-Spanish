# Christmas G1 local rehearsal

November 25, 2026. Tested the Christmas checklist worktree based on `7ed24865fda9`, including uncommitted implementation changes. The proposed offer is free-only. The local simulator shell reports version and build `1.0.0 (1.0.0)`.

| Check                                       | Observed result                                                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript, ESLint, Prettier                | Passed                                                                                                                             |
| Full Jest suite                             | 1,490 tests in 138 suites, with one passing snapshot                                                                               |
| Source data and editorial ledger validation | 47 source decks, 1,392 cards and 1,392 pronunciation files validated. The ledger has 1,392 cards awaiting current text acceptance. |
| Calendar integration                        | Passed in Europe/Berlin, America/Bogota, America/New_York and Pacific/Auckland                                                     |
| Real Christmas preflight                    | Blocked by the missing `docs/editorial/christmas-release-approval.json`                                                            |
| Full-library production preflight           | Blocked by 1,392 cards without current attributed text acceptance                                                                  |

An isolated checkout used synthetic decisions to exercise the normal subset build hook and Expo's iOS embed command. The hook reported manifest digest `1bc4b3d208af337dab9e57d5dee0d5bc0419d6c18e56eead3063aaddc4972966` for 61 cards, two visits, 61 pronunciation clips and two café images. The bundle compiled to Hermes bytecode. The packaged pronunciation directory and café artwork directory contained exactly the selected media, and all 63 files matched the proposal's SHA-256 hashes.

On the iPhone 17 simulator running iOS 27.2, both the initial launch and a fresh process launch reached the bilingual language picker. The install used a fresh app data container. The temporary app was removed and the simulator was shut down after the check.

G1 remains open. The fixture uses a previously compiled simulator shell, with a separate local bundle identifier and updates disabled. The production candidate still needs real editorial and rights approval, a signed archive, and physical iPhone and iPad checks. Existing purchase access, device audio and interruption behavior, cross-install backup, and actual reminder delivery remain unverified on the signed candidate.
