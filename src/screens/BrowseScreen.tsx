import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { speakCard } from '../services/tts';

type CategoryKey =
  | 'Colombianisms'
  | 'Essentials'
  | 'People & Relationships'
  | 'Places & Travel'
  | 'Home & Daily Life'
  | 'Food & Drink'
  | 'Communication'
  | 'Health'
  | 'Nature'
  | 'Work & School'
  | 'Numbers & Time'
  | 'Fun & Culture'
  | 'Tech'
  | 'Other';

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

function getCategoryForDeck(deck: any): CategoryKey {
  const name = (deck.name || '').toLowerCase();
  const tags = (deck.cards?.[0]?.tags || []).map((t: string) => t.toLowerCase());
  const text = name + ' ' + tags.join(' ');
  if (/(slang|jerga|coloquial|colombia|colombianism)/.test(text)) return 'Colombianisms';
  if (/(basic|intro|common|essential)/.test(text)) return 'Essentials';
  if (/(family|people|professions|body|emotions|relationships)/.test(text)) return 'People & Relationships';
  if (/(place|travel|transport|city|cali|bogotá|bogota|medellín|medellin)/.test(text)) return 'Places & Travel';
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

type Row = { deckId: string; deckName: string; card: any };

export default function BrowseScreen() {
  const { ready, decks, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);

  const allCards = useMemo<Row[]>(
    () =>
      (decks || []).flatMap((d) =>
        (d.cards || []).map((c: any) => ({ deckId: d.id, deckName: d.name, card: c })),
      ),
    [decks],
  );

  const visibleCategories = useMemo(
    () =>
      CATEGORY_DISPLAY.filter((cat) =>
        (decks || []).some((deck) => getCategoryForDeck(deck) === cat.key),
      ),
    [decks],
  );

  const trendingWords = useMemo(() => {
    const slangRows = allCards.filter((x) => {
      const text = `${(x.card.tags || []).join(' ')} ${x.deckName}`.toLowerCase();
      return /(slang|jerga|coloquial|colombia)/.test(text);
    });
    return slangRows.slice(0, 5);
  }, [allCards]);

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

  function handleCategoryPress(catKey: string) {
    const decksInCat = (decks || []).filter((d) => getCategoryForDeck(d) === catKey);
    if (decksInCat.length > 0) {
      setActiveDeckId(decksInCat[0].id);
      nav.navigate('Study');
    }
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingEmoji}>🔍</Text>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const showResults = searching && q.trim().length > 0;

  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('browse.title')}</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={q}
            onChangeText={(text) => { setQ(text); setSearching(true); }}
            onFocus={() => setSearching(true)}
            onBlur={() => { if (!q.trim()) setSearching(false); }}
            placeholder={t('browse.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {q.length > 0 && (
            <Pressable onPress={() => { setQ(''); setSearching(false); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>

        {showResults ? (
          /* ── SEARCH RESULTS ── */
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
                <View key={item.card.id} style={styles.resultRow}>
                  <View style={styles.resultLeft}>
                    <Text style={styles.resultFront}>{item.card.front}</Text>
                    <Text style={styles.resultBack}>{item.card.back}</Text>
                    {item.card.example ? (
                      <Text style={styles.resultExample}>"{item.card.example}"</Text>
                    ) : null}
                    <Text style={styles.resultMeta}>
                      {item.deckName}
                      {item.card.tags?.length ? ` • ${item.card.tags.slice(0, 2).join(', ')}` : ''}
                    </Text>
                  </View>
                  <Pressable style={styles.speakBtn} onPress={() => void speakCard(item.card)}>
                    <Text style={styles.speakIcon}>🔊</Text>
                  </Pressable>
                </View>
              ))
            )}
          </>
        ) : (
          /* ── BROWSE MODE ── */
          <>
            {/* Categories grid */}
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

            {/* Trending words */}
            <View style={[styles.sectionHeader, { marginTop: 8 }]}>
              <Text style={styles.sectionTitle}>{t('browse.wordsOfDay')}</Text>
              <Text style={styles.seeAll}>{t('browse.seeMore')}</Text>
            </View>
            {trendingWords.map((item, i) => (
              <View key={item.card.id} style={styles.trendRow}>
                <View style={[styles.trendRank, i === 0
                  ? { backgroundColor: 'rgba(255,218,0,0.12)', borderColor: '#FFDA00' }
                  : i === 1
                  ? { backgroundColor: 'rgba(0,56,147,0.15)', borderColor: '#003893' }
                  : { backgroundColor: 'rgba(206,17,38,0.12)', borderColor: '#CE1126' }
                ]}>
                  <Text style={[styles.trendRankText, {
                    color: i === 0 ? '#FFDA00' : i === 1 ? '#60a5fa' : '#f87171',
                  }]}>{i + 1}</Text>
                </View>
                <View style={styles.trendInfo}>
                  <Text style={styles.trendWord}>{item.card.front}</Text>
                  <Text style={styles.trendBack}>
                    {item.card.back}
                    {item.deckName ? ` • ${item.deckName}` : ''}
                  </Text>
                </View>
                <Pressable
                  style={styles.trendSpeakBtn}
                  onPress={() => void speakCard(item.card)}
                >
                  <Text>🔊</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 120 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingEmoji: { fontSize: 40 },
  loadingText: { color: colors.textSecondary, fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },

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
  seeAll: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },

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

  trendRow: {
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
  trendRank: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendRankText: { fontSize: 14, fontWeight: '800' },
  trendInfo: { flex: 1, gap: 2 },
  trendWord: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  trendBack: { color: colors.textSecondary, fontSize: 12 },
  trendSpeakBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
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
  resultExample: { color: colors.textTertiary, fontStyle: 'italic', fontSize: 12, marginTop: 2 },
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
});
