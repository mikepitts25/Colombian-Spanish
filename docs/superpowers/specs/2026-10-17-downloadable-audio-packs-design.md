# Optional offline audio packs

Status: proposed design for owner review, not implementation approval or shipped capability. Isolation instructions refreshed on 2026-10-18 against `4d31de5`; this does not change the proposed product scope. Master task B06.4. Baseline `a87d7e0` (Expo SDK 57 / React Native 0.86). The owner has requested completion of actionable AI work, simulator validation and main integration. This document makes the new subsystem reviewable before implementation; no hosting, spend, publication or language acceptance is authorized by it.

## Intended outcome

Learners can explicitly download a published audio pack, see its actual size and transfer progress, cancel it, retry a failed transfer, remove it and play verified downloaded clips without connectivity. Interrupted or corrupt downloads never appear ready or become listening evidence. Learning history remains independent of downloaded media.

The current 1,392 generated pronunciation clips are already bundled (`src/data/audioManifest.ts`). Their playback remains available without downloading packs. Optional packs add content; they do not move those assets behind a network dependency. Generated audio remains labeled generated, and human recordings require accepted provenance/rights before publication.

## Approaches considered

1. **Recommended: foreground, all-or-nothing pack installation with verified files.** One active transfer at a time, deterministic status, explicit cancellation and clean retry after interruption. This fits small pilot packs and avoids claiming resilient background transfer before that is verified.
2. Per-clip streaming with opportunistic caching. Faster first play, but an apparently available pack could fail offline halfway through. Rejected for the initial offline promise.
3. Background/pause/resume transfer with OS task restoration. Useful for large destination packs, but adds native lifecycle and restoration complexity beyond the first pack. Deferred; cancellation and restart-from-zero retry remain required now.

## Catalog and acceptance boundary

Use an application-shipped, versioned catalog. Each entry pins pack ID, integer content version, bilingual title/description, provenance (generated or human), speaker/region metadata where applicable, and a nonempty ordered clip list. Each clip pins ID, bilingual display title, HTTPS URL, exact byte size, lowercase SHA-256 digest and content reference. Pack size is the checked sum of clip sizes, not a server estimate.

IDs use a bounded lowercase ASCII identifier grammar; URLs never determine filenames. Initial bounds: at most 100 clips, 10 MiB per clip and 100 MiB per pack. These are engineering resource limits, not learning or product efficacy claims. The acceptance/release tooling must reject duplicate pack/version or clip identifiers, inconsistent sizes, missing digests/provenance and unaccepted human material. No remote catalog refresh, arbitrary URL entry or learner-supplied manifest in this version.

Production catalog starts empty until an owner-approved publication source and accepted content exist. Settings still explains that bundled pronunciation is included offline. A dedicated development-only QA catalog uses a controlled local server and synthetic/generated fixture with an explicit QA label; it must be absent from release exports. Empty catalog does not claim that a downloadable pack has been published.

## Files and installation

Keep media under an application-owned `audio-packs/v1` directory in document storage, separate from AsyncStorage learning keys and backups. The screen explains that downloaded media is not included in learning-state backups and must be downloaded again after reinstall; restoring learning state must not advertise absent media as ready. A manifest-derived directory identifies each pack/version. Each operation has its own staging directory and writes only within this namespace.

1. Validate the catalog entry and check estimated free space (total download plus 1 MiB bookkeeping margin). Disk-space reporting is a preflight estimate, so write failures still need recovery.
2. Download clips sequentially to explicit staging filenames, reporting completed bytes plus current-clip bytes. Unknown server length does not change the catalog total. Cancel if reported or actual bytes exceed the pinned size.
3. Check actual file size and SHA-256 before proceeding. A matching extension or HTTP success alone never makes a file playable.
4. Write a complete receipt only after every clip passes. Move the completed staging directory into the installed location on the same filesystem. A complete receipt and verified files are required for ready status.
5. On error/cancellation, release the native transfer and remove owned staging files. If cleanup fails, report storage trouble and retry cleanup during the next initialization; never mark the pack ready.

Initialization removes stale owned staging directories and validates installed receipts against the shipped catalog, then rechecks sizes/digests before advertising readiness. An incomplete, missing or altered file produces a recoverable unavailable/corrupt state. Retry downloads a fresh complete copy. A newly published version does not overwrite a valid installed version during transfer: catalog entries remain keyed by pack/version and content references stay pinned. Older versions remain playable while still present in the accepted catalog; retired content must be explicitly unavailable, with removal offered rather than silent learning-history changes.

## Manager state and concurrency

Expose observable per-pack state: checking, not downloaded, downloading, ready, or error, with downloaded/total bytes and typed network/storage/integrity failure. Cancellation returns to not downloaded after cleanup. Keep native error strings, filesystem paths and remote URLs out of learner-facing messages.

One operation token owns progress, cancellation and final publication. Late callbacks from an earlier operation cannot update a retry or publish a cancelled pack. Only one pack transfer runs at a time; other pack Download controls show disabled state and explain the active transfer. Cancel remains available while connecting, transferring and checking files. Duplicate taps share or reject the current intent without launching another transfer.

