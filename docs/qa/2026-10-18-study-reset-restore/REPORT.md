# Active-session reset and backup recovery

B02.4-B2q adds three combined StudyScreen/DeckProvider/real backup/transaction cases, passing against existing product behavior. This is audit coverage, not a RED→GREEN product fix. No runtime, UI, dependency, content or storage schema change. Baseline32904ac CI39104505082 and board39104505154 passed.

Each case begins an actual two-card alpha session with unrelated beta. Good creates the actual durable grade journal; the first deck afterimage is deliberately rejected. The visible save error and journal's original event/session are inspected before the subsequent mutation. Real storage recovery occurs during the mutation, not through test-synthesized successful grade writes.

| Mutation after failed grade application                | Observed result before and after original UI Retry                                                                                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active alpha reset via actual provider                 | Both alpha cards retain content and receive the intended fresh reset schedule; Retry does not regrade first or undo reset.                                                              |
| Validated legacy backup replace plus provider reload   | Imported alpha name, corrected first answer, imported schedule and additional third card are exact; beta remains exact. Retry does not overwrite restored data.                         |
| Validated legacy backup merge-new plus provider reload | Local alpha name/content and complete original first-card grade afterimage (including schedule) remain; only absent third card is added; beta remains exact. Retry preserves the merge. |

Each checks provider/durable agreement, one original Good event, count1/newCount1 and no remaining journal. Frozen remainder is exactly second, retaining original session/configuration: neither freshly reset first nor imported third expands the active queue. After visible original Retry, second is displayed with one remaining. React unmount/remount and visible Continue preserve exact queue, decks, event history and daily counters. This tests storage/provider restore semantics with normal reload, not Settings confirmation/file/clipboard flows.

Run `npx jest --runInBand --watchman=false --runTestsByPath __tests__/screens/StudyLifecycleIntegration.test.tsx`. Targeted16/16 passes, including three new cases. Controlled in-memory AsyncStorage faults and React remount do not prove native disk/process death or physical recovery. Full-state portable restore, imported removal/movement of remaining IDs, other asynchronous completion orders and broad OS/platform/assistive acceptance remain open in B02.4-B2 and related parents. No native UI changed, so no new simulator result is claimed.

Security B01.8-C2g remains access-blocked and skipped without retry/bypass. Android agreements, downloadable-audio design approval, editorial/recording rights, product/account/signing and genuine human/device gates remain separate.

Validation: full101 suites /1008 tests, TypeScript, zero-warning lint, repository formatting and whitespace checks pass. Independent review found no Critical issues and identified incomplete merge schedule assertions. This was treated as a required evidence fix: the merge case now compares the complete first card against the original durable journal afterimage, including due/interval/ease and all other fields. Targeted/full/static checks were rerun after strengthening that assertion. No finding is deferred.
