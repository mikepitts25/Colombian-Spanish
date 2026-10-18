# Barrio semantic appearance foundation

Status: **written spec awaiting owner review**. The owner selected Barrio and approved the recommended coordinated light/dark foundation followed by Home, including a saved System/Light/Dark setting, on 2026-10-18. That approves writing this spec; it does not approve this not-previously-written spec or an implementation plan.

## Intent and scope

Give Colombian Spanish a warm, coherent, readable identity in both appearances while preserving learning and recovery behavior. Success means the app follows system appearance or a saved override, every existing route uses the same semantic palette, controls retain readable states, and changing appearance preserves the learner's place and pending work.

This spec covers the coordinated foundation: palettes, resolver/provider, saved preference and recovery, all existing route consumers, native chrome and reusable control states. The approved [Home and controls boards](../../design/2026-10-18-barrio-foundation/README.md) guide identity. The later Home composition is a separate delivery bundle after this foundation; current Home layout and every existing entry point remain functional during the foundation. Do not mark mission-led Home B08.3 complete from a palette migration.

Keep the four tabs, routes, learning algorithms, content gates, existing system fonts, scalable typography, spacing and reduced-motion behavior. No remote asset, font, service, paid account or new package is required by the foundation. Use existing installed rendering capabilities for icons; an original native/vector primitive may be used without adding a dependency. Do not turn editorial draft previews into released content.

## Evidence informing the design

At base `de3926a99e4e6be5331247252f57448e51282a62`, the captured inventory contains 31 TSX theme consumers and 203 literal color occurrences. Several consumers import spacing only. The count is an audit starting point, not a migration success metric; App.tsx, native configuration, theme.ts and any newly discovered literal roles also require review.

Current module-level StyleSheets capture a static dark palette. Navigation headers/tab styles and several Home/control colors are literal. App.tsx fixes StatusBar to light. ErrorBoundary and StorageGate sit outside language/deck providers. Native app configuration fixes appearance to dark. Preferences use a recoverable coordinator and portable v3 backup validation has an explicit key allowlist.

The proposed palette has 54 passing opaque pair calculations. This is neither exhaustive runtime contrast nor accessibility acceptance. Keyboard/touch scrolling and live-font issues remain independently tracked; theme migration must preserve the measured-subtree retention fixes instead of replacing them with screen remounts.

## Palette and component contract

Use the exact candidate values in [palette.json](../../design/2026-10-18-barrio-foundation/palette.json) as the initial palette. Map its short review labels to explicit product semantic roles: background, surface, elevated/pressed surface, primary/secondary/tertiary text, primary action/pressed/on-primary, accent, border, focus, disabled surface/text, and danger/success/warning/info with opaque muted surfaces. Keep light and dark role shapes identical and typed. Components consume roles rather than raw palette indices or appearance conditionals.

Warm paper/white surfaces and deep green typography define light; deep green surfaces and pale primary actions define dark. Terracotta is restrained decoration. Meaningful states always have text or an icon/label in addition to color. Do not recolor Colombian flags, media or other meaningful artwork automatically. Audit chart/category colors against their actual background; preserve distinct meaning and add labels where needed. Remove opaque/alpha assumptions when mapping old brand-muted and tinted roles; compute contrast against the actual resulting surface.

Actions are at least 48 logical points and grow/wrap with text. Input and button text uses system scaling. Reuse the existing typography/spacing/radius scale unless measured native evidence requires a bounded adjustment. Primary actions have normal, pressed, disabled and supported visible keyboard-focus states. Expose disabled/selected/accessibility names independently of paint. Native screen-reader focus remains native; do not substitute a custom ring for it. Decorative icons do not scale as text glyphs or displace labels at large type. Reuse one monoline icon vocabulary for the four tabs and common actions, retaining labels and selected semantics. Existing two-row large-text tab behavior remains.

## Runtime architecture

