# Barrio foundation: review proposal

Status: **direction A and the recommended concrete foundation approved by the owner on 2026-10-18; written spec approved with the requirement to preserve Classic in a theme picker; implementation plan approved for Native execution.** This folder contains the original review artifacts; authoritative requirements are now in the linked approved spec. The app is unchanged by these documents. Base: `de3926a99e4e6be5331247252f57448e51282a62`.

The intended result is a warmer, clearer Colombian Spanish practice app: one obvious daily action, readable controls and consistent appearances, while preserving existing learning, recovery and navigation behavior. The owner selected Barrio on 2026-10-18. The owner subsequently approved the recommended coordinated foundation and saved System/Light/Dark setting. Detailed requirements are in the [written spec](../../superpowers/specs/2026-10-18-barrio-foundation-design.md), approved with the owner’s additional Classic-preservation requirement.

## Review boards

- [Home, light Spanish and dark English](home-light-dark.png), with [editable SVG](home-light-dark.svg).
- [Controls and semantic states](controls-light-dark.png), with [editable SVG](controls-light-dark.svg).
- [Proposed palette](palette.json), [contrast calculations](contrast-report.json) and [source inventory](consumer-inventory.json).

The boards show the same illustrative six due reviews, four available new cards, goal 2/5 and approximate three-minute estimate. These are not live counts or a new timing algorithm. The four existing tabs and routes remain. Daily-plan wording must follow the actual review/applied/active/completed state; this example represents an available plan, not every Home state. The word card and original café illustration are visual examples; cultural/editorial and release acceptance remain separate.

## Approaches

1. **Recommended: coordinated light/dark foundation, then Home.** Migrate semantic theme consumers together, including native chrome and errors; introduce the Home composition in a subsequent bundle. This avoids mixed palettes and lets state-retention tests protect the migration. It is the largest initial bundle.
2. **Preview first.** Keep Barrio as review artifacts while designing further activity screens. This reduces immediate runtime risk but delivers no appearance capability to learners.
3. **Recolor the current static dark theme.** Smaller implementation scope, but it cannot deliver the light appearance shown here or a system appearance setting. It would leave the broader theme task open.

## Proposed foundation

Use warm paper and white surfaces in light mode, deep green surfaces in dark mode, one green primary action and restrained terracotta decoration. Meaningful states use labels/icons plus semantic danger, warning, information and success colors. Keep platform system type; do not add a font download or a remote asset dependency. Maintain the current spacing/type scale unless a measured layout requires adjustment, with 48-point minimum actions that grow with text. Rounded cards and consistent monoline icons replace competing decorative accents; icon-only actions retain accessible names. Native focus behavior and platform focus indicators remain authoritative; the board's ring illustrates intended visible focus, not a custom screen-reader focus system.

A runtime theme provider preserves Classic as default and resolves optional Barrio with System/Light/Dark, supplies semantic palettes and themed style factories, and covers boot/storage/error surfaces as well as navigation. Module-level styles currently capture static imports: rebuild themed styles per resolved appearance without remounting screens or learning/data providers. Screen drafts, queues, active card faces, pending writes and retry identity must survive changes. Inventory records 31 TSX theme importers and 203 literal color occurrences at the base; a literal occurrence is an audit lead, not proof it should be recolored. Flags, category art, chart series and overlays need individual role review. App.tsx, native configuration and theme.ts also require work outside that consumer count.

Preserve the current dark theme as Classic, defaulting all installations to it. Offer Barrio as a separate picker choice with a remembered System/Light/Dark preference (default System for Barrio), following live OS changes only in Barrio/System. A saved override participates in validated portable backups; legacy/unknown values resolve safely to System. Changing appearance must not report a successful save before persistence succeeds. Keep the current applied selection if saving fails, retain the attempted choice for explicit retry, and show a recoverable translated error. Coordinate restoration with the existing portable-state transaction rules. These choices expand preferences and backup validation; the approved spec includes the owner’s preservation requirement.

Navigation headers, modals, status bar, keyboard appearance where supported, launch/boot and error backgrounds must agree. The current native configuration forces dark mode; automatic appearance requires a rebuilt development binary and later signed release verification. A JavaScript-only preview does not prove native launch behavior. Android work remains conditional on the separate SDK-license gate.

## Proposed delivery bundles and acceptance

- **Foundation:** palette/resolver, provider, preference/error/backup semantics, all static consumers and native chrome. Check resolver/OS transitions, rejected saves/retry, legacy/import behavior and native launch colors. Do not ship a half-migrated route palette.
- **Home:** the approved composition, original icons/art and translated plan-state copy wired to existing real counts/actions. Preserve empty, loading, error, applied, active and completed states; estimates need an explicit existing or separately approved computation.
- **Activity consistency:** apply reusable control states to study, forms, quizzes and progress without changing scheduler or content-release policy. Review chart/category semantics separately.
- **Runtime verification:** Classic plus both Barrio appearances and languages on owned phone/tablet simulators, live maximum text, keyboard and reduced viewports, pressed/disabled/focus/error states, navigation and cold restart. Assert retained drafts and pending learning writes. Broader platform, physical-device, screen-reader-user and cultural/editorial acceptance remain human/device gates.

Each bundle gets checklist evidence and review; the parent B08.2 remains open. No provider purchase, new account, native recording or editorial-content unlock belongs to this proposal. B01.8-C2g security access remains deferred without retry or bypass; audio-spec approval, Android-license consent and other real gates are unaffected.

## Evidence and reproduction limits

`render.cjs` builds original SVG shapes and text, then rasterizes using an externally available `@resvg/resvg-js` module. No app dependency was installed. Pencil authentication was expired; no login, account change or `.pen` artifact is claimed. Arial is a local rendering reference, not a redistributed font or a promise of identical native glyph metrics.

```sh
node docs/design/2026-10-18-barrio-foundation/render.cjs /tmp/colombian-visual-tools/node_modules/@resvg/resvg-js
```

Pass a different installed module path on another machine. Re-rendering twice on this host produces identical SVG/PNG/report hashes. PNG identity across font installations is not guaranteed. The source inventory is a captured read-only audit of the named base, not generated by the board renderer.

The renderer calculates sRGB relative luminance and contrast for 54 explicit opaque token pairs (27 per appearance). Text targets are 4.5:1; selected boundary/focus pairs target 3:1. All 54 pass. These project targets include disabled text voluntarily and are not a claim of blanket WCAG conformance. Alpha overlays, gradients, every chart pairing and actual platform rendering are outside this report. The fixed-size boards are not native large-text, keyboard, touch, screen-reader or runtime accessibility evidence. Both PNGs were visually inspected for clipping and readable labels.

## Review requested

The owner approved the recommended coordinated foundation, both appearances and the saved System/Light/Dark setting. The owner approved the architectural spec while requiring a picker that preserves the current theme as Classic and makes Barrio optional. That requirement is incorporated in the spec; implementation plan is approved for Native execution; runtime completion requires the planned evidence.
