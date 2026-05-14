# UI Language Toggle Design

## Goal

Add a Settings control that lets users switch app UI chrome between Spanish and English. The setting affects navigation labels, Settings labels, app alerts, and other interface text. It does not translate study content, deck names, flashcard fronts/backs, examples, or pronunciation behavior.

## User Experience

The Settings screen adds a language row in the account/preferences area:

- Spanish UI: `Idioma de interfaz` with the current value `Español`.
- English UI: `UI language` with the current value `English`.

Pressing the row toggles the preference between `es` and `en`. The change updates visible UI labels immediately and persists across app restarts.

Spanish remains the default for existing and new installs so current behavior is preserved until the user changes it.

## Architecture

Extend `src/storage/prefs.ts` with a typed `uiLanguage: 'es' | 'en'` preference. Invalid or missing stored values fall back to `es`.

Add a small localization module and provider:

- A translation dictionary keyed by stable string ids.
- A `LanguageProvider` that loads and stores `uiLanguage` via prefs.
- A `useLanguage()` hook exposing `language`, `setLanguage`, `toggleLanguage`, and `t(key)`.

Wrap the app tree in `LanguageProvider` near the existing top-level providers so navigation and screens can consume it.

## Translation Scope

Initial scope covers app chrome that is already hard-coded in visible UI:

- Bottom tab labels.
- Stack header titles.
- Settings screen labels, section headings, subtitles, and alerts.
- Shared labels touched by this change where tests cover them.

Card content and deck data stay in their current learning-language format.

## Error Handling

Preference loading is resilient:

- Missing prefs use defaults.
- Malformed JSON uses defaults.
- Unknown `uiLanguage` values use Spanish.

Saving language updates uses the existing prefs write path. If a save fails, the screen should keep rendering with the last known language rather than crashing.

## Testing

Use TDD for the implementation:

- Add prefs tests proving `uiLanguage` defaults to Spanish, persists valid language values, and rejects invalid values.
- Add Settings tests proving the language row renders and toggles to English.
- Run focused Jest tests for prefs and Settings, then run typecheck.

