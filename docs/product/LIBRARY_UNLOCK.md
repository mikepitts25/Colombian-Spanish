# Free core and one-time library unlock

Selected by the owner on October 31, 2026. Intended US price: **$19.99**, purchased once. The app displays the localized price supplied by the store and offers no subscription or auto-renewing trial.

## Included value

Ten starter collections remain free: greetings, food/drink, transport, travel, medical/emergency phrases, numbers, essential phrases, conversation, restaurant phrases and accommodation phrases. The actual release library follows editorial acceptance; development counts are not reviewed-content claims.

Reviews, quizzes, pronunciation for accessible cards, custom cards/decks, favorites, progress, backups and learning preferences remain free. There are no ads, mistake limits, mandatory accounts or launch paywalls. Additional bundled collections are covered by the one-time unlock, with corrections to those collections included. Future separately sold courses and hosted services are outside this purchase.

Study and Settings link to the library screen. Each additional collection offers one text sample before purchase. The screen lists exact included collections, explains the scope, displays the store price only when a valid product is loaded, and offers restore and refresh. Cancellation, pending approval/payment, failure and no purchase found have separate messages. Learning remains available while billing is slow/unconfigured/offline.

Existing installations are granted their existing bundled library through a journaled first-upgrade migration before content seeding. This courtesy access is local to the installation, not a store purchase; it can be lost after uninstall/device change. It is disclosed in the app and excluded from progress backups. Restoring a backup on an initialized free install does not create a paid entitlement. OS-level full-device backups may preserve local application state; cross-device restoration of the courtesy grant is not promised.

## Account configuration needed

The code integration does not create store/RevenueCat products. No RevenueCat or App Store management connector was available during integration.

1. In App Store Connect for `com.mikepitts.colombianspanish`, create **non-consumable** product `com.mikepitts.colombianspanish.library.v1`, display name **Full Colombian Library**, US base price **$19.99** and localized metadata/screenshot. Complete existing paid-app agreements, tax/banking requirements and intended storefront availability through the account holder. Do not submit until content and billing QA are accepted.
2. Create the matching RevenueCat iOS app and connect its store configuration. Import the product and attach it to entitlement **`full_library`**. The app fetches the exact store product directly, so an offering/paywall configuration is not required. Do not attach subscriptions/consumables or unrelated products to this entitlement.
3. Set `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` to that app's **public** `appl_…` SDK key in the relevant EAS environment. The editorial-beta profile disables local dotenv loading, so a local `.env` alone is insufficient for TestFlight. Keep secret provider/store credentials out of source and public environment variables.
4. If Android distribution is later pursued, create the matching Google Play one-time product, configure its RevenueCat Android app, and set `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` (`goog_…`). It must be a permanent, non-consumed library unlock. An iOS purchase is restored through the same Apple account; cross-store entitlement sharing is not implemented.
5. Rebuild native binaries with CocoaPods/Gradle autolinking. An OTA-only update cannot add this native module. Expo Go and web intentionally do not initialize billing or fake successful purchases; missing keys leave free learning and the unavailable-store message intact.
6. Reconcile the public privacy policy and App Store privacy answers with configured RevenueCat behavior/retention before sale. The repository policy/inventory describes the new conditional flow; the company website was not changed by this integration.

## Required purchase acceptance

Use an exact named native candidate and real sandbox/store accounts; automated tests and simulator screens are not evidence of real store transactions.

- Fresh install: starter collections, quizzes, custom cards, backup and daily plan work without purchasing or waiting for the store.
- Successful purchase: exact localized amount, non-consumable product, active `full_library` and all promised collections appear. Restart and airplane-mode cold launch preserve SDK-cached access. No account login solely to study.
- Cancel/decline: no grant/charge claim; learning continues. Pending approval/payment: no grant until CustomerInfo confirms; foreground refresh/restore resolves later approval without purchasing twice.
- Restore: reinstall or another device on the same store account, empty product response, account with no purchases and network failure. No manual paid flag or progress import grants purchase access.
- Refund/revocation: refreshed CustomerInfo removes additional bundled learning access while raw progress/custom cards/backups survive. Re-purchase/restore reopens existing progress. Device-local early-access grants remain a separate courtesy entitlement.
- Repeated taps, background/foreground, interrupted checkout and delayed read after checkout do not initiate parallel checkouts or overwrite a newer entitlement with an older response.
- Both languages, large text, screen reader, small phone and tablet: price, dismiss/continue, sample and restore remain reachable.
- Verify editorial acceptance, recording rights, generated-audio wording and signed-device behavior separately. Do not advertise unaccepted drafts as reviewed/native-speaker recordings.

## Technical references

- [RevenueCat Expo integration](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [CustomerInfo and cached entitlements](https://www.revenuecat.com/docs/customers/customer-info)
- [Restore purchases](https://www.revenuecat.com/docs/getting-started/restoring-purchases)
- [Apple purchase and restore requirements](https://developer.apple.com/in-app-purchase/)

SDK-persisted CustomerInfo is the purchase authority; the app keeps no separate paid-access boolean in progress storage. Billing failures retain last confirmed in-memory access. An authoritative new absence removes purchased access; no learning data is deleted. The local cohort migration is a courtesy compatibility policy, not an anti-tampering system for a bundled offline library.
