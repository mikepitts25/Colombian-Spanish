import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import Flashcard from '../components/Flashcard';
import {
  getDailyProgress,
  getLastStudySession,
  incrementDailyProgress,
  LastStudySession,
  saveLastStudySession,
} from '../storage/storage';
import ConjugationPanel from '../components/ConjugationPanel';
import { isVerb } from '../utils/verbUtils';
import {
  cardMatchesRegion,
  REGION_FILTERS,
  REGION_LABEL_KEYS,
  RegionFilterId,
} from '../utils/regions';
import { useLanguage } from '../context/LanguageContext';
import {
  CATEGORY_DISPLAY,
  getDeckDisplayName,
  getDecksForCategory,
  getPreferredDeckForCategory,
} from '../utils/deckCategories';
import type { CategoryKey } from '../utils/deckCategories';
import type { FlashCard } from '../types';
import { speakCard } from '../services/tts';
import { formatIntervalShort, previewInterval } from '../utils/srs';

const GRADES = [
  { labelKey: 'grades.again', color: '#f87171', bg: 'rgba(206,17,38,0.3)', border: '#CE1126', q: 1 as const },
  { labelKey: 'grades.hard', color: '#fb923c', bg: 'rgba(251,146,60,0.25)', border: '#fb923c', q: 2 as const },
  { labelKey: 'grades.good', color: '#FFDA00', bg: 'rgba(255,218,0,0.22)', border: '#FFDA00', q: 4 as const },
  { labelKey: 'grades.easy', color: '#10b981', bg: 'rgba(16,185,129,0.25)', border: '#10b981', q: 5 as const },
] as const;

type StudyMode = 'landing' | 'session';
type SearchRow = { deckId: string; deckName: string; card: FlashCard };