Introduce a typed appearance resolver accepting `system | light | dark` and a nullable native color scheme; unknown/null OS appearance resolves to light. An explicit light/dark override ignores live OS changes; System follows them. A stable ThemeProvider owns applied mode and resolved palette, and exposes a hook plus stable per-palette style factories. Neither switching mode nor an OS appearance update may key/remount navigation, DeckProvider, language provider or entire learning screens.

Separate appearance state from storage IO. The outer provider can resolve System immediately without reading storage, so boot/recovery/error surfaces can paint before preferences hydrate. Keep ErrorBoundary inside that provider and pass the palette to its class fallback through a small functional adapter if needed. A catastrophic failure in the provider itself may use an independent system-resolved fallback; that fallback must not recursively depend on the failed provider.

StorageGate retains its durable-recovery role. An appearance-preference loader inside the recovered boundary reads preferences before mounting the normal navigation/data subtree. Its loading/error surfaces use the outer system palette and existing bilingual startup recovery language. A read rejection shows Retry without seeding, overwriting or claiming the saved mode was read. A successful load hydrates the same provider instance and mounts normal app content. This may transition from OS appearance to a saved override; no promise of a flash-free override before disk read is made.

All themed StyleSheets must refresh when the resolved palette changes. Keep expensive style creation memoized by palette identity. Move module-level color captures to factories or dynamic values while leaving constant metrics stable. Every route, modal, boot/storage/error view and custom tab/header must be checked; temporary compatibility exports within the branch must not leave static-color consumers in the shipped migration. Retain component/controller identities across palette changes, including all pending writes and retry intents.

## Saved preference and failure behavior

Add optional persisted `appearanceMode` with accepted values `system`, `light`, `dark`; normalized Prefs exposes a required mode defaulting to System. Missing/unknown local legacy values normalize to System without erasing the underlying record on read. Portable backup validation accepts an absent field for older v3 backups and valid modes when present, rejects other imported values before any write, and preserves the existing version/allowlist contract. A v3 export includes the preference through the existing coherent snapshot. Existing backup versions continue their established restore behavior. Compatibility means this version reads older backups; older installed versions may reject the added preference key. Do not promise importing new full-state backups into an older app; include that limit in backup/release compatibility notes.

Add a translated Appearance entry in Settings and a dedicated scrollable editor showing System/Light/Dark plus Save/Cancel (or normal Back). Choices edit a local draft; they do not paint a preview or write until Save. The applied appearance remains current while saving. Disable conflicting controls and prevent navigation while the save is unresolved, using the established pending-intent pattern. Capture one immutable requested mode per save. Successful durable persistence updates applied mode and the Settings summary; unrelated preference fields are preserved through `setPrefs` and the transaction coordinator.

On rejection, retain the exact requested draft/intent, keep the current applied mode and show translated failure/Retry. Do not claim the write could not have persisted: a durable journal may recover later. Retry acknowledges or idempotently writes that same mode through the coordinator, then rereads authoritative preferences before applying. Disable changing the retained request until it resolves; a recovered write must not be silently replaced by a later draft. No rollback write is used. Restart recovers storage before reading/applying the final authoritative preference. System appearance can still change under the currently applied System mode while a save is pending; that is not successful application of the draft.

Full-state import keeps the existing restart-required contract. Do not add an independent theme restore transaction or bypass its recovery gate. Other screens changing unrelated preferences must not reset appearance; rapid Save/retry and concurrent preference mutations must preserve all fields. The editor can discard an unsaved draft via Back/Cancel without changing the saved mode; process-death persistence of unsaved drafts is not promised.

## Native chrome and launch

Supply NavigationContainer's typed theme and palette-derived native-stack headers, tab surfaces, status bar text, modal chrome and input keyboardAppearance where supported. Apply matching root and safe-area backgrounds. Update the native appearance configuration from forced dark to automatic in app configuration; regenerate the untracked native project for the rebuilt development binary and verify its resulting Info.plist. Do not commit generated ios/ output or leave contradictory appearance values.

