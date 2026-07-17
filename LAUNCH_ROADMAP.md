# Launch Roadmap — Colombian Spanish SRS

_Last updated: 2026-07-11_

Source: full codebase review (screens, SRS engine, storage, decks, audio pipeline, planning docs).
Strategy: don't compete with Duolingo — be **the** app for Colombian Spanish. The content moat
(1,365 cards, 100% audio coverage, voseo, regional decks) already exists. The gaps are the first
five minutes, learning-loop depth, and launch hygiene.

Legend: 🟢 done · 🟡 in progress · 🔴 not started · ⏸️ deferred

---

## Phase 1 — Correctness fixes (Week 1)

| #   | Item                                         | Status | Notes                                                                                                                                                           |
| --- | -------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | **Word of the Day actually rotates**         | 🟢     | `HomeScreen` used `rows.find()` → same card forever. Date-seeded pick instead.                                                                                  |
| 1.2 | **Real SRS intervals on grade buttons**      | 🟢     | Buttons hardcoded `<1d/1d/3d/7d`; compute the true next interval per card (like Anki).                                                                          |
| 1.3 | **Split new vs. review queues**              | 🟢     | `nextBatch` backfilled sessions with not-yet-due cards, inflating intervals on early reviews. New-card daily cap (default 10, configurable) + due-only reviews. |
| 1.4 | **Hide translation-review tooling in prod**  | 🟢     | Flagged/reviewStatus workflow is internal QA; gate behind `__DEV__`.                                                                                            |
| 1.5 | **App-level ErrorBoundary**                  | 🟢     | No crash guard existed. Friendly bilingual fallback + recovery.                                                                                                 |
| 1.6 | Crash reporting (Sentry) + product analytics | 🔴     | Needs an account/DSN — set up before store submission. ErrorBoundary is the in-app half.                                                                        |

## Phase 2 — Launch-makers (Weeks 2–3)

| #   | Item                                   | Status | Notes                                                                                                                                                       |
| --- | -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | **Onboarding flow**                    | 🟢     | Why are you learning? → region (Paisa/Rolo/Costeño/Valluno) → daily goal → straight into a 5-card first session. Time-to-first-flashcard < 60s.             |
| 2.2 | **Register/formality badges**          | 🟢     | `formal / casual / vulgar / flirty` on cards; ⚠️ warning styling for vulgar. Solves the piropos-deck App Store risk.                                      |
| 2.3 | **Streak freeze**                      | 🟢     | Earn 1 freeze per 7 consecutive study days (bank up to 2); a missed day consumes a freeze instead of resetting. #1 anger-review preventer in this category. |
| 2.4 | **Word-of-day push notification**      | 🟢     | Daily reminder includes the actual word ("🇨🇴 parce — remember what it means?") instead of a generic nag.                                                    |
| 2.5 | Cultural context notes (top 200 cards) | 🔴     | `culturalNote` field; "when NOT to say this." Content work, ongoing.                                                                                        |
| 2.6 | Market the voseo                       | 🔴     | Surface vos conjugations as a headline feature in store copy + onboarding.                                                                                  |

## Phase 3 — Ship (Weeks 3–4)

| #   | Item                                      | Status | Notes                                                                                                            |
| --- | ----------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| 3.1 | Store listings + screenshots              | 🔴     | Subtitle: "Slang, Voseo & Paisa Culture". Keywords: parcero, paisa, Medellín, Colombian slang, voseo.            |
| 3.2 | Monetization (RevenueCat lifetime unlock) | ⏸️     | **Deferred by decision** — revisit before submission. Free core + one-time unlock recommended over subscription. |
| 3.3 | Submit iOS + Android                      | 🔴     |                                                                                                                  |

## Phase 4 — Post-launch (deferred)

All deferred by decision for now:

- Cloze cards auto-generated from the 1,365 example sentences
- Listening-first mode (audio → recall) — unique asset: 100% audio coverage
- Type-the-answer with accent-insensitive matching
- Record-and-compare speaking practice (no ASR needed for v1)
- Storage migration: per-card user-state records (or SQLite) instead of whole-DB
  `JSON.stringify` per answer — **do this before expanding content past ~1,500 cards**
  (Android AsyncStorage ~2MB/entry limit; also removes seed-merge complexity)
- Content pipeline: decks → JSON + zod schema validated in CI (retires the `scripts/fix-*` fleet)
- Shareable slang-card images (react-native-view-shot) — organic growth loop
- Progress heatmap calendar
- On-demand audio download once bundle grows past ~27MB
- A few real native-speaker recordings for top-100 cards + honest "AI audio" labeling
