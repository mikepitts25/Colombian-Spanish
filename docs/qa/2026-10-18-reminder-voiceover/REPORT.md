# Reminder switches: inspector output versus real VoiceOver focus

Base `0a226b5`. B08.6-A investigation on the existing dedicated iPad mini A17 Pro / iPadOS 26.0 simulator E66076BE-D9F8-49FB-870F-F29B57C4CA40, unsigned SDK57 development binary 1.0.0/build 1.0.0, Metro 8098. No product code changed. UI actions used CUA; own-app storage inspection was read-only.

## Finding

Fresh default entry exposed all three named switches and their values in Device Hub accessibility output: Notificaciones 1, Recordatorio Mañana 1, Recordatorio Noche 0, with IDs notification-master-toggle, notification-morning-toggle and notification-night-toggle. Live Text Size 3→11 then omitted those switch nodes while retaining the text nodes and visibly rendering the controls (`live-max-omitted-switches.png`). This reproduced the exact earlier observation.

Enabled native VoiceOver, dismissed its first-use gestures notice, enabled Capture Keyboard and sent Control-Option-Right through Device Hub. Actual VoiceOver focus rectangles reached each of the three switches despite their continued omission from the returned inspector tree:

- `es-master-switch-focused.png`: master switch focused.
- `es-morning-switch-focused.png`: morning switch focused.
- `es-night-switch-focused.png`: evening switch focused after automatic scrolling, with its entire title/time visible.

Backward focus navigation returned to Back. Control-Option-Space did not visibly activate it through this input route; this alone does not identify an app failure. A coordinate double click on the focused Back while VoiceOver remained on did navigate to Settings (`es-back-activated.png`). No reminder switch was activated or preference changed. Reopened the reminder screen at maximum size: the inspector again returned all three named switch nodes and values (`es-fresh-max-entry.png` records the visible fresh entry).

These observations disprove the narrower inference that omission from Device Hub's returned tree means VoiceOver cannot focus the switch. They support an inspection-path discrepancy; they do not identify its internal cause. No app code correction is justified by this focus investigation. Full switch activation, spoken announcements/traits, rotor, order/comfort, touch gestures and assistive-user acceptance remain open under B08.6 and B12.5. This is a Spanish mini simulator focus/navigation check, not every language/platform/device or a complete accessibility pass.

## Restoration and cold launch

Restored VoiceOver off, Capture Keyboard off and native Text Size 3; Spanish UI remained unchanged. Native appearance Light and app dark palette were unchanged. The first-use VoiceOver notice was acknowledged; no claim is made that every internal OS preference is byte-identical.

Terminated/relaunched normally. Device Hub then omitted the whole app subtree, although the app rendered and coordinate navigation to Settings and reminders worked (`es-cold-default.png`). The known unsigned expo-notifications entitlement warning was dismissed. This corroborates the limited reliability of this inspection path; it is not a notification-delivery result. Left the simulator in Spanish Settings, default text, VoiceOver/keyboard capture off. No OS notification permission was requested and no reminder preference was saved.

`native-state-check.json` records five checkpoints: baseline, all-three-focused, fresh maximum entry, restored, cold-restored. Run `python3 docs/qa/2026-10-18-reminder-voiceover/verify-state.py`. All eleven logical hashes match at every checkpoint. Notification preferences remain absent; all stored app preferences, exact nine-card Weather queue and updatedAt, four events, three quiz summaries, daily count 1/new count 1/target 5, 1,392 cards, streak and journal remain unchanged. The verifier proves storage invariants, not UI focus; focus evidence comes from observed native rectangles/screenshots.

## Verification and remaining gates

This evidence-only package needs offline state verification, formatting/diff checks and independent review. Product source/tests are identical to `0a226b5`, whose [CI39085506893](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39085506893) passed all four jobs (100 suites/971 tests in local merged validation), with [board39085506865](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/39085506865) successful. New push CI is verified separately.

B08.6-A closes the specific comparison/investigation; B08.6 parent remains open. Other forms/layouts, full touch-only/assistive actions, Android runtime/license authorization, physical/signed notifications/audio/interruption, editorial/recording rights, product/accounts and downloadable-audio written-design review remain distinct work. Security B01.8-C2g remains access-blocked and was not retried.
