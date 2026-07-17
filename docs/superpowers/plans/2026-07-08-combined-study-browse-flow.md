# Combined Study Browse Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace separate Browse and Study top-level destinations with one Study tab that opens on discovery content and drills into the existing flashcard session.

**Architecture:** `StudyScreen` becomes a two-layer screen with `landing` and `session` modes. Navigation removes the Browse tab. A small storage helper persists the last study deck/card for Resume Session.

**Tech Stack:** React Native, React Navigation, AsyncStorage, Jest, @testing-library/react-native, TypeScript.

## Global Constraints

- Do not add dependencies.
- Keep the existing flashcard session UI and grading behavior.
- Use existing deck/category helpers instead of duplicating category mapping.
- Keep Spanish and English copy in `src/i18n/translations.ts`.
- Persist only deck/card identifiers and timestamps for Resume Session.

---

## File Structure

- `src/storage/storage.ts`: add `LastStudySession`, `getLastStudySession()`, and `saveLastStudySession()`.
- `src/screens/StudyScreen.tsx`: add landing/session mode, search/category/resume handlers, and session back control.
- `src/navigation/index.tsx`: remove Browse tab metadata and tab screen.
- `src/i18n/translations.ts`: add Study landing and resume labels.
- `__tests__/screens/StudyScreen.test.tsx`: update expectations for landing-first behavior and add transition tests.
- `__tests__/navigation/RootNavigator.test.tsx`: update tab expectations if the file asserts Browse.
- Delete `src/screens/BrowseScreen.tsx` and `__tests__/screens/BrowseScreen.test.tsx` after Study owns the landing behavior.

### Task 1: Persist Last Study Session

**Files:**
- Modify: `src/storage/storage.ts`
- Test through: `__tests__/screens/StudyScreen.test.tsx`

**Interfaces:**
- Produces: `LastStudySession`, `getLastStudySession(): Promise<LastStudySession | undefined>`, `saveLastStudySession(session: Omit<LastStudySession, 'updatedAt'>): Promise<LastStudySession>`.
- Consumes: AsyncStorage.

- [ ] **Step 1: Write failing StudyScreen tests that mock resume storage**

Mock `getLastStudySession` and `saveLastStudySession` in `__tests__/screens/StudyScreen.test.tsx`:

```ts
jest.mock('../../src/storage/storage', () => ({
  getDailyProgress: jest.fn().mockResolvedValue({ count: 3, target: 10 }),
  incrementDailyProgress: jest.fn().mockResolvedValue({ count: 4, target: 10 }),
  getLastStudySession: jest.fn().mockResolvedValue(undefined),
  saveLastStudySession: jest.fn().mockResolvedValue({
    deckId: 'deck-greetings',
    cardId: 'c1',
    updatedAt: 1000,
  }),
}));
```

- [ ] **Step 2: Implement storage helpers**

Add to `src/storage/storage.ts`:

```ts
const LAST_STUDY_SESSION_KEY = 'SRS_LAST_STUDY_SESSION_V1';

export interface LastStudySession {
  deckId: string;
  cardId?: string;
  updatedAt: number;
}

export async function getLastStudySession(): Promise<LastStudySession | undefined> {
  const raw = await AsyncStorage.getItem(LAST_STUDY_SESSION_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as LastStudySession;
    if (!parsed?.deckId || typeof parsed.updatedAt !== 'number') return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export async function saveLastStudySession(
  session: Omit<LastStudySession, 'updatedAt'>,
): Promise<LastStudySession> {
  const next: LastStudySession = {
    ...session,
    updatedAt: Date.now(),
  };
  await AsyncStorage.setItem(LAST_STUDY_SESSION_KEY, JSON.stringify(next));
  return next;
}
```

- [ ] **Step 3: Run focused tests**

Run: `npm test -- __tests__/screens/StudyScreen.test.tsx --runInBand`

Expected: tests still fail until the StudyScreen behavior is implemented.

### Task 2: Build Study Landing and Session Transitions

**Files:**
- Modify: `src/screens/StudyScreen.tsx`
- Modify: `src/i18n/translations.ts`
- Test: `__tests__/screens/StudyScreen.test.tsx`

**Interfaces:**
- Consumes: `getLastStudySession()`, `saveLastStudySession()`, `getPreferredDeckForCategory()`, `CATEGORY_DISPLAY`.
- Produces: landing mode UI, session mode UI, search/category/resume transitions.

