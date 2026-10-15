# Colombian Spanish — data and privacy

Updated October 15, 2026. This describes the repository's current behavior. The release owner must supply a public contact and confirm service/project settings against the actual signed build before publishing this document.

## Learning data on your device

The app stores decks, custom cards and edits, favorites/flags, spaced-repetition schedules, daily counts, study streaks, recent-session information, seen-word history, quiz results, modality-specific learning observations and preferences locally. Notifications use saved local reminder preferences. No learner account or application cloud-sync feature is implemented.

Local data uses AsyncStorage. It is not an app-managed encrypted vault. Operating-system protections and backup settings apply; do not put secrets into custom learning cards or assume uninstalling removes every OS backup or exported copy.

## Network and third-party services

Core flashcard and quiz data can be used locally. This does not mean every app/build action is offline:

- **Updates:** the app is configured with an Expo update endpoint. A compatible installed build may contact Expo for update checks and downloads. Network providers receive ordinary connection metadata. The actual release's update configuration must be checked before publication.
- **Optional diagnostics:** a production build configured with `EXPO_PUBLIC_SENTRY_DSN` enables JavaScript error reporting to the configured Sentry project. Development builds and builds without a DSN do not initialize this application reporting path. Error payloads retain event/build metadata, generic error type and numeric stack positions. Application messages, custom extras, user/request/context data, breadcrumbs and frame source text are removed by the application's filter. Automatic traces, sessions, native collection and structured logs are disabled in this configuration. Providers may still process network metadata such as IP addresses; project retention/access settings and signed-build payloads require owner verification.
- **Audio:** bundled generated pronunciation files play locally. Missing or failed playback can use the device's text-to-speech service. Voice availability and any service/network behavior depend on the operating system and voice settings; offline speech is not promised for every device or custom phrase.

The developer's separate audio-generation script can send authored text to ElevenLabs when deliberately run with developer credentials. The learning app does not call that script to synthesize learner content during ordinary use.

## Backups and exports

Export Backup copies deck/card data and supported learning-event history to the system clipboard. Flagged-card export also copies learning text. Clipboard contents may be available to other apps or OS clipboard-sync features according to platform settings. Imports read clipboard text only when the import action is selected and require confirmation before replacement.

Version-3 file backups include supported local learning state: preferences, daily progress, streak, seen words, quiz rounds, notification preferences and the saved session pointer, alongside decks and learning events. App-state restore is a separate explicit action; card-only merge/replacement keeps local preferences and counters. Restart after restoring app state to reload contexts and reconcile reminders. Device permissions, scheduled OS notifications and cache/audio files are not imported.

File export creates dated JSON in the app cache and opens the system share sheet. You choose its destination, which may include local Files or a provider that uploads to cloud storage. File import reads the document you select, validates it and shows an in-app preview before you choose additive merge or deck replacement. The temporary imported cache copy is removed on a best-effort basis after reading; the selected source is retained. Export cache files remain available for recipients after hand-off. On later exports, the app attempts to remove its own export files at least 24 hours old; OS cache cleanup can also apply. This is not a guaranteed 24-hour deletion deadline.

These backups are not encrypted. Legacy/clipboard version-2 backups omit preferences, streak and seen-word records. Version-3 files cover the supported app state listed above, not a complete device or operating-system backup. A saved restore intent may complete on retry/restart after an interrupted write. Copies saved or shared outside the app remain under your control.

## Retention and control

Learning data remains in local application storage until removed or replaced by the user or operating system. Individual decks can be reset/deleted through the app; those actions do not promise to remove all independent history. Learning-event history is bounded to the latest 5,000 retained observations and quiz-result history to ten rounds. No application-hosted learner account or remote deletion service is implemented.

Removing the app typically removes its local application storage, subject to platform backup/restore behavior. Separately delete exported copies or clipboard content if desired. Service-side diagnostic retention depends on the configured project and is not verified by this repository audit.

## Release contact and review

A verified support/privacy contact must be supplied by the release owner before publication. Until then this repository document is a technical disclosure draft, not evidence that store forms, consent requirements, provider retention or a signed build have been reviewed. Changes to recording, hosted AI, accounts, sync or analytics require a new data-flow review and updated disclosure.
