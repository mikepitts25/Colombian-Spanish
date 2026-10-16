# Local voice practice implementation plan

> **For agentic workers:** Use superpowers:executing-plans inline, with one fresh whole-package review at the end.

**Goal:** Development-only local record/replay/delete with reliable cancellation and an unscored text alternative.

**Architecture:** Pure injected controller, native Expo adapter, bilingual screen. No hosted integration, events or persistent recording library.

**Tech stack:** Existing Expo54/audio1.1.1/file-system19/RN0.81/TS5.9/Jest.

**Spec:** `docs/superpowers/specs/2026-10-16-local-voice-practice.md`.

## Global constraints

- Development-only route and Home entry, no automatic microphone request or upload.
- 30 seconds and 2 MiB per take; no silent overwrite or arbitrary file deletion.
- No SRS/daily/event credit; recordings excluded from backups and logs.
- Stop/blur/background/close invalidate pending permission/prepare/playback work.
- Existing source text only; no assessed speaking or pronunciation claim.

## Review focus

- Permission/prepare completes after Stop or leaving: capture must never begin.
- Stop/delete failures: keep recoverable identity, no false success or second take.
- Clip path/size invalid or low-storage failure: text alternative and exit remain available.
- Recorder/player overlap and timeout/background: serialized lifecycle, no autonomous replay.
- App process ends before cleanup: privacy copy reflects cache limits, not a deletion guarantee.

## Tasks

- [x] Write controller tests for permission denied, bounded record/stop/replay/delete, late permission/prepare cancellation, background/close, file failures and no-overwrite; observe RED. Implement `src/speaking/voicePractice.ts` with `VoicePractice` and injected `VoicePorts`/state subscription.
- [x] Write adapter tests with native/filesystem fixtures; observe RED. Implement `src/services/voicePractice.ts` with owned cache URI validation, size cap, native30-second capture, shared audio-mode restoration and explicit player cleanup using installed SDK54 APIs. No new packages.
- [x] Write screen tests for explicit permission request, controls, statuses/errors, fallback, lifecycle and dev gate; observe RED. Add `src/screens/VoicePracticeScreen.tsx`, translations, dev-gated route/Home entry and microphone usage configuration needed by a development client.
- [x] Full checks, one fresh review and RED→GREEN fixes, available iPhone/tablet route/layout/denial checks. No microphone permission grant or captured voice is assumed.
- [ ] Update technical privacy/checklist and QA evidence accurately, merge/push and verify CI. Keep actual microphones, accepted feedback and provider decisions open.

Ruling: build local self-check first — it is useful without an unselected provider and does not invent assessment validity. Archived Expo54 docs redirect to latest58 in this environment; installed1.1.1 public exports/types and source are authoritative for this implementation.
