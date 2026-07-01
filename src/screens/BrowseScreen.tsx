import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Speech from 'expo-speech';
import { colors } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import {
  cardMatchesRegion,
  REGION_FILTERS,
  REGION_LABEL_KEYS,
  RegionFilterId,
} from '../utils/regions';
import { useLanguage } from '../context/LanguageContext';

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
  { key: 'Food & Drink',       emoji: '🍺', labelKey: 'browse.category.food', color: '#fb923c', bg: 'rgba(251,146,60,0.12)'    },
  { key: 'Colombianisms',      emoji: '🇨🇴', labelKey: 'browse.category.colombianisms', color: '#FFDA00', bg: 'rgba(255,218,0,0.08)'   },
  { key: 'Work & School',      emoji: '💼', labelKey: 'browse.category.work', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)'   },
  { key: 'People & Relationships', emoji: '👨‍👩‍👧', labelKey: 'browse.category.people',  color: '#10b981', bg: 'rgba(16,185,129,0.12)'   },
  { key: 'Fun & Culture',      emoji: '🎵', labelKey: 'browse.category.culture', color: '#a855f7', bg: 'rgba(168,85,247,0.12)'   },
  { key: 'Places & Travel',    emoji: '🚌', labelKey: 'browse.category.travel', color: '#f97316', bg: 'rgba(249,115,22,0.12)'    },
] as const;

const FILTER_CHIPS = [
  { id: 'all',     labelKey: 'browse.filter.all' },
  { id: 'slang',   labelKey: 'browse.filter.slang' },
  { id: 'phrases', labelKey: 'browse.filter.phrases' },
  { id: 'basic',   labelKey: 'browse.filter.basic' },
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeRegion, setActiveRegion] = useState<RegionFilterId>('all');
  const [searching, setSearching] = useState(false);

  const allCards = useMemo<Row[]>(
    () =>
      (decks || []).flatMap((d) =>
        (d.cards || []).map((c: any) => ({ deckId: d.id, deckName: d.name, card: c })),
      ),
    [decks],
  );

  const trendingWords = useMemo(() => {
    const slangRows = allCards.filter((x) => {
      if (!cardMatchesRegion(x.card, activeRegion, x.deckName)) return false;
      const text = (x.card.tags || []).join(' ').toLowerCase() + x.deckName.toLowerCase();
      return /(slang|jerga|coloquial|colombia)/.test(text);
    });
    return slangRows.slice(0, 5);
  }, [allCards, activeRegion]);

  const searchResults = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const filtered = allCards
      .filter((x) => cardMatchesRegion(x.card, activeRegion, x.deckName))
      .filter((x) => {
        const text = (x.card.tags || []).join(' ').toLowerCase() + x.deckName.toLowerCase();
        if (activeFilter === 'slang') return /(slang|jerga|coloquial|colombia)/.test(text);
        if (activeFilter === 'phrases') return /(phrase|frase|expression|conversaci)/.test(text);
        if (activeFilter === 'basic') return /(basic|intro|common|essential)/.test(text);
        return true;
      });
    return filtered
      .filter((x) => {
        const hay = [x.card.front, x.card.back, x.card.example, (x.card.tags || []).join(' ')]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(query);
      })
      .slice(0, 80);
  }, [allCards, q, activeFilter, activeRegion]);

  function speak(text: string) {
    Speech.speak(text, { language: 'es-CO', pitch: 1.03, rate: 0.98 });
  }

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
          <View style={styles.filterPill}>
            <Text style={styles.filterPillText}>{t('browse.filters')}</Text>
          </View>
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

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          <View style={styles.chipsRow}>
            {FILTER_CHIPS.map((chip) => (
              <Pressable
                key={chip.id}
                style={[styles.chip, activeFilter === chip.id && styles.chipActive]}
                onPress={() => setActiveFilter(chip.id)}
              >
                <Text style={[styles.chipText, activeFilter === chip.id && styles.chipTextActive]}>
                  {t(chip.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionChipsScroll}>
          <View style={styles.chipsRow}>
            {REGION_FILTERS.map((region) => (
              <Pressable
                key={region.id}
                style={[styles.chip, activeRegion === region.id && styles.regionChipActive]}
                onPress={() => setActiveRegion(region.id)}
              >
                <Text style={[styles.chipText, activeRegion === region.id && styles.regionChipTextActive]}>
                  {t(REGION_LABEL_KEYS[region.id])}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

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
                  <Pressable style={styles.speakBtn} onPress={() => speak(item.card.front)}>
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
              <Text style={styles.seeAll}>{t('browse.seeAll')}</Text>
            </View>
            <View style={styles.catGrid}>
              {CATEGORY_DISPLAY.map((cat) => (
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
                  onPress={() => speak(item.card.front)}
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
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,218,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.4)',
  },
  filterPillText: { color: colors.brand, fontSize: 12, fontWeight: '700' },

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

  chipsScroll: { marginBottom: 20 },
  regionChipsScroll: { marginBottom: 20, marginTop: -10 },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  regionChipActive: { backgroundColor: '#047857', borderColor: '#047857' },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#020617', fontWeight: '800' },
  regionChipTextActive: { color: '#ffffff', fontWeight: '800' },

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
