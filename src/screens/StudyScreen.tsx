import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Pressable, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import Flashcard from '../components/Flashcard';
import { getDailyProgress, incrementDailyProgress } from '../storage/storage';
import ConjugationPanel from '../components/ConjugationPanel';
import { isVerb } from '../utils/verbUtils';
import {
  cardMatchesRegion,
  REGION_FILTERS,
  REGION_LABEL_KEYS,
  RegionFilterId,
} from '../utils/regions';
import { useLanguage } from '../context/LanguageContext';

const GRADES = [
  { labelKey: 'grades.again', interval: '<1d', color: '#f87171',  bg: 'rgba(206,17,38,0.3)',   border: '#CE1126', q: 1 as const },
  { labelKey: 'grades.hard',  interval: '1d',  color: '#fb923c',  bg: 'rgba(251,146,60,0.25)', border: '#fb923c', q: 2 as const },
  { labelKey: 'grades.good',  interval: '3d',  color: '#FFDA00',  bg: 'rgba(255,218,0,0.22)',  border: '#FFDA00', q: 4 as const },
  { labelKey: 'grades.easy',  interval: '7d',  color: '#10b981',  bg: 'rgba(16,185,129,0.25)', border: '#10b981', q: 5 as const },
] as const;

export default function StudyScreen() {
  const { ready, activeDeck, getStudyBatch, recordAnswer, toggleFavorite } = useDeck();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const [seed, setSeed] = useState(0);
  const [activeRegion, setActiveRegion] = useState<RegionFilterId>('all');

  const rawBatch = useMemo(() => {
    void seed;
    return ready && activeDeck ? getStudyBatch(activeRegion === 'all' ? 15 : 100) : [];
  }, [ready, activeDeck, activeRegion, seed, getStudyBatch]);

  const batch = useMemo(() => {
    if (!activeDeck) return [];
    return rawBatch
      .filter((card) => cardMatchesRegion(card, activeRegion, activeDeck.name))
      .slice(0, 15);
  }, [activeDeck, activeRegion, rawBatch]);

  const [idx, setIdx] = useState(0);
  const [daily, setDaily] = useState({ count: 0, target: 10 });

  useEffect(() => {
    if (!ready || !activeDeck) return undefined;
    let mounted = true;
    getDailyProgress().then((dp) => {
      if (mounted) setDaily({ count: dp.count, target: dp.target });
    });
    return () => {
      mounted = false;
    };
  }, [activeDeck, ready]);

  const progress = daily.target > 0 ? Math.min(1, daily.count / daily.target) : 0;
  const remaining = batch.length - idx;

  function changeRegion(region: RegionFilterId) {
    setActiveRegion(region);
    setIdx(0);
  }

  async function grade(q: 1 | 2 | 3 | 4 | 5) {
    const card = batch[idx];
    if (!card) return;
    await recordAnswer(card.id, q);
    const nextDP = await incrementDailyProgress(1);
    setDaily({ count: nextDP.count, target: nextDP.target });
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

  const card = batch[idx];

  return (
    <SafeAreaView style={styles.wrap}>
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

      {/* Swipe hints */}
      <View style={styles.swipeHints}>
        <Text style={styles.swipeHard}>{t('study.hint.hard')}</Text>
        <Text style={styles.swipeTap}>{t('study.hint.flip')}</Text>
        <Text style={styles.swipeEasy}>{t('study.hint.easy')}</Text>
      </View>

      {/* Card or empty state */}
      {card ? (
        <View style={styles.cardArea}>
          <Flashcard key={card.id} card={card} onGrade={grade} />

          {/* Dot indicators */}
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, idx % 3 === i && styles.dotActive]} />
            ))}
          </View>

          {/* Conjugation panel for verbs */}
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

      {/* Grade bar — fixed at bottom */}
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
              <Text style={[styles.gradeBtnInterval, { color: g.color + 'b3' }]}>{g.interval}</Text>
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

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  dotActive: { backgroundColor: colors.brand },

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
