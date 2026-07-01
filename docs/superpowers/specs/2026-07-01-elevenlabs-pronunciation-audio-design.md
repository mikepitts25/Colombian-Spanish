# ElevenLabs Pronunciation Audio Design

## Context

The app currently pronounces Spanish card text through Expo Speech. This keeps the app simple, but speech quality depends on the device's installed voices and can sound robotic. The goal is to replace normal pronunciation playback with higher-quality ElevenLabs audio while keeping a reliable fallback.

The selected ElevenLabs voice ID is `tTQzD8U9VSnJgfwC6HbY`. The ElevenLabs API key must never be committed or bundled into the app. Generation will read secrets from local environment variables only.

## Decision

Use pre-generated MP3 files for flashcard pronunciation. Generate one file per card front, keyed by `card.id`, and bundle those assets with the app. Use Expo Speech only when a generated audio file is missing or playback fails.

This is preferred over on-demand generation because pronunciation text is stable, the current card-front corpus is small, playback should be immediate, and the mobile app must not contain an ElevenLabs API key.

## Architecture

Add a build-time script:

- `scripts/generate-elevenlabs-audio.js`
- Reads `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` from the shell environment.
- Defaults to `tTQzD8U9VSnJgfwC6HbY` when `ELEVENLABS_VOICE_ID` is not set.
- Walks all deck card data and collects `{ id, front }`.
- Skips audio files that already exist unless called with a force flag.
- Calls ElevenLabs text-to-speech using `model_id: "eleven_multilingual_v2"` and MP3 output.
- Saves files to `assets/audio/pronunciation/<card-id>.mp3`.
- Writes a generated manifest such as `src/data/audioManifest.ts` mapping card IDs to static `require(...)` calls.

Add an app audio service:

- Exposes `speakCard(card)` and `stopAudio()`.
- Looks up `card.id` in the generated audio manifest.
- Plays the MP3 when present.
- Falls back to existing Expo Speech behavior for missing assets, playback errors, or new user-created cards.
- Centralizes pronunciation calls so screens and components no longer call `expo-speech` directly.

Add the Expo audio playback package:

- Use `expo-audio` for MP3 playback.
- Keep `expo-speech` installed for fallback.

## Data Flow

1. A developer runs the generation script locally with the ElevenLabs environment variables set.
2. The script generates missing MP3s under `assets/audio/pronunciation/`.
3. The script regenerates `src/data/audioManifest.ts`.
4. At runtime, a pronunciation button calls the centralized audio service.
5. The service plays bundled MP3 audio for known cards and uses Expo Speech only when no MP3 is available.

## Error Handling

The generation script should fail fast when `ELEVENLABS_API_KEY` is missing and print setup instructions. If `ELEVENLABS_VOICE_ID` is missing, it should use the selected default voice ID and print which voice ID is being used.

API failures should be reported per card without losing already-generated files. The script should support reruns so failed cards can be retried after quota, network, or voice-access issues are fixed.

Runtime playback errors should not block study. The audio service should catch playback failures and call the fallback speech path.

## Testing

Unit tests should cover:

- Audio service chooses bundled MP3 when the card ID exists in the manifest.
- Audio service falls back to Expo Speech when the card ID is missing.
- Audio service falls back when MP3 playback throws.
- Generation script skips existing files by default.
- Generation script refuses to run without an API key.

Manual verification should include:

- Generate a small sample set first.
- Listen to several words and phrases with the selected voice.
- Confirm replay works on Study, Browse, Phrasebook, and Review surfaces.
- Run lint, typecheck, and Jest after implementation.

## Scope

This change does not add speech recognition, user recording, regional voice selection, native speaker recordings, or CDN-hosted audio. Those can build on the same manifest and audio service later.
