# Study Screen Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the Study screen while preserving the Colombian flag visual identity, including a clear overflow cue for the region filter row.

**Architecture:** Keep the change presentation-only. `StudyScreen` owns the session header, progress, filter row, hints, rating panel, and empty states; `Flashcard` owns the card face visuals and existing flip/swipe/audio behavior. Existing deck, region, SRS, favorite, and daily-progress data flow remains unchanged.

**Tech Stack:** Expo, React Native, TypeScript, React Navigation, Jest, `@testing-library/react-native`.

---

## File Structure

- Modify: `src/screens/StudyScreen.tsx`
  - Rework the main vertical layout, header hierarchy, compact region filter row, overflow cue, study hints, card spacing, and grade panel styles.
- Modify: `src/components/Flashcard.tsx`
  - Tighten the card surface, typography, audio button, and tappable feel while preserving current animation and gesture behavior.
- Modify: `src/i18n/translations.ts`
  - Change `study.hint.flip` copy to a clearer "tap card for answer" instruction in English and Spanish.
- Modify: `__tests__/screens/StudyScreen.test.tsx`
  - Add focused coverage for the region filter overflow cue and clearer tap-to-answer hint.

## Task 1: Add Failing Study Screen Regression Tests

**Files:**
- Modify: `__tests__/screens/StudyScreen.test.tsx`

- [ ] **Step 1: Add tests for filter overflow affordance and clearer hint copy**

Insert these tests inside `describe('StudyScreen rendering', () => { ... })`, after the existing region filter test:

```tsx
  it('renders compact region filters with an overflow affordance', async () => {
    const { getByTestId, getByText } = renderStudyScreen();

    await waitFor(() => expect(getByTestId('region-filter-scroll')).toBeTruthy());
    expect(getByTestId('region-filter-overflow-cue')).toBeTruthy();
    expect(getByText('Todos')).toBeTruthy();
    expect(getByText('Paisa')).toBeTruthy();
    expect(getByText('Valluno')).toBeTruthy();
  });

  it('uses clear tap-to-answer copy for the flashcard hint', async () => {
    const { getByText } = renderStudyScreen();

    await waitFor(() => expect(getByText('Toca para ver respuesta')).toBeTruthy());
  });
```

- [ ] **Step 2: Run the focused Study screen test and confirm it fails**

Run:

```bash
npm test -- __tests__/screens/StudyScreen.test.tsx --runInBand
```

Expected: FAIL because `region-filter-scroll`, `region-filter-overflow-cue`, and `Toca para ver respuesta` do not exist yet.

## Task 2: Implement the Focused Study Layout and Filter Cue

**Files:**
- Modify: `src/screens/StudyScreen.tsx`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Update the hint translation copy**

In `src/i18n/translations.ts`, change the Spanish value:

```ts
'study.hint.flip': 'Toca para ver respuesta',
```

Change the English value:

```ts
'study.hint.flip': 'Tap card for answer',
```

- [ ] **Step 2: Replace the top progress/header/filter JSX in `StudyScreen`**

In `src/screens/StudyScreen.tsx`, replace the current progress bar, `studyHeader`, and bare `ScrollView` filter row with this structure:

```tsx
      <View style={styles.sessionHeader}>
        <View style={styles.sessionTitleBlock}>
          <Text style={styles.sessionEyebrow}>{t('tabs.study')}</Text>
          <View style={styles.deckTitleRow}>
            <Text style={styles.deckPillFlag}>🇨🇴</Text>
            <Text style={styles.deckTitle} numberOfLines={1}>{activeDeck.name}</Text>
          </View>
        </View>
        <View style={styles.studyHeaderActions}>
          {card && (
            <Pressable
              style={styles.favoriteBtn}
              accessibilityLabel={card.favorite ? t('study.favorite.remove') : t('study.favorite.save')}
              onPress={() => toggleFavorite(card.id)}
            >
              <Text style={styles.favoriteBtnText}>{card.favorite ? '★' : '☆'}</Text>
            </Pressable>
          )}
          <View style={styles.cardsLeftPill}>
            <Text style={styles.cardsLeftText}>{t('study.cardsLeft', { count: remaining })}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.regionFilterWrap}>
        <ScrollView
          testID="region-filter-scroll"
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.regionScroller}
          contentContainerStyle={styles.regionRow}
        >
          {REGION_FILTERS.map((region) => (
            <Pressable
              key={region.id}
              style={[styles.regionChip, activeRegion === region.id && styles.regionChipActive]}
              onPress={() => changeRegion(region.id)}
            >
              <Text style={[styles.regionChipText, activeRegion === region.id && styles.regionChipTextActive]}>
                {t(REGION_LABEL_KEYS[region.id])}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View
          testID="region-filter-overflow-cue"
          pointerEvents="none"
          style={styles.regionOverflowCue}
        >
          <View style={styles.regionOverflowFadeWide} />
          <View style={styles.regionOverflowFadeTight} />
          <Text style={styles.regionOverflowChevron}>›</Text>
        </View>
      </View>
```

