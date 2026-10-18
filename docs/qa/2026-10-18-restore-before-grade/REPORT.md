# Restore before stale Study grade

Task: B02.4-B2s. Base: `e7c59e0afeca1bd6fd76cd2efd98a28257af2650`.

This audit reverses the ordering in B02.4-B2r. A real full-state restore starts first while the mounted Study/provider still has the old two-card Alpha queue. The old visible Bien action submits before the provider is reloaded. Product code is unchanged.

## Cases and expected behavior

`__tests__/screens/StudyLifecycleIntegration.test.tsx` adds four cases: removed target or retained new target with an exhausted restored daily cap, each behind a held restore journal or after a durable restore journal whose first deck application failed.

The held cases assert the restore is still pending and the raw stored decks remain original before releasing the write. Interrupted cases assert rejection, a retained journal and the original raw deck record. Each submits through the actual Study action and uses the real provider, restore, transaction coordinator and grade path. AsyncStorage is an in-memory Jest adapter; the write interception controls the specific persistence boundary.

All four assert:

- The restored decks and all nine portable state fields remain exact, including daily 7/new 3/target 12, preferences limiting new cards to 3, streak, empty seen/quiz data, imported one-card queue, reminder preferences and empty missions/plan state.
- No learning event or extra daily/new credit is created. The write journal clears after completion or recovery.
- Explicit provider reload reads the restored decks without erasing imported state.
- A React unmount/remount resumes exactly `restored-next`, with one remaining card, no old first/second card and no event. Only the expected checkpoint timestamp changes to the fixed current time.

The missing-card non-plan submission resolves without credit and the old mounted screen locally advances to its former second card before reload. This is an observed stale in-memory presentation, not proof of an automatic restore UI handoff; full restore still requires restart. The cap cases display the existing translated daily-limit error. An initial fixture used different Spanish wording than the actual translation; correcting that assertion required no app change.

## Verification

Focused command:

```sh
npm test -- --runInBand --watchman=false --runTestsByPath __tests__/screens/StudyLifecycleIntegration.test.tsx
```

22 cases pass, including the four additions. A temporary isolated mutation bypassing the fresh stored daily-cap check in `flashcardAnswer.ts` makes both new cap cases fail; the mutation is reverted and the focused file passes again. No runtime changes remain. Full-suite and static verification results are recorded in the accompanying verification file after execution.

## Limits

This is software integration evidence, not native navigation or process-death evidence. No simulator data was read or mutated for this batch. It does not establish safe grading after arbitrary changed-content replacement, moved-card behavior, plan-linked grading, every import mode/order, native interruption, or physical-device acceptance. Ordinary non-plan grades locate cards by global ID; only plan-linked grades currently reject a deck movement explicitly. That separate movement/content contract remains unaudited here and is not marked complete. Existing content/editorial, security-access, Android-license and appearance-design gates remain unchanged.
