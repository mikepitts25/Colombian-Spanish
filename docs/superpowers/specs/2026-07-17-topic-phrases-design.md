# Topic-based Phrases Design

## Goal

Give learners a dedicated, browsable Phrases area for immediately useful Colombian Spanish, organized by real-life situations and separate from their saved Favorites.

## Current State

The app already contains a Favorites route named `Phrasebook`, but it only displays cards the learner has starred. Seven topic-oriented phrase decks exist on disk, although only the everyday conversation deck is currently seeded into the app. The Weather deck contains vocabulary but lacks the conversational weather sentences requested for the new area.

## Navigation and Interaction

Home will expose a `Phrases` quick action in the existing tools row. It opens a new stack screen, `Phrases`, rather than adding a fifth bottom-tab item. The former Phrasebook destination remains available as `Favorites`, reached through a compact action in the Phrases header.

The Phrases screen starts with topic cards. Selecting one opens its phrase list in the same screen. Each phrase exposes Spanish, English, an example when available, audio playback, and a favorite toggle. The selected topic also offers a `Study this topic` action that hands the associated deck to the existing Study flow.

## Topics and Content Sources

- Everyday conversation — `deck-conversation`
- Essential phrases — `deck-useful-phrases`
- Social & going out — `deck-social-phrases`
- Food & dining — `deck-restaurant-phrases`
- Getting around — `deck-transport-phrases`
- Hotel & accommodation — `deck-accommodation-phrases`
- Health & emergencies — `deck-medical-phrases`
- Weather today — `deck-weather`, limited to cards tagged `phrase` in the browsing view

The Weather deck gains natural, daily-use cards including `Hace mucho calor hoy`, `Estoy sudando`, and `Está lloviendo afuera`, plus cold, humidity, downpour, and umbrella phrases. These cards retain `weather` and add `phrase` tags so the topic view can distinguish phrases from weather vocabulary.

## Data and Compatibility

All existing phrase decks are exported and added to `ALL_DECKS`. The existing seed-and-merge behavior will therefore add them to established installs without discarding user progress. The new display screen reads the existing deck context and writes favorite state through its existing `toggleFavorite` API; no new persisted model is required.

## Quality Requirements

- All new visible strings are localized in English and Spanish.
- Phrase topics are driven by a small shared configuration utility, not duplicated across UI and tests.
- Existing Favorites behavior remains intact.
- Tests cover deck inclusion, the requested Weather sentences, topic-card selection, favorites, audio, study handoff, and Home navigation.