Use foreground native transfers and cancel on app backgrounding in the first version; communicate this in the download screen. Leaving the screen cancels and cleans up the active transfer. Cancellation waits for the native task to settle before deleting its staging directory. Process death is handled by startup verification/cleanup and explicit retry, not by a promised background resume. Removing a pack cancels its active work, stops its playback and removes only its own installed version. No learning attempts, daily counters, cards, mission runs or preferences are deleted.

## Playback and app integration

Add an Audio packs entry in Settings and an accessible pack list/detail flow. Show included offline pronunciation separately from optional packs; display provenance, version, formatted total size, readable status, progress, Download/Cancel/Retry/Remove and per-clip Play/Stop after ready. Stack controls and wrap titles at large text sizes. Status changes use accessible announcements without announcing every byte update.

Playback resolves an installed clip by exact pack/version/clip identity and revalidates its file before use. Use the existing expo-audio engine and shared interruption ownership with card/listening playback, so new playback and Stop cancel stale requests. Never fall back to device TTS for a downloaded-clip request or claim downloaded offline availability from TTS. Preserve speed, pitch correction, explicit stopping, and silence on open/resume. Replaying a sample in the pack manager does not submit learning evidence.

Existing bundled listening exercises keep their strict bundled prerequisite until an accepted exercise explicitly references a downloaded media identity. Connecting accepted packs to assessed missions is part of B06.3/B07 media integration; it must pin content identity in observations and preserve transcript/model assistance distinctions. The pack client cannot certify language, human voice authenticity or intelligibility.

## Native API choice

The installed expo-file-system 57 declarations expose DownloadTask with progress, cancellation and foreground session options. Use that supported task API with explicit file destinations and release its resources after settling. Do not reuse assumptions from older legacy-only code.

The installed File API does not expose the SHA-256 file-digest method shown in the current latest documentation. Therefore implementation must add the SDK-compatible expo-crypto module and hash bounded binary clip data, with an adapter tested against independent known SHA-256 vectors. Use Expo's version resolver and validate the resulting pinned dependency/native module. An updated unsigned development client may be needed; a missing native digest capability must fail clearly rather than downgrade verification. No dependency security backport work belongs in this feature.

Local API evidence: `node_modules/expo-file-system/build/NetworkTasks.d.ts`, `NetworkTasks.types.d.ts`, `File.d.ts` and internal native declarations. Reference [Expo FileSystem documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/) for task lifecycle, while treating the installed SDK's declarations/native client as authoritative for available methods. Latest docs are not proof of SDK 57 digest support.

## Validation contract

Automated tests must prove catalog rejection before filesystem/network work; correct progress with unknown server totals; size/digest rejection; network and low-space/write failures; cancellation before connection, during transfer and during verification; stale callbacks after retry; duplicate starts; remove-during-transfer; receipt/move failures; cold initialization after partial install; corrupt/missing installed files; retained accepted older version; and successful installation plus offline URI playback without TTS or learning-state mutation. Exercise the real manager/native adapter boundary with controlled files where available, rather than relying only on mocked status labels.

UI tests cover bilingual status/actions, empty catalog, pending/failed/retry/cancel states, named controls and large text, with exactly-once actions. Production export inspection must prove that the local QA catalog/host and fixture controls are absent.

Native simulator acceptance uses a fresh `simctl create` device with the feature’s rebuilt authorized development-client binary installed (including the digest module), an explicit UUID, passing [own-container preflight](../../qa/SIMULATOR_PREFLIGHT.md) before and after first launch, and a controlled local fixture server. Do not clone or operate a quarantined alias. Keep actual source and destination paths distinct; collect direct source/destination learning-state hashes before fixture work and after their own cold launches. Import disposable learning fixtures only through the supported app UI, never by writing app-storage files. Verify these flows: visible size/progress, actual Cancel, retry, checksum mismatch, termination during transfer/commit, cold verification, server stopped after successful install, offline replay/Stop, remove and re-download. Read-only app-data inspection verifies actual files/receipts and unchanged learning keys. Native playback start is not evidence of physical audibility, pronunciation quality or supported audio routes.

## Work split and completion

AI can implement the catalog/schema, manager, native adapter, UI, playback handoff, release exclusions, controlled fixture server, automated cases and available iOS simulator checks. Human/account dependencies are the publication location/permission and real content/rights/editorial acceptance. No new account is needed for a local fixture server. Android tooling still requires the pending SDK license decision; physical audio, storage-pressure realism and signed release acceptance remain under B12.

After design review, the implementation plan should bundle: (1) catalog/install/recovery engine and tests, (2) native transfer/digest/playback adapter, (3) Settings UI and release boundary, (4) native fixture checks and evidence, then review/merge/push. B06.4 implementation is not complete merely because this spec or a fixture manager exists. Production publication and human recordings remain separate acceptance gates.
