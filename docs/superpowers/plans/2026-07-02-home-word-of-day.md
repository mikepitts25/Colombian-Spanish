# Home Word Of Day Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Words of the Day from Browse to one Word of the Day card on Home.

**Architecture:** Keep the change inside existing screen files. Home will derive one slang/Colombianism card from loaded decks and render a compact audio-enabled card; Browse will remove its multi-row Words of the Day feed.

**Tech Stack:** Expo, React Native, TypeScript, Jest, `@testing-library/react-native`.

---

### Task 1: Update Home Tests For One Word Of The Day

**Files:**
- Modify: `__tests__/screens/HomeScreen.test.tsx`
- Test: `__tests__/screens/HomeScreen.test.tsx`

- [ ] **Step 1: Mock text-to-speech**

Add this mock near the other Jest mocks:

```ts
jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(),
}));
```

Import the mock after `useDeck`:

```ts
import { speakCard } from '../../src/services/tts';
const mockSpeakCard = speakCard as jest.Mock;
```

- [ ] **Step 2: Make test cards configurable**

Replace `makeCard` with:

```ts
function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: 'hola',
    back: 'hello',
    createdAt: NOW,
    due: NOW - 1000,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}
```

- [ ] **Step 3: Add a slang deck fixture**

Add after `DECK`:

```ts
const SLANG_DECK: Deck = {
  id: 'deck-slang',
  name: 'Jerga Colombiana',
  cards: [
    makeCard('slang-1', { front: 'chimba', back: 'awesome', tags: ['slang'] }),
    makeCard('slang-2', { front: 'parce', back: 'buddy', tags: ['slang'] }),
  ],
};
```

Update the default `mockUseDeck.mockReturnValue` deck list to include `SLANG_DECK`:

```ts
decks: [DECK, SLANG_DECK],
```

- [ ] **Step 4: Add rendering and single-card assertions**

Add this test inside `describe('HomeScreen quick actions', ...)`:

```ts
it('renders one Word of the Day card from slang content', async () => {
  const { getByText, queryByText } = render(<HomeScreen />);

  await waitFor(() => expect(getByText('Word of the Day')).toBeTruthy());

  expect(getByText('chimba')).toBeTruthy();
  expect(getByText('awesome • Jerga Colombiana')).toBeTruthy();
  expect(queryByText('parce')).toBeNull();
});
```

- [ ] **Step 5: Add no-match coverage**

Add this test:

```ts
it('omits Word of the Day when no slang content exists', async () => {
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [DECK],
    activeDeckId: DECK.id,
    activeDeck: DECK,
    setActiveDeckId: jest.fn(),
  });

  const { getByText, queryByText } = render(<HomeScreen />);

  await waitFor(() => expect(getByText('Study due cards')).toBeTruthy());

  expect(queryByText('Word of the Day')).toBeNull();
  expect(queryByText('chimba')).toBeNull();
});
```

- [ ] **Step 6: Add audio coverage**

Add this test:

```ts
it('plays the Word of the Day audio', async () => {
  const { getByText } = render(<HomeScreen />);

  await waitFor(() => expect(getByText('Word of the Day')).toBeTruthy());

  fireEvent.press(getByText('🔊'));

  expect(mockSpeakCard).toHaveBeenCalledWith(SLANG_DECK.cards[0]);
});
```

- [ ] **Step 7: Run Home tests and verify they fail**

Run:

```bash
npx jest __tests__/screens/HomeScreen.test.tsx --runInBand
```

Expected before implementation: FAIL because Home does not render Word of the Day and does not call `speakCard`.

---

### Task 2: Update Browse Tests For Removed Words Section

**Files:**
- Modify: `__tests__/screens/BrowseScreen.test.tsx`
- Test: `__tests__/screens/BrowseScreen.test.tsx`

- [ ] **Step 1: Replace default Words assertions**

Replace this test:

