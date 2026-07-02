# Browse Flow Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify Browse into a category-first screen, remove ineffective filters, and make the bottom nav order Home, Browse, Study, Progress, Settings.

**Architecture:** Keep the work inside existing React Native screen/navigation files. Browse will derive visible category cards from loaded decks, search all cards without hidden filters, and preserve the existing category-to-study handoff.

**Tech Stack:** Expo, React Native, React Navigation, TypeScript, Jest, `@testing-library/react-native`.

---

### Task 1: Update Browse Tests For Simplified Flow

**Files:**
- Modify: `__tests__/screens/BrowseScreen.test.tsx`
- Test: `__tests__/screens/BrowseScreen.test.tsx`

- [ ] **Step 1: Add a navigation mock for category press assertions**

Add this mock near the existing Jest mocks:

```ts
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
```

Update `beforeEach` so it clears `mockNavigate` with the other mocks:

```ts
beforeEach(() => {
  jest.clearAllMocks();
});
```

- [ ] **Step 2: Add decks that exercise categories beyond the old six-card subset**

Add these fixtures after `DECK_PAISA`:

```ts
const DECK_TECH: Deck = {
  id: 'deck-tech',
  name: 'Tecnología',
  cards: [
    makeCard('t1', { front: 'celular', back: 'cell phone', tags: ['tech'] }),
  ],
};

const DECK_HEALTH: Deck = {
  id: 'deck-health',
  name: 'Salud',
  cards: [
    makeCard('h1', { front: 'cita médica', back: 'medical appointment', tags: ['health'] }),
  ],
};

const DECK_NUMBERS: Deck = {
  id: 'deck-numbers',
  name: 'Numbers',
  cards: [
    makeCard('n1', { front: 'quincena', back: 'paycheck every 15 days', tags: ['number'] }),
  ],
};
```

Update `buildContext` so the default deck list includes them:

```ts
function buildContext(overrides = {}) {
  return {
    ready: true,
    decks: [DECK_A, DECK_B, DECK_PAISA, DECK_TECH, DECK_HEALTH, DECK_NUMBERS],
    setActiveDeckId: jest.fn(),
    ...overrides,
  };
}
```

- [ ] **Step 3: Replace the category-card test with all visible category assertions**

Replace the old `shows category cards in browse mode` test with:

```ts
it('shows every non-empty category represented by loaded decks', () => {
  const { getByText } = renderBrowseScreen();

  expect(getByText('Jerga Colombiana')).toBeTruthy();
  expect(getByText('Comida & Bebida')).toBeTruthy();
  expect(getByText('Comunicación')).toBeTruthy();
  expect(getByText('Tecnología')).toBeTruthy();
  expect(getByText('Salud')).toBeTruthy();
  expect(getByText('Números & Tiempo')).toBeTruthy();
});
```

- [ ] **Step 4: Replace region/deck filter tests with removed-filter assertions**

Delete the current `filters search results by selected region` test and the entire `BrowseScreen deck filter` describe block.

Add this test after the default rendering tests:

```ts
it('does not render the old filter controls', () => {
  const { queryByText } = renderBrowseScreen();

  expect(queryByText('⚙️ Filtros')).toBeNull();
  expect(queryByText('Todos')).toBeNull();
  expect(queryByText('🇨🇴 Jerga')).toBeNull();
  expect(queryByText('Paisa')).toBeNull();
});
```

- [ ] **Step 5: Add plain all-content search coverage**

Add this test inside `BrowseScreen search`:

```ts
it('searches across all loaded cards without region or deck-type filters', async () => {
  const { getByPlaceholderText, queryByText } = renderBrowseScreen();

  fireEvent.changeText(getByPlaceholderText('Busca palabras, frases o decks...'), 'paisa');

  await waitFor(() => expect(queryByText('parce-paisa')).toBeTruthy());
  expect(queryByText('bandeja paisa')).toBeTruthy();
});
```

- [ ] **Step 6: Add category press coverage**

Add this describe block before the audio tests:

```ts
describe('BrowseScreen categories', () => {
  it('activates the first matching category deck and navigates to Study', () => {
    const setActiveDeckId = jest.fn();
    const { getByText } = renderBrowseScreen({ setActiveDeckId });

    fireEvent.press(getByText('Tecnología'));

    expect(setActiveDeckId).toHaveBeenCalledWith('deck-tech');
    expect(mockNavigate).toHaveBeenCalledWith('Study');
  });
});
```

