# Free core and one-time library unlock

The owner selected the generous free core and US$19.99 one-time library unlock on October 31, 2026 and explicitly authorized integration. This records that approved direction and implementation choices; no additional design approval is requested.

## Intent and approaches

Keep learning useful indefinitely for free and earn revenue from additional Colombian collections. Considered: one-time full-library unlock (selected, fits local content), subscription (deferred until substantial ongoing service exists), individual packs (deferred to avoid fragmentation).

## Product contract

- Ten starter decks remain free: greetings, food, transport, travel, medical phrases, numbers, essential phrases, conversation, restaurant phrases and accommodation phrases. Actual available content follows the release editorial export.
- Scheduling, quizzes, pronunciation for accessible content, favorites, custom decks/cards, progress and backups remain free. No ads, mistake limits, mandatory accounts, launch paywall or auto-renewing trial.
- One non-consumable library product, intended US price $19.99. UI always uses the store's localized price. Includes the additional bundled collections and corrections to those collections, not unlimited future separately sold courses or hosted services.
- Existing installations retain their bundled catalogue via a one-time local migration before seed merge. This local courtesy grant is device-bound and excluded from portable backups; it is not a store purchase and cannot be restored from the store. Explain the reinstall limitation.
- Paid access uses RevenueCat CustomerInfo active entitlement; no purchase flag in progress backups. SDK persistence supports cached offline access; fresh authoritative absence revokes purchased access without deleting stored learning data.
- All learning entry points consume centrally filtered decks; custom cards added to locked bundled decks remain accessible. A library screen shows collections and a short labeled sample, a dismissible store-priced purchase, restore, retry and honest unavailable/pending/cancel/error states, in English and Spanish.
- Native SDK only on supported native builds with configured platform public key. Expo Go and web cannot simulate successful purchases. Missing configuration keeps free learning available and never offers a fake checkout.

## Architecture and constraints

Use React Native/Expo and react-native-purchases, with a billing service, React context, pure catalogue policy, journaled cohort migration and existing DeckContext as the access boundary. SDK handles transaction persistence; no separate locally forged paid cache. Serialize purchase/restore and prevent duplicate taps. Refresh on foreground and CustomerInfo events. Keep progress and existing content IDs intact.

## Release dependencies

Create a non-consumable store product, price/localization, RevenueCat entitlement/offering and public keys, then rebuild native binaries. No account access or product setup has been evidenced in this chat. Verify sandbox purchase, pending/cancel, restore on reinstall, refund/revocation and offline launch on devices. Editorial, rights and physical-device acceptance remain separate gates. Update privacy inventory for purchase IDs, anonymous RevenueCat identity and store/network metadata; no payment-card details are collected by the app.
