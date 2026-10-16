# Generated listening draft — 2026-10-16

B06.1-B1 / B06.2 add a separate three-phrase listening draft using the durable mission player. The Home entry and route remain development-only. Bundled clips are explicitly generated pronunciation, with no claim of authentic conversation, regional representation or a human speaker. English meanings remain the choices in both interface languages to avoid exposing the Spanish transcript.

The shared schema validates source/deck/media/transcript references. Answers require an acknowledged bundled playback request, persisted before controls enable. The assessed path refuses missing/failed bundled audio instead of falling back to device speech. Playback-started evidence does not prove audibility or completed listening. Transcript assistance and model-answer assistance remain distinct through retry/resume. Events carry modality/media/content identity, never raw transcript/response, and do not grade SRS or advance flashcard goals. Optional mission backup state preserves these markers; old backups/text missions remain supported. Replay/loop/Stop and saved or explicit speeds are available. Blur, background, step changes and stale results cancel pending audio.

The exact [editorial packet](../../editorial/listening-basics-draft.json) remains unreviewed. Existing first-morning content/fingerprint and the generated card review inventory remain unchanged.

## Verification

- Final local suite: 69 suites / 716 tests. Types, lint, formatting, 47-deck/1,392-card/1,392-audio validation, editorial ledger validation and unchanged inventory export passed.
- Tests cover schema/reference rejection, playback prerequisite, transcript/model retry separation, observation normalization, backup roundtrip, explicit fallback refusal, player completion/resume/failure, background/unmount/Stop cancellation, stale revision recovery and speed/loop replay without duplicate writes. Existing text-player coverage passes.
- Fresh whole-package review found no actionable issues. The player tests caught the missing UI playback guard before integration; the engine already rejected that answer. Tests wait for React Native Pressable's effect to commit after a disabled-to-enabled transition before tapping.

## Native simulation

Dedicated iPhone 16 Pro / iOS 26 / Expo Go 54.0.7, device `121168CB-C271-4202-AC19-94F8DAE7B8B1`, local Metro 8098:

1. Home opened the listening draft. Spanish was absent from the initial AX tree; Good morning/Water were disabled.
2. Explicit Play exposed the generated backend label and enabled answers. Explicit transcript revealed `buenos días`; correct feedback was saved.
3. Terminated/reopened Expo Go, then reopened the draft: exact Correct feedback and revealed transcript remained. No autoplay was requested.
4. Continue reached coffee with Spanish hidden and both choices disabled again. Selected 0.75× and Repeat On; Play enabled answers, Stop removed the active backend indicator, and Coffee produced Correct feedback with the transcript shown afterward.
5. The final water item reset to saved speed/Repeat Off and required new playback. Water answered correctly, followed by assisted completion.
6. Read-only simulator storage confirmed one completed run, revision 10, and exactly three listening observations: greeting transcript-assisted, coffee/water unassisted. All carried generated/playback-started/media/content identity, with no raw answer or transcript. No extra learning event was created by replay, reveal, Stop or restart. Home's flashcard goal stayed 0/5.

This checks native controls, persistence and request acknowledgement, not audio intelligibility, headphones/Bluetooth/mute behavior, screen-reader usability, authentic new-speaker comprehension, Android runtime or a signed offline release candidate. Those gates remain open. Auto-speech preferences remain a separate AI task.
