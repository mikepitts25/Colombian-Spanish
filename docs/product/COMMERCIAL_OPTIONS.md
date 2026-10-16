# Commercial options for owner review

Prepared 2026-10-16 for B14.2-A. These are concrete product options and hypothetical cost scenarios, not selected prices, vendor quotes, a revenue forecast or authorization to introduce payments. No paywall, billing account, customer contact or purchase was created. [Current competition](../../COMPETITIVE_ANALYSIS.md) and the [pilot](../pilot/PROTOCOL.md) inform the next decision.

The current app has no entitlements or paid hosted service. Its 1,392-card development catalogue has no currently accepted release cards. A saleable library depends first on accepted content/rights, a verified candidate and a clear maintenance/support commitment. Do not charge for an unsupported authenticity or learning-effect claim.

| Option                                | Concrete scope                                                                                                                                                                           | Value hypothesis                                                                                           | Main tradeoff / decision                                                                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A: Free local companion               | Accepted starter library, custom cards, scheduling, recognition quiz, backup and basic generated pronunciation. No hosted inference.                                                     | Low-friction preparation for people using another course/teacher; useful way to evaluate first-use demand. | Owner funds editorial, audio rights, device QA and support without assuming a future conversion rate. Define how much accepted content can be maintained.                                                               |
| B: Paid offline library               | Same local core, with a separately priced accepted library of practical missions/phrases and included audio. A free sample demonstrates the full practice loop.                          | A bounded purchase with useful local content; no account requirement solely to study.                      | One-time revenue must cover future support and platform updates. State exactly which library/updates are included; clarify restore/reinstall before launch. Do not promise unlimited lifetime new recordings.           |
| C: Core plus optional hosted practice | Accepted local core continues without the service; optional service grants a stated allowance of speaking/conversation minutes or sessions. Show remaining allowance and let users stop. | Adds feedback that the local authored path cannot provide, if evaluated as useful.                         | Recurring inference/support costs, consent/privacy, network dependence and account/spend controls. Select a provider and budget only after fixtures and evaluation. Never silently consume a paid allowance in retries. |

Start the pilot with the working local path. Compare interest in these options after useful tasks and delayed checks, rather than asking participants to value a hypothetical chatbot. An expression of interest is not a conversion forecast. Owner selection remains B14.2-B; conditional billing/sandbox work is B14.3.

## Cost model

Keep development/editorial investment, ongoing local support and hosted usage separate. For a selected service:

`monthly hosted variable cost = active hosted learners × sessions per learner × billable minutes per session × effective provider cost per minute`

The effective cost must include the chosen recognition, reasoning, speech generation, storage and retry policy. Some providers bill tokens or requests, so convert using measured traces; a minute is a scenario unit, not a universal vendor billing unit. Add backend/network/monitoring costs, human support, editorial/audio production and fixed account/tooling costs separately. Downloaded/bundled audio can have distribution costs even when playback is local.

Illustrative sensitivity calculations below use invented inputs only. The effective rates **are not quotes**. No paid plan price or promised allowance is inferred from them.

| Hypothetical case                        | Active hosted learners | Sessions per learner/month | Billable min/session | Assumed effective cost/min | Variable cost/month |
| ---------------------------------------- | ---------------------: | -------------------------: | -------------------: | -------------------------: | ------------------: |
| Light pilot                              |                    100 |                          8 |                    3 |                      $0.01 |                 $24 |
| Frequent practice                        |                    100 |                         20 |                    5 |                      $0.05 |                $500 |
| Same behavior at scale                   |                  1,000 |                         20 |                    5 |                      $0.05 |              $5,000 |
| Higher combined service cost             |                  1,000 |                         20 |                    5 |                      $0.15 |             $15,000 |
| Retry leakage, 25% more billable minutes |                  1,000 |                         20 |                 6.25 |                      $0.05 |              $6,250 |

At the middle scenario, variable cost is $5 per hosted learner/month before the other costs. This is a sensitivity result, not a viable subscription price. A hard allowance and per-user/global spend cap must bound the worst case. Audit cancellation/retry billing and throttle abuse; do not rely on the UI timer alone.

For offline-only use, this model's hosted-inference term is zero; total cost is not zero. Estimate accepted-content production, recording/rights, accessibility/device QA, releases, file distribution and customer support. No reliable amounts are available yet, so they must remain owner-supplied inputs rather than fabricated estimates.

For a paid option, calculate proceeds from the actual storefront/region contract, applicable tax treatment, refunds, discounts and selected purchase type. Do not use an assumed commission as a verified net-revenue estimate. A break-even scenario needs net proceeds, payer count and all costs; the current evidence does not support a profit forecast.

## Decision packet still required

- Product: accepted starter/paid-library scope, update/support promise, meaningful free path, accessibility and cancellation language.
- Learners: observed usefulness/retention, actual interest after use, perceived value and objections, with the small pilot's limitations recorded.
- Engineering: measured provider request/latency/error traces on approved test recordings, operating cost conversion, hard caps, offline/failure fallback and privacy/deletion behavior.
- Owner/accounts: budget ceiling, chosen provider/region/retention terms, storefront contracts, price/localization, billing access and publication approval.

AI can evaluate scenarios, build selected entitlements/backend controls and test sandbox flows after these inputs exist. AI cannot fabricate demand, language acceptance, rights, signed-device results or an owner pricing/provider decision. Keep local learning available when an optional hosted service is absent or unavailable.
