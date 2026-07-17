# Topic-based Phrases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-class Phrases experience that groups useful conversational content by topic, includes conversational Weather phrases, and preserves Favorites as a separate destination.

**Architecture:** Seed the existing phrase-deck files through `ALL_DECKS`, use a pure `phraseTopics` utility to define the topic-to-deck mapping and Weather-only phrase filter, and build a stack screen from the existing deck context. Home links directly to the new screen; the existing `Phrasebook` route remains the favorites store.

**Tech Stack:** Expo, React Native, TypeScript, React Navigation, Jest, React Native Testing Library.

## Global Constraints

- Preserve the existing in-progress study-flow changes in the current checkout.
- Do not add a bottom navigation tab; expose Phrases through Home’s existing tools area.
- Do not change the persisted deck or flashcard types.
- Use `phrase` and `weather` tags on Weather conversation cards.
- Localize every user-visible string in both `en` and `es`.
- Keep Favorites on the existing `Phrasebook` route.

---

### Task 1: Seed phrase decks and Weather conversation content

**Files:**

- Create: `src/utils/phraseTopics.ts`
- Create: `__tests__/data/phraseContent.test.ts`
- Create: `__tests__/utils/phraseTopics.test.ts`
- Modify: `src/data/decks/index.ts`
- Modify: `src/data/decks/weather.ts`

**Interfaces:**

- Produces `PHRASE_TOPICS`, `getAvailablePhraseTopics(decks)`, and `getPhraseTopicCards(topic, deck)` for UI consumers.
- Produces seven seeded phrase decks and Weather cards tagged `['weather', 'phrase', ...]`.

- [ ] **Step 1: Write failing content and topic tests**

```ts
expect(ALL_DECKS.map((deck) => deck.id)).toEqual(
  expect.arrayContaining([
    'deck-useful-phrases',
    'deck-social-phrases',
    'deck-restaurant-phrases',
    'deck-transport-phrases',
    'deck-accommodation-phrases',
    'deck-medical-phrases',
  ]),
);
expect(WeatherDeck.cards.map((card) => card.front)).toEqual(
  expect.arrayContaining(['Hace mucho calor hoy', 'Estoy sudando', 'Está lloviendo afuera']),
);
```

- [ ] **Step 2: Run targeted tests and verify RED**

Run: `npm test -- --runInBand __tests__/data/phraseContent.test.ts __tests__/utils/phraseTopics.test.ts`

Expected: the deck-presence and Weather-sentence assertions fail because the content is not yet seeded or present.

- [ ] **Step 3: Implement the deck exports, topic configuration, and Weather cards**

```ts
export const PHRASE_TOPICS = [
  { id: 'conversation', deckId: 'deck-conversation', emoji: '💬' },
  { id: 'weather', deckId: 'deck-weather', emoji: '🌦️', cardTag: 'phrase' },
] as const;

export function getPhraseTopicCards(topic: PhraseTopic, deck: Deck) {
  return topic.cardTag
    ? deck.cards.filter((card) => card.tags?.includes(topic.cardTag))
    : deck.cards;
}
```

- [ ] **Step 4: Run targeted tests and verify GREEN**

Run: `npm test -- --runInBand __tests__/data/phraseContent.test.ts __tests__/utils/phraseTopics.test.ts`

Expected: PASS.

### Task 2: Build the browsable Phrases screen

**Files:**

- Create: `src/screens/PhrasesScreen.tsx`
- Create: `__tests__/screens/PhrasesScreen.test.tsx`

**Interfaces:**

- Consumes `useDeck`, `useLanguage`, `speakCard`, and the topic utility from Task 1.
- Produces a screen that selects a topic, plays/favorites cards, opens Favorites, and navigates to Study with `{ autoStartDeckId }`.

- [ ] **Step 1: Write the failing screen test**

```tsx
fireEvent.press(getByText('Weather today'));
expect(getByText('Hace mucho calor hoy')).toBeTruthy();
fireEvent.press(getByText('Study weather'));
expect(mockNavigate).toHaveBeenCalledWith('Study', { autoStartDeckId: 'deck-weather' });
```

- [ ] **Step 2: Run the screen test and verify RED**

Run: `npm test -- --runInBand __tests__/screens/PhrasesScreen.test.tsx`

Expected: FAIL because `PhrasesScreen` does not yet exist.

- [ ] **Step 3: Implement the screen with topic cards and in-place phrase list**

```tsx
const selectTopic = (topic: AvailablePhraseTopic) => setSelectedTopicId(topic.id);

const studyTopic = () => {
  if (selectedTopic) nav.navigate('Study', { autoStartDeckId: selectedTopic.deck.id });
};
```

- [ ] **Step 4: Run the screen test and verify GREEN**

Run: `npm test -- --runInBand __tests__/screens/PhrasesScreen.test.tsx`

Expected: PASS.

### Task 3: Integrate navigation, Home, translations, and Favorites copy

**Files:**

- Modify: `src/navigation/index.tsx`
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/i18n/translations.ts`
- Modify: `__tests__/screens/HomeScreen.test.tsx`
- Modify: `__tests__/navigation/RootNavigator.test.tsx`

**Interfaces:**

- Registers the route name `Phrases` with `PhrasesScreen`.
- Home’s Phrases quick action calls `nav.navigate('Phrases')`.
- Existing `Phrasebook` route continues to render Favorites.

- [ ] **Step 1: Change the Home and navigation expectations first**

```tsx
fireEvent.press(getByText('Phrases'));
expect(mockNavigate).toHaveBeenCalledWith('Phrases');
expect(stackNames).toContain('Phrases');
```

- [ ] **Step 2: Run targeted integration tests and verify RED**

Run: `npm test -- --runInBand __tests__/screens/HomeScreen.test.tsx __tests__/navigation/RootNavigator.test.tsx`

Expected: the Home expectation fails because the current quick action still says `Phrasebook` and opens the Favorites route.

- [ ] **Step 3: Register Phrases, point Home to it, and add bilingual copy**

```tsx
<Stack.Screen name="Phrases" component={PhrasesScreen} options={{ ...stackHeaderOpts, title: t('nav.phrases') }} />
<Pressable style={styles.quickAction} onPress={() => nav.navigate('Phrases')}>
  <Text style={styles.quickActionIcon}>🗣️</Text>
  <Text style={styles.quickActionLabel}>{t('home.tool.phrases')}</Text>
</Pressable>
```

- [ ] **Step 4: Run targeted integration tests and verify GREEN**

Run: `npm test -- --runInBand __tests__/screens/HomeScreen.test.tsx __tests__/navigation/RootNavigator.test.tsx`

Expected: PASS.

### Task 4: Verify and commit the merged work

**Files:**

- Verify all feature files and existing merged changes.

- [ ] **Step 1: Run static verification**

Run: `npm run typecheck && npm run lint`

Expected: both commands exit with status 0.

- [ ] **Step 2: Run the full test suite**

Run: `npm test -- --runInBand`

Expected: all suites pass.

- [ ] **Step 3: Review the staged diff, then commit**

Run: `git diff --check && git status --short && git add -A && git diff --cached --check && git commit -m "feat: add topic-based phrases"`

Expected: no whitespace errors and one commit containing the merged existing work plus the Phrases feature.
