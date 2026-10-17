# Relearning and cross-deck correctness audit

Baseline main `57530e5`. Implement the next bounded part of B02.4-B2 using the real Study screen/provider/storage boundary.

1. Exercise Again (15 minutes) and Hard (12 hours) from a fresh card. Check the exact not-due/due boundary, frozen unfinished queue and remount of its saved remaining membership/session. Finish that saved session without refilling it.
2. Set a daily new-card cap of one; introduce one card, switch decks, verify due reviews remain available while another new card is withheld, then return to the first deck for relearning without a second new-card debit. Assert event identities and unrelated-deck preservation.
3. Detect regressions in isolated copies: remove cross-deck budget subtraction and replace saved membership with eligible selection. Each relevant audit must fail for the intended queue discrepancy. Do not mutate the Metro-served working source.
4. Run focused/full suites and static checks; obtain a fresh final review. Record the exact test scope and avoid claiming native elapsed-time, calendar, OS or all cross-deck acceptance. Apply a product fix only if the unchanged app fails a valid requirement.
5. Update the master checklist, merge, verify and push main.
