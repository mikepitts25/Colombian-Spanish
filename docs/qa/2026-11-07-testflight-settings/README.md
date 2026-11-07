# Settings reliability TestFlight delivery — November 7, 2026

The owner authorized committing, merging, pushing and building the settings/button
audit for TestFlight. Implementation commit
`696b28d289992a578a55a0b55dbfe4f67154af2c` was fast-forward merged into `main`
and pushed before archiving from a clean source tree.

## Delivered candidate

- App: **Colombian Spanish**, bundle `com.mikepitts.colombianspanish`.
- Version/build: **1.0.0 (1.0.12)**.
- App Store Connect app: `6825514456`.
- Apple build/delivery ID: `afb3b7c0-ccb4-42e7-9df0-61a20680d1fe`.
- Apple ingestion: **COMPLETE**, with no errors or warnings.
- Processing/internal state: **VALID / IN_BETA_TESTING**.
- Exact build membership: **Editorial Review**, existing internal group with
  **three testers**, freshly read back.
- English What to Test notes: saved and read back exactly.
- IPA SHA-256: `21cf956477e7c782065ff55edfcaaabb3797c9686282bc2090f529d542868cf4`.

This was a local Xcode Release archive and manual App Store export, using the
existing matching distribution identity/profile. EAS's remote iOS number was
reserved as `1.0.12`; this was not an EAS cloud build. Native archive, IPA and logs
are retained under `~/Builds/Colombian-Spanish/2026-11-07-settings/`.

## Changes and checks

The build contains durable language switching and recovery, refreshed reminder
language, a system-settings recovery action for denied notifications, explicit
Explore-to-topic navigation, audio-settings save completion while blurred,
accessible settings actions and static version metadata. The optional trip-date
copy now explains its reference-only purpose. See the
[settings and button audit](../2026-11-07-settings-buttons/REPORT.md).

Fresh verification passed **130 Jest suites / 1,351 tests / one snapshot**,
TypeScript, ESLint, whole-repository formatting, data/editorial-ledger checks,
calendar integration in four zones, and 14 Python QA tests. All four
[GitHub validation jobs](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/42389433034)
passed on the implementation commit.

The signed IPA passed deep/strict signature verification, App Store profile and
production APS checks, disabled-debugging and absent-microphone-permission
checks, expected settings/café strings, both café illustrations, and byte matches
for all **1,392** manifest-referenced pronunciation files. The existing
`editorial-beta` café-only flag remains enabled; broader review/recording tools
remain gated.

## Evidence

- [Source provenance](release-source.json)
- [Software verification](software-verification.json)
- [Signed IPA inspection](signed-ipa-inspection.json)
- [Upload receipt](delivery-receipt.json)
- [Apple ingestion](apple-build-upload.json)
- [Apple processing](apple-processing.json)
- [Exact internal availability](internal-availability.json)
- [Saved tester notes and readback](apple-notes.json)
- [GitHub CI](github-ci.json)

## Tester focus and remaining acceptance

Update to **1.0.0 (1.0.12)** in TestFlight. Check language persistence after
restarting, goal/new-card limits, theme choices, audio Preview/Repeat/Stop,
notification permission recovery, Explore's topic browser and saved-session
continuity. Use disposable custom cards for backup and deck-editing checks.

Physical-device permission dialogs, actual notification delivery, audible
playback/recording, touch/large-text/VoiceOver behavior, billing transactions and
human editorial acceptance remain separate checks. The catalogue retains its
existing editorial-review status. External state is
`READY_FOR_BETA_SUBMISSION`; no external submission, new tester invitation,
App Store review submission or public release was performed.
