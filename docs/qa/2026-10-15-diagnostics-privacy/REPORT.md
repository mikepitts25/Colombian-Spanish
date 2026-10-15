# Diagnostics and privacy accuracy

October 15, 2026. Base `4b33a55`. Scope B11.6-A.

## Delivered

A code-backed inventory covers local learning state, recovery journal, clipboard exports/import, device audio/TTS, optional Sentry, Expo updates and developer-only audio generation. The repository disclosure now describes those actual flows instead of claiming encrypted local storage and no network traffic. Contact, signed-build payload review and configured provider retention/access/IP handling remain owner release gates; this is a repository technical draft, not a published policy or legal acceptance.

The application reporting path does not initialize/capture without a DSN or in development. Configured production JavaScript diagnostics disable automatic traces, sessions, native capture, structured logs and client reports. A before-send allowlist keeps event/build metadata, generic error type and numeric stack positions. It drops arbitrary error messages/extras, user/request/context data, breadcrumbs, tags and frame paths/function/source text. Caller-supplied extras are no longer attached. Transport metadata and SDK envelope fields require actual release inspection; application tests cannot prove provider-side processing.

This deliberately reduces debugging detail and may limit source-map grouping. Native crashes are not observed by this configuration; enabling them requires a separate payload audit. No real DSN/project settings were read or changed.

## Verification

Baseline 44 suites / 448 tests passed. Three new regressions failed against the old implementation; five diagnostic tests now cover disabled/development paths, configured options, representative content redaction and dropped caller extras. Final full suite: **45 suites / 453 tests passed**, plus TypeScript, ESLint, Prettier, data validation and diff checks. Inventory remains 47 decks / 1,392 cards / 1,392 audio mappings.

Independent review identified that a zero trace sample rate still installs performance integrations in this SDK. The configuration now omits sampling entirely, explicitly disables performance/stall/interaction tracking, and sets trace propagation targets to an empty list. Its regression failed before the correction. An installed-SDK test verifies that no tracing integrations are selected and positively reproduces ReactNativeTracing with the prior numeric-zero configuration. Follow-up review independently passed all five tests with clean exit and found no remaining actionable findings. Implementation `3f55dbf` was merged and pushed to main. [GitHub Actions run 38680261404](https://github.com/mikepitts25/Colombian-Spanish/actions/runs/38680261404) passed all quality/content and iOS/Android project generation and production JS bundle jobs. No simulator/device network-payload acceptance is claimed.