- [ ] **Step 3: Replace the related `StudyScreen` styles**

In `StyleSheet.create`, remove `deckPill`, `deckPillName`, `studyHeader`, `regionRow`, and the old progress/header/filter styles that conflict. Add or replace with:

```tsx
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 12,
  },
  sessionTitleBlock: {
    minWidth: 0,
    flex: 1,
  },
  sessionEyebrow: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  deckTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 3,
  },
  deckPillFlag: { fontSize: 17 },
  deckTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    flexShrink: 1,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(148,163,184,0.16)',
    borderRadius: 999,
    marginHorizontal: 18,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 999,
  },
  regionFilterWrap: {
    position: 'relative',
    minHeight: 44,
    marginBottom: 8,
  },
  regionScroller: {
    flexGrow: 0,
    maxHeight: 44,
  },
  regionRow: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingRight: 52,
  },
  regionChip: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  regionChipActive: {
    backgroundColor: '#047857',
    borderColor: '#10b981',
  },
  regionChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '800' },
  regionChipTextActive: { color: '#ffffff', fontWeight: '900' },
  regionOverflowCue: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 52,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  regionOverflowFadeWide: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.55)',
  },
  regionOverflowFadeTight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: colors.bg,
  },
  regionOverflowChevron: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: '900',
    paddingRight: 16,
  },
```

- [ ] **Step 4: Tighten hint, card area, and grade panel styles**

Update these existing styles:

```tsx
  swipeHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  swipeHard: { color: 'rgba(248,113,113,0.72)', fontSize: 12, fontWeight: '800' },
  swipeTap: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  swipeEasy: { color: 'rgba(16,185,129,0.72)', fontSize: 12, fontWeight: '800' },
  cardArea: {
    flex: 1,
    paddingHorizontal: 18,
    gap: 10,
  },
  gradeBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.12)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  gradeLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  gradeButtons: { flexDirection: 'row', gap: 8 },
  gradeBtn: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1.5,
  },
```

- [ ] **Step 5: Run the focused Study screen test**

Run:

```bash
npm test -- __tests__/screens/StudyScreen.test.tsx --runInBand
```

Expected: PASS.

## Task 3: Tighten the Flashcard Presentation

**Files:**
- Modify: `src/components/Flashcard.tsx`

- [ ] **Step 1: Update card container and face styles**

Replace the related styles in `src/components/Flashcard.tsx` with:

```tsx
  cardWrap: { height: 278 },

  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFront: {
    borderTopWidth: 5,
    borderTopColor: colors.brand,
    shadowColor: 'rgba(255,218,0,0.2)',
  },
  cardBack: {
    borderTopWidth: 5,
    borderTopColor: colors.accentBlue,
  },

  face: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 28,
    gap: 12,
  },
```

- [ ] **Step 2: Update flashcard typography and audio button styles**

Replace the related styles with:

```tsx
  frontWord: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  backWord: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  example: {
    color: colors.textSecondary,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  exampleBack: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  speakerBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,218,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.36)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerIcon: { fontSize: 17 },
```

- [ ] **Step 3: Run the Flashcard tests**

Run:

```bash
npm test -- __tests__/components/Flashcard.test.tsx --runInBand
```

Expected: PASS.

## Task 4: Final Verification and Commit

**Files:**
- Verify: `src/screens/StudyScreen.tsx`
- Verify: `src/components/Flashcard.tsx`
- Verify: `src/i18n/translations.ts`
- Verify: `__tests__/screens/StudyScreen.test.tsx`

- [ ] **Step 1: Run focused tests together**

Run:

```bash
npm test -- __tests__/screens/StudyScreen.test.tsx __tests__/components/Flashcard.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Manually verify in the simulator**

Run:

```bash
npm start
```

Expected: Expo starts successfully. In the iPhone simulator, the Study screen should show a compact filter row with the right-edge fade and chevron cue, a centered flashcard, clear tap-to-answer hint copy, and an uncluttered rating panel.

- [ ] **Step 5: Commit the implementation**

Run:

```bash
git add src/screens/StudyScreen.tsx src/components/Flashcard.tsx src/i18n/translations.ts __tests__/screens/StudyScreen.test.tsx
git commit -m "style: clean up study screen"
```