- [ ] **Step 7: Run the focused test and verify it fails**

Run:

```bash
npx jest __tests__/screens/BrowseScreen.test.tsx --runInBand
```

Expected before implementation: FAIL because the old filter controls still render, the missing category labels are not translated, and search still applies removed filters.

---

### Task 2: Simplify Browse Screen

**Files:**
- Modify: `src/screens/BrowseScreen.tsx`
- Modify: `src/i18n/translations.ts`
- Test: `__tests__/screens/BrowseScreen.test.tsx`

- [ ] **Step 1: Remove region filter imports and filter constants**

In `src/screens/BrowseScreen.tsx`, remove this import block:

```ts
import {
  cardMatchesRegion,
  REGION_FILTERS,
  REGION_LABEL_KEYS,
  RegionFilterId,
} from '../utils/regions';
```

Delete the `FILTER_CHIPS` constant.

- [ ] **Step 2: Expand `CATEGORY_DISPLAY` to all category buckets**

Replace the current `CATEGORY_DISPLAY` value with:

```ts
const CATEGORY_DISPLAY = [
  { key: 'Colombianisms', emoji: '🇨🇴', labelKey: 'browse.category.colombianisms', color: '#FFDA00', bg: 'rgba(255,218,0,0.08)' },
  { key: 'Essentials', emoji: '⭐', labelKey: 'browse.category.essentials', color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  { key: 'People & Relationships', emoji: '👥', labelKey: 'browse.category.people', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'Places & Travel', emoji: '🚌', labelKey: 'browse.category.travel', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  { key: 'Home & Daily Life', emoji: '🏠', labelKey: 'browse.category.home', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
  { key: 'Food & Drink', emoji: '🍺', labelKey: 'browse.category.food', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  { key: 'Communication', emoji: '💬', labelKey: 'browse.category.communication', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  { key: 'Health', emoji: '🩺', labelKey: 'browse.category.health', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
  { key: 'Nature', emoji: '🌿', labelKey: 'browse.category.nature', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  { key: 'Work & School', emoji: '💼', labelKey: 'browse.category.work', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  { key: 'Numbers & Time', emoji: '🔢', labelKey: 'browse.category.numbers', color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
  { key: 'Fun & Culture', emoji: '🎵', labelKey: 'browse.category.culture', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  { key: 'Tech', emoji: '📱', labelKey: 'browse.category.tech', color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
  { key: 'Other', emoji: '🧩', labelKey: 'browse.category.other', color: '#e2e8f0', bg: 'rgba(226,232,240,0.08)' },
] as const;
```

- [ ] **Step 3: Remove hidden filter state**

Delete these state declarations:

```ts
const [activeFilter, setActiveFilter] = useState('all');
const [activeRegion, setActiveRegion] = useState<RegionFilterId>('all');
```

- [ ] **Step 4: Add derived visible categories**

Add this memo after `allCards`:

```ts
const visibleCategories = useMemo(
  () =>
    CATEGORY_DISPLAY.filter((cat) =>
      (decks || []).some((deck) => getCategoryForDeck(deck) === cat.key),
    ),
  [decks],
);
```

- [ ] **Step 5: Simplify Words of the Day and search logic**

Replace `trendingWords` with:

```ts
const trendingWords = useMemo(() => {
  const slangRows = allCards.filter((x) => {
    const text = `${(x.card.tags || []).join(' ')} ${x.deckName}`.toLowerCase();
    return /(slang|jerga|coloquial|colombia)/.test(text);
  });
  return slangRows.slice(0, 5);
}, [allCards]);
```

Replace `searchResults` with:

```ts
const searchResults = useMemo(() => {
  const query = q.trim().toLowerCase();
  if (!query) return [];

  return allCards
    .filter((x) => {
      const hay = [
        x.card.front,
        x.card.back,
        x.card.example,
        x.deckName,
        (x.card.tags || []).join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    })
    .slice(0, 80);
}, [allCards, q]);
```

- [ ] **Step 6: Remove filter UI from JSX**

In the header JSX, replace:

```tsx
<View style={styles.header}>
  <Text style={styles.title}>{t('browse.title')}</Text>
  <View style={styles.filterPill}>
    <Text style={styles.filterPillText}>{t('browse.filters')}</Text>
  </View>
</View>
```

with:

```tsx
<View style={styles.header}>
  <Text style={styles.title}>{t('browse.title')}</Text>
</View>
```

Delete the two `ScrollView` blocks labeled `Filter chips` and region chips.