- [ ] **Step 1: Add landing copy**

Add translation keys:

```ts
'study.landing.title': 'Estudiar',
'study.resume.title': 'Continuar sesión',
'study.resume.empty': 'Empieza una categoría o busca una palabra para crear tu primera sesión.',
'study.resume.cta': 'Continuar',
'study.session.back': 'Volver',
```

English:

```ts
'study.landing.title': 'Study',
'study.resume.title': 'Resume Session',
'study.resume.empty': 'Start a category or search for a word to create your first session.',
'study.resume.cta': 'Continue',
'study.session.back': 'Back',
```

- [ ] **Step 2: Add failing landing tests**

Add tests that expect Study to render search/categories first, category press to show flashcard UI, search result press to show flashcard UI, resume press to show flashcard UI, and Back to return to landing.

- [ ] **Step 3: Implement landing mode**

In `StudyScreen`, add `mode`, `q`, `searching`, `resumeSession`, and `startCardId` state. Use `allCards`, `visibleCategories`, and `searchResults` memos matching the current Browse screen. Return the landing `ScrollView` when `mode === 'landing'`.

- [ ] **Step 4: Implement transition handlers**

Add handlers:

```ts
function startSession(deckId: string, cardId?: string) {
  setActiveDeckId(deckId);
  setStartCardId(cardId);
  setMode('session');
  void saveLastStudySession({ deckId, cardId });
}
```

`handleCategoryPress` uses `getPreferredDeckForCategory`. Search result rows call `startSession(item.deckId, item.card.id)`. Resume calls `startSession(resumeDeck.id, resumeSession.cardId)`.

- [ ] **Step 5: Keep tapped search card first**

After filtering the batch, if `startCardId` exists and the matching card is in the active deck, move or prepend it to the front of the session batch. Clear index to `0` when a new session starts.

- [ ] **Step 6: Update grading persistence**

After `recordAnswer`, call `saveLastStudySession({ deckId: activeDeck.id, cardId: card.id })`.

- [ ] **Step 7: Run focused tests**

Run: `npm test -- __tests__/screens/StudyScreen.test.tsx --runInBand`

Expected: PASS.

### Task 3: Remove Browse from Bottom Navigation

**Files:**
- Modify: `src/navigation/index.tsx`
- Test: `__tests__/navigation/RootNavigator.test.tsx`

**Interfaces:**
- Consumes: `StudyScreen`.
- Produces: bottom tabs `Home`, `Study`, `Progress`, `Settings`.

- [ ] **Step 1: Remove Browse tab import, metadata, and screen**

Delete `BrowseScreen` import. Remove `{ name: 'Browse', labelKey: 'tabs.browse', icon: '🔍' }` from `TABS`. Remove `<Tab.Screen name="Browse" component={BrowseScreen} />`.

- [ ] **Step 2: Update navigation tests**

If a test expects Browse in the bottom tab list, update it to expect Study and not Browse.

- [ ] **Step 3: Run navigation tests**

Run: `npm test -- __tests__/navigation/RootNavigator.test.tsx --runInBand`

Expected: PASS.

### Task 4: Remove Dead Browse Screen

**Files:**
- Delete: `src/screens/BrowseScreen.tsx`
- Delete: `__tests__/screens/BrowseScreen.test.tsx`
- Modify: `ACCESSIBILITY.md`

**Interfaces:**
- Consumes: Study landing behavior from Task 2.
- Produces: no user-facing or tested `BrowseScreen` duplicate.

- [ ] **Step 1: Remove the obsolete screen and test**

Run: `rg -n "BrowseScreen|name=\"Browse\"|navigate\\('Browse'|navigate\\(\"Browse\"" src __tests__`

Expected: no source or test references remain.

- [ ] **Step 2: Update documentation**

Remove `BrowseScreen.tsx` from `ACCESSIBILITY.md` because it is no longer a screen.

### Task 5: Final Verification

**Files:**
- No direct edits unless verification finds a defect.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified implementation.

- [ ] **Step 1: Run focused screen tests**

Run: `npm test -- __tests__/screens/StudyScreen.test.tsx __tests__/screens/HomeScreen.test.tsx --runInBand`

Expected: PASS.

- [ ] **Step 2: Run navigation tests**

Run: `npm test -- __tests__/navigation/RootNavigator.test.tsx --runInBand`

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.
