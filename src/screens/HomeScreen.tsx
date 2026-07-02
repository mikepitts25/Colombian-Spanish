import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Pressable, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import { getDailyProgress, getStudyStreak } from '../storage/storage';
import { Deck } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { speakCard } from '../services/tts';

const COLOMBIAN_GREETINGS = [
  { textKey: 'home.greeting.morning' as const, subKey: 'home.greeting.morningSub' as const, emoji: '☀️' },
  { textKey: 'home.greeting.afternoon' as const, subKey: 'home.greeting.afternoonSub' as const, emoji: '🌤️' },
  { textKey: 'home.greeting.night' as const, subKey: 'home.greeting.nightSub' as const, emoji: '🌙' },
];

function getGreetingKey() {
  const h = new Date().getHours();
  if (h < 12) return COLOMBIAN_GREETINGS[0];
  if (h < 19) return COLOMBIAN_GREETINGS[1];
  return COLOMBIAN_GREETINGS[2];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Colombianisms':          '#FFDA00',
  'Essentials':             '#60a5fa',
  'People & Relationships': '#f472b6',
  'Places & Travel':        '#34d399',
  'Home & Daily Life':      '#a78bfa',
  'Food & Drink':           '#fb923c',
  'Communication':          '#38bdf8',
  'Health':                 '#f87171',
  'Nature':                 '#4ade80',
  'Work & School':          '#94a3b8',
  'Numbers & Time':         '#c084fc',
  'Fun & Culture':          '#fbbf24',
  'Tech':                   '#22d3ee',
  'Other':                  '#64748b',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  'Colombianisms':          '🇨🇴',
  'Essentials':             '⚡',
  'People & Relationships': '👥',
  'Places & Travel':        '🗺️',
  'Home & Daily Life':      '🏠',
  'Food & Drink':           '🍳',
  'Communication':          '💬',
  'Health':                 '❤️‍🩹',
  'Nature':                 '🌿',
  'Work & School':          '💼',
  'Numbers & Time':         '🕐',
  'Fun & Culture':          '🎉',
  'Tech':                   '💻',
  'Other':                  '📦',
};

type DeckWithDue = Deck & {
  dueCount: number;
  cat: string;
};

type WordOfDayRow = {
  deckName: string;
  card: any;
};

function getCategoryForDeck(deck: Deck): string {
  const name = (deck.name || '').toLowerCase();
  const tags = (deck.cards?.[0]?.tags || []).map((t: string) => t.toLowerCase());
  const text = name + ' ' + tags.join(' ');
  if (/(slang|jerga|coloquial|colombia|colombianism)/.test(text)) return 'Colombianisms';
  if (/(basic|intro|common|essential)/.test(text)) return 'Essentials';
  if (/(family|people|professions|body|emotions|relationships)/.test(text)) return 'People & Relationships';
  if (/(place|travel|transport|city|cali|bogot|medell)/.test(text)) return 'Places & Travel';
  if (/(house|home|casa|kitchen|bathroom|daily)/.test(text)) return 'Home & Daily Life';
  if (/(food|drink|comida|bebida|restaurant|market)/.test(text)) return 'Food & Drink';
  if (/(communicat|message|call|greeting|conversation|talk)/.test(text)) return 'Communication';
  if (/(health|clinic|pharmacy|medicine|salud)/.test(text)) return 'Health';
  if (/(weather|clima|nature|animals|outdoor)/.test(text)) return 'Nature';
  if (/(work|job|school|study|professions|office)/.test(text)) return 'Work & School';
  if (/(number|date|time|calendar|holidays)/.test(text)) return 'Numbers & Time';
  if (/(sport|hobby|music|games|culture|art)/.test(text)) return 'Fun & Culture';
  if (/(tech|technology|computer|phone|apps)/.test(text)) return 'Tech';
  return 'Other';
}