- [ ] **Step 7: Render visible categories and remove See all**

Replace the category header and grid with:

```tsx
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>{t('browse.categories')}</Text>
</View>
<View style={styles.catGrid}>
  {visibleCategories.map((cat) => (
    <Pressable
      key={cat.key}
      style={[styles.catCard, { backgroundColor: cat.bg, borderColor: cat.color + '66' }]}
      onPress={() => handleCategoryPress(cat.key)}
    >
      <Text style={styles.catEmoji}>{cat.emoji}</Text>
      <Text style={[styles.catLabel, { color: cat.color }]} numberOfLines={2}>
        {t(cat.labelKey)}
      </Text>
    </Pressable>
  ))}
</View>
```

- [ ] **Step 8: Remove unused styles**

Delete these styles from `StyleSheet.create`:

```ts
filterPill,
filterPillText,
chipsScroll,
regionChipsScroll,
chipsRow,
chip,
chipActive,
regionChipActive,
chipText,
chipTextActive,
regionChipTextActive,
seeAll,
```

Keep `sectionHeader` even though it no longer uses `justifyContent: 'space-between'`; it still aligns the section title.

- [ ] **Step 9: Add missing translations**

In `src/i18n/translations.ts`, add Spanish keys near the existing Browse category keys:

```ts
'browse.category.essentials': 'Esenciales',
'browse.category.home': 'Casa & Vida Diaria',
'browse.category.communication': 'Comunicación',
'browse.category.health': 'Salud',
'browse.category.nature': 'Naturaleza',
'browse.category.numbers': 'Números & Tiempo',
'browse.category.tech': 'Tecnología',
'browse.category.other': 'Otros',
```

Add English keys near the English Browse category keys:

```ts
'browse.category.essentials': 'Essentials',
'browse.category.home': 'Home & Daily Life',
'browse.category.communication': 'Communication',
'browse.category.health': 'Health',
'browse.category.nature': 'Nature',
'browse.category.numbers': 'Numbers & Time',
'browse.category.tech': 'Tech',
'browse.category.other': 'Other',
```

- [ ] **Step 10: Run the focused Browse test**

Run:

```bash
npx jest __tests__/screens/BrowseScreen.test.tsx --runInBand
```

Expected: PASS.

---

### Task 3: Swap Browse And Study In Bottom Navigation

**Files:**
- Modify: `src/navigation/index.tsx`
- Test: TypeScript compile

- [ ] **Step 1: Reorder tab metadata**

In `src/navigation/index.tsx`, replace the first three entries of `TABS` with:

```ts
const TABS: { name: string; labelKey: TranslationKey; icon: string }[] = [
  { name: 'Home', labelKey: 'tabs.home', icon: '🏠' },
  { name: 'Browse', labelKey: 'tabs.browse', icon: '🔍' },
  { name: 'Study', labelKey: 'tabs.study', icon: '📖' },
  { name: 'Progress', labelKey: 'tabs.progress', icon: '📊' },
  { name: 'Settings', labelKey: 'tabs.settings', icon: '⚙️' },
];
```

- [ ] **Step 2: Reorder `Tab.Screen` declarations to match metadata**

In `Tabs`, replace the first three screen declarations with:

```tsx
<Tab.Screen name="Home"     component={HomeScreen} />
<Tab.Screen name="Browse"   component={BrowseScreen} />
<Tab.Screen name="Study"    component={StudyScreen} />
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

---

### Task 4: Final Verification

**Files:**
- Verify: `src/screens/BrowseScreen.tsx`
- Verify: `src/navigation/index.tsx`
- Verify: `__tests__/screens/BrowseScreen.test.tsx`

- [ ] **Step 1: Run Browse tests**

Run:

```bash
npx jest __tests__/screens/BrowseScreen.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Review git diff**

Run:

```bash
git diff -- src/navigation/index.tsx src/screens/BrowseScreen.tsx src/i18n/translations.ts __tests__/screens/BrowseScreen.test.tsx
```

Expected: Diff only includes tab-order changes, Browse filter removal, all-category rendering, missing category translations, and Browse test updates.

- [ ] **Step 4: Commit implementation**

Run:

```bash
git add src/navigation/index.tsx src/screens/BrowseScreen.tsx src/i18n/translations.ts __tests__/screens/BrowseScreen.test.tsx
git commit -m "fix: simplify browse flow"
```

Expected: Commit succeeds without staging unrelated existing changes.