```ts
it('shows browse categories and trending words with no search query', () => {
  const { getByText } = renderBrowseScreen();
  expect(getByText('📂 Categorías')).toBeTruthy();
  expect(getByText('🔥 Palabras del Día')).toBeTruthy();
  expect(getByText('chimba')).toBeTruthy();
  expect(getByText('awesome • Saludos')).toBeTruthy();
});
```

with:

```ts
it('shows browse categories without the old Words of the Day feed', () => {
  const { getByText, queryByText } = renderBrowseScreen();

  expect(getByText('📂 Categorías')).toBeTruthy();
  expect(queryByText('🔥 Palabras del Día')).toBeNull();
  expect(queryByText('awesome • Saludos')).toBeNull();
});
```

- [ ] **Step 2: Update Browse audio tests to use search results**

Replace the two audio tests with:

```ts
it('renders speak buttons for search result rows', async () => {
  const { getAllByText, getByPlaceholderText } = renderBrowseScreen();

  fireEvent.changeText(getByPlaceholderText('Busca palabras, frases o decks...'), 'chimba');

  await waitFor(() => expect(getAllByText('🔊').length).toBeGreaterThan(0));
});

it('calls speakCard with the row card when a search result 🔊 is pressed', async () => {
  const { getAllByText, getByPlaceholderText } = renderBrowseScreen();

  fireEvent.changeText(getByPlaceholderText('Busca palabras, frases o decks...'), 'chimba');

  await waitFor(() => expect(getAllByText('🔊').length).toBeGreaterThan(0));
  fireEvent.press(getAllByText('🔊')[0]);

  expect(mockSpeakCard).toHaveBeenCalledWith(DECK_A.cards[2]);
});
```

- [ ] **Step 3: Run Browse tests and verify they fail**

Run:

```bash
npx jest __tests__/screens/BrowseScreen.test.tsx --runInBand
```

Expected before implementation: FAIL because Browse still renders Words of the Day.

---

