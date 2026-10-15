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

## Clipboard backups and exports

Export Backup copies deck/card data and supported learning-event history to the system clipboard. Flagged-card export also copies learning text. Clipboard contents may be available to other apps or OS clipboard-sync features according to platform settings. Imports read clipboard text only when the import action is selected and require confirmation before replacement.

These backups are not encrypted. They currently omit some state, including preferences, streak and seen-word records, and should not be described as complete device backups. A saved restore intent may complete on retry/restart after an interrupted write. Copies saved or shared outside the app remain under your control.

## Retention and control

Learning data remains in local application storage until removed or replaced by the user or operating system. Individual decks can be reset/deleted through the app; those actions do not promise to remove all independent history. Learning-event history is bounded to the latest 5,000 retained observations and quiz-result history to ten rounds. No application-hosted learner account or remote deletion service is implemented.

Removing the app typically removes its local application storage, subject to platform backup/restore behavior. Separately delete exported copies or clipboard content if desired. Service-side diagnostic retention depends on the configured project and is not verified by this repository audit.

## Release contact and review

A verified support/privacy contact must be supplied by the release owner before publication. Until then this repository document is a technical disclosure draft, not evidence that store forms, consent requirements, provider retention or a signed build have been reviewed. Changes to recording, hosted AI, accounts, sync or analytics require a new data-flow review and updated disclosure.