export default function HomeScreen() {
  const { ready, decks, activeDeckId, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const greeting = useMemo(() => getGreetingKey(), []);
  const [streak, setStreak] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(10);

  useEffect(() => {
    Promise.all([getDailyProgress(), getStudyStreak()]).then(([dp, s]) => {
      setDailyCount(dp.count);
      setDailyTarget(dp.target);
      setStreak(s);
    });
  }, []);

  const endOfToday = useMemo(() => {
    const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime();
  }, []);

  const totalDue = useMemo(
    () => (decks || []).reduce(
      (s, d) => s + (d.cards || []).filter((c: any) => (c.due ?? 0) <= endOfToday).length, 0,
    ),
    [decks, endOfToday],
  );

  const quickDecks = useMemo<DeckWithDue[]>(() => {
    return (decks || [])
      .map((d) => ({
        ...d,
        dueCount: (d.cards || []).filter((c: any) => (c.due ?? 0) <= endOfToday).length,
        cat: getCategoryForDeck(d),
      }))
      .filter((d) => d.dueCount > 0)
      .sort((a, b) => b.dueCount - a.dueCount)
      .slice(0, 4);
  }, [decks, endOfToday]);

  const wordOfDay = useMemo<WordOfDayRow | undefined>(() => {
    const rows = (decks || []).flatMap((deck) =>
      (deck.cards || []).map((card: any) => ({ deckName: deck.name, card })),
    );

    return rows.find((row) => {
      const text = `${(row.card.tags || []).join(' ')} ${row.deckName}`.toLowerCase();
      return /(slang|jerga|coloquial|colombia)/.test(text);
    });
  }, [decks]);

  const dailyGoalProgress = dailyTarget > 0 ? Math.min(dailyCount / dailyTarget, 1) : 0;
  const dailyGoalLabel = dailyTarget > 0 ? `${Math.min(dailyCount, dailyTarget)}/${dailyTarget}` : `${dailyCount}`;
  const dueCardLabel = t('home.dueLabel', {
    count: totalDue.toLocaleString(),
    plural: totalDue === 1 ? '' : 's',
  });
  const dueCardSub = t(totalDue === 1 ? 'home.dueSubOne' : 'home.dueSubMany');

  const startStudy = (deckId?: string) => {
    if (deckId) setActiveDeckId(deckId);
    nav.navigate('Study');
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingFlag}>🇨🇴</Text>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      {/* Colombian flag stripe */}
      <View style={styles.flagStripe}>
        <View style={[styles.flagBand, { backgroundColor: '#FFDA00', flex: 2 }]} />
        <View style={[styles.flagBand, { backgroundColor: '#003893', flex: 1 }]} />
        <View style={[styles.flagBand, { backgroundColor: '#CE1126', flex: 1 }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.greetingWrap}>
            <Text style={styles.greeting}>{greeting.emoji} {t(greeting.textKey)}</Text>
            <Text style={styles.greetingSub}>{t(greeting.subKey)}</Text>
          </View>
          <Pressable style={styles.avatarBtn} onPress={() => nav.navigate('Settings')}>
            <Text style={styles.avatarText}>👤</Text>
          </Pressable>
        </View>

        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View>
              <Text style={styles.eyebrow}>{t('home.today')}</Text>
              <Text style={styles.todayTitle}>{dueCardLabel}</Text>
              <Text style={styles.todaySub}>{dueCardSub}</Text>
            </View>
            <View style={styles.streakPill}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>
          </View>

          <View style={styles.goalPanel}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalLabel}>{t('home.dailyGoal')}</Text>
              <Text style={styles.goalValue}>{dailyGoalLabel}</Text>
            </View>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: `${dailyGoalProgress * 100}%` }]} />
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => startStudy(quickDecks[0]?.id)}
          >
            <Text style={styles.primaryButtonText}>
              {totalDue > 0 ? t('home.studyDueCards') : t('home.studyAnyway')}
            </Text>
          </Pressable>
        </View>

        {wordOfDay ? (
          <View style={styles.wordCard}>
            <View style={styles.wordHeader}>
              <Text style={styles.wordEyebrow}>{t('home.wordOfDay')}</Text>
              <Pressable
                style={styles.wordAudioButton}
                onPress={() => void speakCard(wordOfDay.card)}
              >
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.tools')}</Text>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickAction} onPress={() => nav.navigate('Quiz')}>
              <Text style={styles.quickActionIcon}>🎯</Text>
              <Text style={styles.quickActionLabel}>{t('home.tool.quiz')}</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => nav.navigate('DifficultWords')}>
              <Text style={styles.quickActionIcon}>↻</Text>
              <Text style={styles.quickActionLabel}>{t('home.tool.difficult')}</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => nav.navigate('Phrasebook')}>
              <Text style={styles.quickActionIcon}>★</Text>
              <Text style={styles.quickActionLabel}>{t('home.tool.phrasebook')}</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => nav.navigate('AddCard')}>
              <Text style={styles.quickActionIcon}>＋</Text>
              <Text style={styles.quickActionLabel}>{t('home.tool.addCard')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t('home.dueDecks')}</Text>
              <Text style={styles.sectionSub}>
                {quickDecks.length > 0 ? t('home.dueDecksSub') : t('home.noDueDecksSub')}
              </Text>
            </View>
            <Pressable onPress={() => nav.navigate('Browse')}>
              <Text style={styles.browseLink}>{t('home.browseAllDecks')}</Text>
            </Pressable>
          </View>

          {quickDecks.length > 0 ? (
            <View style={styles.dueDeckList}>
              {quickDecks.map((deck) => {
                const color = CATEGORY_COLORS[deck.cat] ?? '#64748b';
                const emoji = CATEGORY_EMOJIS[deck.cat] ?? '📦';
                const isActive = deck.id === activeDeckId;
                return (
                  <Pressable
                    key={deck.id}
                    style={[styles.deckRow, isActive && { borderColor: color + '99' }]}
                    onPress={() => startStudy(deck.id)}
                  >
                    <View style={[styles.deckIconWrap, { backgroundColor: color + '20' }]}>
                      <Text style={styles.deckEmoji}>{emoji}</Text>
                    </View>
                    <View style={styles.deckInfo}>
                      <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
                      <Text style={styles.deckMeta}>
                        {t('addCard.cardCount', {
                          count: deck.cards.length,
                          plural: deck.cards.length === 1 ? '' : 's',
                        })}
                      </Text>
                    </View>
                    <View style={styles.duePill}>
                      <Text style={styles.duePillText}>
                        {t('home.dueLabel', {
                          count: deck.dueCount,
                          plural: deck.dueCount === 1 ? '' : 's',
                        })}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyDueState}>
              <Text style={styles.emptyTitle}>{t('home.allCaughtUp')}</Text>
              <Text style={styles.emptyText}>{t('home.emptyDueText')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingFlag: { fontSize: 48 },
  loadingText: { color: colors.textSecondary, fontSize: 16 },

  flagStripe: { flexDirection: 'row', height: 3 },
  flagBand: { height: 3 },

  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  greetingWrap: { flex: 1, gap: 3 },
  greeting: { color: colors.textPrimary, fontSize: 21, fontWeight: '800', lineHeight: 25 },
  greetingSub: { color: colors.textSecondary, fontSize: 13 },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFDA00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18 },

  todayCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  todayTitle: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
  },
  todaySub: { color: colors.textSecondary, fontSize: 13, marginTop: 1 },
  streakPill: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  goalPanel: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  goalValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  goalTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  goalFill: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '900',
  },

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

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
  },
  quickActionIcon: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: '800',
  },
  quickActionLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },

  section: { paddingHorizontal: 16, marginBottom: 18, gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  sectionSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  browseLink: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  dueDeckList: { gap: 8 },

  deckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
  },
  deckIconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  deckEmoji: { fontSize: 18 },
  deckInfo: { flex: 1, gap: 2 },
  deckName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  deckMeta: { color: colors.textSecondary, fontSize: 12 },
  duePill: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  duePillText: { color: '#f87171', fontSize: 11, fontWeight: '700' },
  emptyDueState: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '800' },
  emptyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },

});