### Task 3: Implement Home Word Of The Day

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/i18n/translations.ts`
- Test: `__tests__/screens/HomeScreen.test.tsx`

- [ ] **Step 1: Import `speakCard`**

Add:

```ts
import { speakCard } from '../services/tts';
```

- [ ] **Step 2: Add a Word of the Day row type**

Add below `DeckWithDue`:

```ts
type WordOfDayRow = {
  deckName: string;
  card: any;
};
```

- [ ] **Step 3: Derive one word from loaded decks**

Add this memo after `quickDecks`:

```ts
const wordOfDay = useMemo<WordOfDayRow | undefined>(() => {
  const rows = (decks || []).flatMap((deck) =>
    (deck.cards || []).map((card: any) => ({ deckName: deck.name, card })),
  );

  return rows.find((row) => {
    const text = `${(row.card.tags || []).join(' ')} ${row.deckName}`.toLowerCase();
    return /(slang|jerga|coloquial|colombia)/.test(text);
  });
}, [decks]);
```

- [ ] **Step 4: Render the card below the Today card**

Add this JSX immediately after the closing `</View>` for `styles.todayCard`:

```tsx
{wordOfDay ? (
  <View style={styles.wordCard}>
    <View style={styles.wordHeader}>
      <Text style={styles.wordEyebrow}>{t('home.wordOfDay')}</Text>
      <Pressable style={styles.wordAudioButton} onPress={() => void speakCard(wordOfDay.card)}>
        <Text style={styles.wordAudioIcon}>🔊</Text>
      </Pressable>
    </View>
    <Text style={styles.wordFront}>{wordOfDay.card.front}</Text>
    <Text style={styles.wordBack}>
      {wordOfDay.card.back}
      {wordOfDay.deckName ? ` • ${wordOfDay.deckName}` : ''}
    </Text>
  </View>
) : null}
```

- [ ] **Step 5: Add Home card styles**

Add these styles before `quickActions`:

```ts
wordCard: {
  marginHorizontal: 16,
  marginBottom: 14,
  backgroundColor: colors.surface,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: 'rgba(255,218,0,0.28)',
  padding: 14,
  gap: 6,
},
wordHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
},
wordEyebrow: {
  color: colors.brand,
  fontSize: 12,
  fontWeight: '800',
  textTransform: 'uppercase',
},
wordAudioButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: colors.accentBlue,
  alignItems: 'center',
  justifyContent: 'center',
},
wordAudioIcon: { fontSize: 15 },
wordFront: { color: colors.textPrimary, fontSize: 22, fontWeight: '900' },
wordBack: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
```

- [ ] **Step 6: Add translations**

In `src/i18n/translations.ts`, add Spanish near the Home keys:

```ts
'home.wordOfDay': 'Palabra del Día',
```

Add English near the Home keys:

```ts
'home.wordOfDay': 'Word of the Day',
```

- [ ] **Step 7: Run Home tests**

Run:

```bash
npx jest __tests__/screens/HomeScreen.test.tsx --runInBand
```

Expected: PASS.

---

### Task 4: Remove Browse Words Of The Day

**Files:**
- Modify: `src/screens/BrowseScreen.tsx`
- Test: `__tests__/screens/BrowseScreen.test.tsx`

- [ ] **Step 1: Delete the `trendingWords` memo**

Remove:

```ts
const trendingWords = useMemo(() => {
  const slangRows = allCards.filter((x) => {
    const text = `${(x.card.tags || []).join(' ')} ${x.deckName}`.toLowerCase();
    return /(slang|jerga|coloquial|colombia)/.test(text);
  });
  return slangRows.slice(0, 5);
}, [allCards]);
```

- [ ] **Step 2: Delete the Browse Words JSX**

Remove the section beginning with:

```tsx
{/* Trending words */}
```

through the closing `trendingWords.map` block.

- [ ] **Step 3: Remove unused styles**

Delete these styles:

```ts
trendRow,
trendRank,
trendRankText,
trendInfo,
trendWord,
trendBack,
trendSpeakBtn,
```

Keep `seeAll` only if it is still used. If no JSX references it after this task, delete `seeAll` too.

- [ ] **Step 4: Run Browse tests**

Run:

```bash
npx jest __tests__/screens/BrowseScreen.test.tsx --runInBand
```

Expected: PASS.

---

### Task 5: Final Verification And Commit

**Files:**
- Verify: `src/screens/HomeScreen.tsx`
- Verify: `src/screens/BrowseScreen.tsx`
- Verify: `src/i18n/translations.ts`
- Verify: `__tests__/screens/HomeScreen.test.tsx`
- Verify: `__tests__/screens/BrowseScreen.test.tsx`

- [ ] **Step 1: Run Home and Browse tests**

Run:

```bash
npx jest __tests__/screens/HomeScreen.test.tsx __tests__/screens/BrowseScreen.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Review staged scope**

Run:

```bash
git diff -- src/screens/HomeScreen.tsx src/screens/BrowseScreen.tsx __tests__/screens/HomeScreen.test.tsx __tests__/screens/BrowseScreen.test.tsx src/i18n/translations.ts
```

Expected: Diff only includes moving one Word of the Day card to Home, removing Browse Words of the Day, adding Home labels, and tests.

- [ ] **Step 4: Stage carefully**

Run:

```bash
git add src/screens/HomeScreen.tsx src/screens/BrowseScreen.tsx __tests__/screens/HomeScreen.test.tsx __tests__/screens/BrowseScreen.test.tsx
```

For `src/i18n/translations.ts`, stage only the new `home.wordOfDay` lines because the file may contain unrelated dirty conjugation label edits.

- [ ] **Step 5: Commit**

Run:

```bash
git commit -m "feat: move word of day to home"
```

Expected: Commit succeeds without staging unrelated existing changes.