export default function StudyScreen() {
  const {
    ready,
    decks,
    activeDeck,
    getStudyBatch,
    recordAnswer,
    toggleFavorite,
    setActiveDeckId,
  } = useDeck();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const [mode, setMode] = useState<StudyMode>('landing');
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [resumeSession, setResumeSession] = useState<LastStudySession | undefined>(undefined);
  const [startCardId, setStartCardId] = useState<string | undefined>(undefined);
  const [seed, setSeed] = useState(0);
  const [activeRegion, setActiveRegion] = useState<RegionFilterId>('all');
  const [idx, setIdx] = useState(0);
  const [daily, setDaily] = useState({ count: 0, target: 10 });

  const allCards = useMemo<SearchRow[]>(
    () =>
      (decks || []).flatMap((deck) =>
        (deck.cards || []).map((card) => ({
          deckId: deck.id,
          deckName: getDeckDisplayName(deck),
          card,
        })),
      ),
    [decks],
  );

  const visibleCategories = useMemo(
    () => CATEGORY_DISPLAY.filter((cat) => getDecksForCategory(decks || [], cat.key).length > 0),
    [decks],
  );

  const searchResults = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];

    return allCards
      .filter((item) => {
        const haystack = [
          item.card.front,
          item.card.back,
          item.card.example,
          item.deckName,
          (item.card.tags || []).join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 80);
  }, [allCards, q]);

  const resumeDeck = useMemo(
    () => (resumeSession ? decks.find((deck) => deck.id === resumeSession.deckId) : undefined),
    [decks, resumeSession],
  );

  const rawBatch = useMemo(() => {
    void seed;
    return ready && activeDeck ? getStudyBatch(activeRegion === 'all' ? 15 : 100) : [];
  }, [ready, activeDeck, activeRegion, seed, getStudyBatch]);

  const batch = useMemo(() => {
    if (!activeDeck) return [];
    const filtered = rawBatch.filter((card) =>
      cardMatchesRegion(card, activeRegion, activeDeck.name),
    );
    if (!startCardId) return filtered.slice(0, 15);

    const preferredCard =
      activeDeck.cards.find(
        (card) =>
          card.id === startCardId && cardMatchesRegion(card, activeRegion, activeDeck.name),
      ) || filtered.find((card) => card.id === startCardId);

    if (!preferredCard) return filtered.slice(0, 15);

    return [
      preferredCard,
      ...filtered.filter((card) => card.id !== preferredCard.id),
    ].slice(0, 15);
  }, [activeDeck, activeRegion, rawBatch, startCardId]);

  const progress = daily.target > 0 ? Math.min(1, daily.count / daily.target) : 0;
  const remaining = Math.max(0, batch.length - idx);
  const card = batch[idx];

  // Honest per-card scheduling preview for each grade (what Anki does).
  const gradeIntervals = useMemo(() => {
    const labels: Partial<Record<1 | 2 | 4 | 5, string>> = {};
    if (!card) return labels;
    for (const g of GRADES) {
      labels[g.q] = formatIntervalShort(previewInterval(card, g.q));
    }
    return labels;
  }, [card]);
  const deckTitle = activeDeck ? getDeckDisplayName(activeDeck) : '';
  const showResults = searching && q.trim().length > 0;

  useEffect(() => {
    if (!ready) return undefined;
    let mounted = true;
    getLastStudySession().then((session) => {
      if (mounted) setResumeSession(session);
    });
    return () => {
      mounted = false;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready || !activeDeck || mode !== 'session') return undefined;
    let mounted = true;
    getDailyProgress().then((dp) => {
      if (mounted) setDaily({ count: dp.count, target: dp.target });
    });
    return () => {
      mounted = false;
    };
  }, [activeDeck, mode, ready]);

  function persistSession(deckId: string, cardId?: string) {
    const payload = cardId ? { deckId, cardId } : { deckId };
    void saveLastStudySession(payload).then(setResumeSession);
  }

  function startSession(deckId: string, cardId?: string) {
    setActiveDeckId(deckId);
    setStartCardId(cardId);
    setActiveRegion('all');
    setIdx(0);
    setMode('session');
    persistSession(deckId, cardId);
  }

  // Onboarding hands off with an autoStartDeckId param so the very first
  // session begins immediately instead of landing on the browse view.
  const autoStartDeckId = route.params?.autoStartDeckId;
  useEffect(() => {
    if (!ready || !autoStartDeckId) return;
    if (decks?.some((deck) => deck.id === autoStartDeckId)) {
      startSession(autoStartDeckId);
    }
    nav.setParams({ autoStartDeckId: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, autoStartDeckId]);

  function handleCategoryPress(catKey: CategoryKey) {
    const deck = getPreferredDeckForCategory(decks || [], catKey);
    if (deck) startSession(deck.id);
  }

  function changeRegion(region: RegionFilterId) {
    setActiveRegion(region);
    setIdx(0);
  }

  async function grade(qValue: 1 | 2 | 3 | 4 | 5) {
    const currentCard = batch[idx];
    if (!currentCard || !activeDeck) return;
    await recordAnswer(currentCard.id, qValue);
    const nextDP = await incrementDailyProgress(1);
    setDaily({ count: nextDP.count, target: nextDP.target });
    const savedSession = await saveLastStudySession({
      deckId: activeDeck.id,
      cardId: currentCard.id,
    });
    setResumeSession(savedSession);
    setIdx((prev) => {
      const next = prev + 1;
      if (next < batch.length) return next;
      setSeed((s) => s + 1);
      return 0;
    });
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.center}>
          <Text style={styles.loadingEmoji}>📖</Text>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeDeck) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.center}>
          <Text style={styles.noDeckEmoji}>🇨🇴</Text>
          <Text style={styles.noDeckTitle}>{t('study.noDeck.title')}</Text>
          <Text style={styles.noDeckSub}>{t('study.noDeck.sub')}</Text>
          <Pressable style={styles.goHomeBtn} onPress={() => nav.navigate('Home')}>
            <Text style={styles.goHomeBtnText}>{t('study.goHome')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === 'landing') {
    return (
      <SafeAreaView style={styles.wrap}>
        <ScrollView
          contentContainerStyle={styles.landingScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.landingHeader}>
            <Text style={styles.landingTitle}>{t('study.landing.title')}</Text>
          </View>

          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={q}
              onChangeText={(text) => {
                setQ(text);
                setSearching(true);
              }}
              onFocus={() => setSearching(true)}
              onBlur={() => {
                if (!q.trim()) setSearching(false);
              }}
              placeholder={t('browse.searchPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {q.length > 0 && (
              <Pressable onPress={() => {
                setQ('');
                setSearching(false);
              }}>
                <Text style={styles.clearBtn}>✕</Text>
              </Pressable>
            )}
          </View>

          {showResults ? (
            <>
              <Text style={styles.sectionTitle}>
                {t('browse.results', {
                  count: searchResults.length,
                  plural: searchResults.length === 1 ? '' : 's',
                })}
              </Text>
              {searchResults.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyEmoji}>🤔</Text>
                  <Text style={styles.emptyText}>{t('browse.emptySearch', { query: q })}</Text>
                </View>
              ) : (
                searchResults.map((item) => (
                  <Pressable
                    key={`${item.deckId}-${item.card.id}`}
                    style={styles.resultRow}
                    onPress={() => startSession(item.deckId, item.card.id)}
                  >
                    <View style={styles.resultLeft}>
                      <Text style={styles.resultFront}>{item.card.front}</Text>
                      <Text style={styles.resultBack}>{item.card.back}</Text>
                      {item.card.example ? (
                        <Text style={styles.resultExample}>"{item.card.example}"</Text>
                      ) : null}
                      <Text style={styles.resultMeta}>
                        {item.deckName}
                        {item.card.tags?.length
                          ? ` • ${item.card.tags.slice(0, 2).join(', ')}`
                          : ''}
                      </Text>
                    </View>
                    <Pressable style={styles.speakBtn} onPress={() => void speakCard(item.card)}>
                      <Text style={styles.speakIcon}>🔊</Text>
                    </Pressable>
                  </Pressable>
                ))
              )}
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('browse.categories')}</Text>
              </View>
              <View style={styles.catGrid}>
                {visibleCategories.map((cat) => (
                  <Pressable
                    key={cat.key}
                    style={[
                      styles.catCard,
                      { backgroundColor: cat.bg, borderColor: cat.color + '66' },
                    ]}
                    onPress={() => handleCategoryPress(cat.key)}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, { color: cat.color }]} numberOfLines={2}>
                      {t(cat.labelKey)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.resumeBlock}>
                <Text style={styles.sectionTitle}>{t('study.resume.title')}</Text>
                {resumeDeck ? (
                  <Pressable
                    style={styles.resumeCard}
                    onPress={() => startSession(resumeDeck.id, resumeSession?.cardId)}
                  >
                    <View style={styles.resumeTextBlock}>
                      <Text style={styles.resumeDeckName}>{getDeckDisplayName(resumeDeck)}</Text>
                      <Text style={styles.resumeDeckMeta}>
                        {resumeDeck.cards.length} {t('common.cards')}
                      </Text>
                    </View>
                    <Text style={styles.resumeCta}>{t('study.resume.cta')}</Text>
                  </Pressable>
                ) : (
                  <View style={styles.resumeEmptyCard}>
                    <Text style={styles.resumeEmptyText}>{t('study.resume.empty')}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.sessionHeader}>
        <Pressable style={styles.sessionBackBtn} onPress={() => setMode('landing')}>
          <Text style={styles.sessionBackText}>{t('study.session.back')}</Text>
        </Pressable>
        <View style={styles.sessionTitleBlock}>
          <Text style={styles.sessionEyebrow}>{t('tabs.study')}</Text>
          <View style={styles.deckTitleRow}>
            <Text style={styles.deckPillFlag}>🇨🇴</Text>
            <Text style={styles.deckTitle} numberOfLines={1}>{deckTitle}</Text>
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

      <View style={styles.swipeHints}>
        <Text style={styles.swipeHard}>{t('study.hint.hard')}</Text>
        <Text style={styles.swipeTap}>{t('study.hint.flip')}</Text>
        <Text style={styles.swipeEasy}>{t('study.hint.easy')}</Text>
      </View>

      {card ? (
        <View style={styles.cardArea}>
          <Flashcard key={card.id} card={card} onGrade={grade} />
          {isVerb(card) && <ConjugationPanel infinitive={card.front} />}
        </View>
      ) : (
        <View style={[styles.cardArea, styles.center]}>
          <Text style={{ fontSize: 48 }}>🎉</Text>
          <Text style={styles.noDeckTitle}>{t('study.caughtUp.title')}</Text>
          <Text style={styles.noDeckSub}>{t('study.caughtUp.sub')}</Text>
          <Pressable style={styles.quizCta} onPress={() => nav.navigate('Quiz')}>
            <Text style={styles.quizCtaText}>{t('study.takeQuiz')}</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.gradeBar}>
        <Text style={styles.gradeLabel}>{t('study.gradePrompt')}</Text>
        <View style={styles.gradeButtons}>
          {GRADES.map((g) => (
            <Pressable
              key={g.labelKey}
              style={[styles.gradeBtn, { backgroundColor: g.bg, borderColor: g.border }]}
              onPress={() => grade(g.q)}
              disabled={!card}
            >
              <Text style={[styles.gradeBtnLabel, { color: g.color }]}>{t(g.labelKey)}</Text>
              <Text style={[styles.gradeBtnInterval, { color: g.color + 'b3' }]}>
                {gradeIntervals[g.q] ?? ''}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 },

  loadingEmoji: { fontSize: 40 },
  loadingText: { color: colors.textSecondary, fontSize: 16 },

  noDeckEmoji: { fontSize: 48 },
  noDeckTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  noDeckSub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  goHomeBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.brand,
  },
  goHomeBtnText: { color: '#020617', fontWeight: '800', fontSize: 14 },

  landingScroll: { padding: 16, paddingBottom: 120 },
  landingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  landingTitle: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  clearBtn: { color: colors.textSecondary, fontSize: 14, paddingHorizontal: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catCard: {
    width: '31%',
    height: 80,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
  },
  catEmoji: { fontSize: 22 },
  catLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  resultLeft: { flex: 1, gap: 2 },
  resultFront: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  resultBack: { color: colors.textSecondary, fontSize: 13 },
  resultExample: {
    color: colors.textTertiary,
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 2,
  },
  resultMeta: { color: colors.textTertiary, fontSize: 11, marginTop: 4 },
  speakBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakIcon: { fontSize: 16 },
  resumeBlock: { gap: 10 },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  resumeTextBlock: { flex: 1, minWidth: 0 },
  resumeDeckName: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  resumeDeckMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
  resumeCta: { color: colors.brand, fontSize: 13, fontWeight: '900' },
  resumeEmptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  resumeEmptyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },

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

  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  sessionBackBtn: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  sessionBackText: { color: colors.brand, fontSize: 12, fontWeight: '900' },
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
  studyHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,218,0,0.12)',
    borderWidth: 1.5,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtnText: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  deckPillFlag: { fontSize: 17 },
  deckTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    flexShrink: 1,
  },
  cardsLeftPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,218,0,0.15)',
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  cardsLeftText: { color: colors.brand, fontSize: 13, fontWeight: '800' },

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
  quizCta: {
    marginTop: 6,
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  quizCtaText: { color: colors.textInverse, fontSize: 14, fontWeight: '900' },

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
  gradeBtnLabel: { fontSize: 14, fontWeight: '800' },
  gradeBtnInterval: { fontSize: 10 },
});
