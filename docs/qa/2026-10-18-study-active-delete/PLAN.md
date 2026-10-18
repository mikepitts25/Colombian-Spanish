# Active-deck deletion during held/interrupted grading

Continue B02.4-B2. Exercise actual Study/DeckProvider/transaction recovery, not management confirmations.

1. Cover both held grade learning-event journal and first deck application failure after durable journal creation; inspect original event intent in interrupted cases.
2. Delete alpha through provider, queued behind the held grade or recovering its durable journal first. Check one event/count/new credit; no alpha resurrection or stale retry/card. Cover remaining beta fallback and empty library.
3. Remount actual providers/Study, using normal visible Continue only where applicable. Check exact preserved beta queue/session, no recredit, correct empty state. A dangling historical session for removed alpha is not itself a resume claim; verify UI ignores it.
4. Add fixes only for reproduced contract failures. Run targeted/full/static checks and fresh review, update checklist/report, merge/push. Keep native/management confirmation/other interleavings and genuine human/account/device gates open; skip blocked security.
