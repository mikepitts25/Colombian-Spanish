# Home maximum-text focus follow-up

Scope: actual iPad mini A17 Pro/iPadOS 26, device `DF3686C1-A2E7-4870-B127-A83A8B67541D`, Spanish Barrio Dark, normal development JS on port 8099. Product source unchanged from ecf1a2e; base main 11376ce. This is bounded native evidence, not complete Home acceptance.

## Observations

- Native Text Size 11: right-gutter drag followed immediately by gutter tap reached the middle hero once. Repeating that drag and a center drag did not reliably place the primary button. `mini-max-middle-hero.png` records that intermediate position.
- Enabled Device Hub VoiceOver and Capture Keyboard. Dismissed the native Gestures notice by focusing its visible OK and Control-Option-Space. Control-Option-Right traversed Home text, scrolled the plan content, and visibly focused the entire **Empezar mi plan** primary above the fixed tabs (`mini-max-focused-primary.png`).
- Disabled VoiceOver and Capture Keyboard. The full primary remained visible (`mini-max-primary-voiceover-off.png`). No primary activation, grade, hint, quiz start, mission start, import, or learning-state mutation was performed.
- Restored Text Size 3; observed normal Home, OS Light, VoiceOver off and Capture Keyboard off. All eleven captured app-key hashes and eleven existing events match baseline at maximum-primary and restored checkpoints; 48 decks/1402 cards remain.

## Acceptance boundary

Verified: keyboard-driven VoiceOver focus can reveal this maximum-text primary, and it stays visible after VoiceOver is off. This does **not** establish touch-only positioning, primary activation, full assistive usability, other configurations, visual long-deck acceptance, or live calendar transitions. B08.3-C3e and Task4 native acceptance remain open. No product scrolling defect is inferred from the automation gesture limitations. Next useful work requires a different gesture/input capability or an independently actionable matrix cell; do not repeat these unchanged failed sequences.

## Recheck

`python3 docs/qa/2026-10-18-barrio-home-touch-stop/verify-state.py` validates recorded durable checkpoints and image digests without controlling a simulator. Screenshots were captured only after CUA observation; storage collector is read-only. There was no launch/cold-start in this batch. The initial own-container preflight records the explicit device path. Checkpoints cannot prove absence of transient writes between them or replay empirical input.
