# Library unlock integration — October 31, 2026

Owner authorized generous free core plus US$19.99 one-time library unlock. [Selected product and account setup](../../product/LIBRARY_UNLOCK.md), [design](../../superpowers/specs/2026-10-31-library-unlock-design.md), [plan](../../superpowers/plans/2026-10-31-library-unlock.md).

## Implemented

- Ten free starter collections, currently 331 development-library cards; 37 additional collections/1,061 cards covered by one permanent library product. Generated pronunciation and all existing core learning tools remain available for accessible content; custom cards/favorites/backups have no new quotas.
- Exact non-consumable product, localized store price, RevenueCat `full_library` entitlement, restore, refresh, cancel/pending/error/no-purchase states and duplicate-tap protection. Expo Go, web and missing/mismatched keys do not initialize a simulated purchase path.
- A journaled pre-seed migration keeps existing installation access; fresh installations remain free after restart or subsequent learning-backup import. Courtesy access is device-local and not exported as a purchase. Raw learning storage is not filtered or erased.
- Filtered DeckContext feeds learning lists/queues. Revocation removes additional bundled access while retaining user cards and stored progress. Active quiz snapshots are invalidated when questions or distractors become inaccessible.
- Study/Settings links and library samples/checkout/restore explanations in Spanish and English. Purchase UI never hard-codes $19.99; it uses the storefront price.

## Verification

- Baseline: **117 suites / 1,208 tests passed**.
- Final full Jest suite: **123 suites / 1,241 tests passed**, `npm test -- --runInBand --watchman=false`.
- TypeScript, ESLint and repository Prettier check passed.
- Data validation: **47 decks / 1,392 cards / 1,392 audio entries**, valid configured image dimensions.
- Editorial ledger validation passed structurally; **all 1,392 cards still await current acceptance**. No editorial or language approval is inferred.
- CocoaPods installation succeeded with `react-native-purchases` **10.16.0**, PurchasesHybridCommon **19.17.0**, RevenueCat iOS **5.99.0**. Initial SDK 11.0.0 depended on an unavailable PurchasesHybridCommon 20.1.0 pod even after repo update; pinning the preceding compatible release resolved this.
- Unsigned iOS Simulator Release build succeeded using Xcode SDK iPhoneSimulator27.1, both simulator architectures, dotenv disabled and Sentry upload disabled. It installed/launched on isolated iPhone 17 / iOS 27 simulator `CE57BF79-63B6-44EA-9641-24C69C8F6171`. [Observed onboarding startup](native-startup.png). This is native compile/startup evidence, not physical-device or billing acceptance.
- Independent code review identified active quiz access contraction and CustomerInfo-listener/product-refresh interference. Both reproduced with failing tests and passed after fixes. Further cache test proves purchased learning opens without waiting for a slow product lookup. No outstanding review findings were deferred.

## Compatibility decisions

- Preserved unknown/removed custom-card grading behavior and idempotent restore retries; access guard applies specifically to paid bundled IDs. Existing recovery regression exposed an overly broad guard, corrected before completion.
- Existing free-learning fixtures now identify their synthetic seed decks as actual free starter collection IDs. Assertions still exercise the same queues, due dates, new-day behavior, custom mutations and recovery.
- Google Play one-time products may report UNKNOWN for the Apple-specific product type; exact product ID, non-subscription category and absent subscription period remain required. Android account/native/runtime acceptance was not performed.
- New semantic-color consumers were added to the existing reviewed inventory; no static palette or arbitrary colors were added.

## Remaining before sales

Store/RevenueCat products and public SDK keys were not configured: no account-management connector was available. Real purchase, cancellation, approval/pending, restore/reinstall, refund/revocation and offline purchased cold launch require configured sandbox/store accounts and physical devices. Native dependency compilation does not prove transaction behavior.

Editorial acceptance, content/audio rights, public company privacy page reconciliation, store disclosures and final release acceptance remain open. The repository privacy policy and data inventory describe the conditional billing data flow; the external policy was not published by this task. No TestFlight upload, public submission, release or real customer charge occurred.