A rebuilt development binary is required to validate launch and native chrome. Native launch follows OS appearance until JavaScript recovers the saved override, then content/chrome follow that override. App-specific override need not change the OS or unrelated apps. Inspect light and dark cold launch for unreadable transitional surfaces; record unavoidable launch-to-override transitions honestly. Android code/configuration must remain type/build compatible, but emulator or signed Android success cannot be claimed without authorized tooling. Do not accept SDK agreements on the owner's behalf.

## Delivery boundaries

1. Typed semantic palettes/resolver and durable preference/backup contract with pure/storage regression coverage.
2. Stable provider/bootstrap/error integration, translated editor and native chrome, plus all existing route/control consumers in one coordinated integration branch. Internal commits may stage work; main must not ship a mixed-theme partial migration.
3. Rebuilt owned iOS simulator validation, state-preservation evidence and final review, then merge/push under the standing authorization. Keep host worktrees and unrelated simulator sessions intact.
4. Subsequent Home composition and any activity-specific layout redesign get their own focused implementation scope. Their visual direction is already approved; new behavior or unresolved Home state/copy decisions require the applicable design review, not a new direction vote.

The implementation plan must enumerate actual consumers/roles, identify changed interfaces and define precise commands before coding. It must not introduce an appearance-only screen remount to make tests easier.

## Acceptance evidence required

- Resolver tests cover both explicit overrides, both OS modes, null OS state, live System changes and unchanged explicit overrides.
- Storage tests cover missing/valid/unknown local values, old/new portable backups, rejection of invalid imports without writes, export/full-state restore, rejected save, journal recovery/retry and concurrent unrelated preference updates.
- Integration tests show no provider/screen remount and retained active queue/face, editorial or form draft, response text, pending grade/checkpoint/save identity and exactly-once credit across appearance changes. Test observable state, not only style snapshots.
- Bootstrap tests prove a preference read/recovery failure blocks normal initialization, preserves stored data, and recovers with Retry in either OS palette.
- Source audit identifies each consumer/literal role disposition and catches lingering static color imports. Compute contrast on all actually used text/control pairs, including tinted and pressed/disabled/error surfaces; target text 4.5:1 and meaningful boundaries/focus 3:1. Any exception needs an explicit reason and scope, never an unqualified conformance claim.
- Run appropriate focused tests, full Jest suite, typecheck, lint, formatting, calendar/data checks where affected and repository required CI. Record failures and unrun checks instead of using the earlier baseline as evidence for changed runtime code.
- Owned preflighted phone/tablet simulators show Spanish/English, light/dark/System, default/live maximum text, native headers/status bar/modal/keyboard, cold restart and saved override. Preserve original logical data and record exact intentional appearance-only preference changes; restore QA fixtures through supported UI.
- Test navigation and real actions on representative Home, Study/grades/resume, Progress/charts, Settings/forms, editor/backup alerts, Quiz, Difficult, Phrases, onboarding and development mission/voice/listening previews. Preserve existing content gates. Broader route checks can be grouped, but do not infer all-route acceptance from Home screenshots.
- Re-run the outstanding keyboard/touch cases only with a changed input route, capability or targeted diagnostic. Retain known gaps rather than accepting them from appearance screenshots.
- Fresh independent review and green required checks precede merge/push. Human cultural/editorial, physical tap/daylight/audio/assistive-user, Android-license, signed build and distribution acceptance remain explicit separate gates.

## Remaining decisions and gates

This spec chooses System default and Save-to-apply behavior to make the approved preference/recovery requirement precise. It awaits written-spec review; the implementation plan and execution choice follow after that review. No product code changes are part of this artifact. Security B01.8-C2g stays skipped without retry or bypass. Downloadable-audio spec approval, rights/recordings, language release acceptance, provider/account/product decisions and physical-device work are unaffected.
