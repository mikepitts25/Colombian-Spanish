import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';

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

// enable animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const { ready, decks, activeDeckId, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  const sections = useMemo(() => groupIntoCategories(decks || []), [decks]);

  // --- Smart section: Top Decks / Due Today ---
  // Calculate the end of today once per mount
  const endOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);

  // Compute due counts per deck, sort descending, take top N
  const topDueDecks = useMemo(() => {
    return (decks || [])
      .map((d: any) => ({
        ...d,
        dueCount: (d.cards || []).filter((c: any) => (c?.due ?? 0) <= endOfToday).length,
      }))
      .filter((d: any) => d.dueCount > 0)
      .sort((a: any, b: any) => b.dueCount - a.dueCount)
      .slice(0, 6);
  }, [decks, endOfToday]);

  const toggleCat = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenCats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!ready)
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.h1}>Cargando…</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Colombian Spanish 🇨🇴</Text>
          <Text style={styles.sub}>Pick a category to expand and study its decks.</Text>
        </View>
        <Pressable style={styles.manageBtn} onPress={() => nav.navigate('ManageDecks')}>
          <Text style={styles.manageText}>Manage</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing(3) }}>
        {/* Top Decks / Due Today */}
        {topDueDecks.length > 0 && (
          <View style={styles.dueWrap}>
            <View style={styles.dueHeaderRow}>
              <Text style={styles.dueTitle}>Due Today</Text>
              <Text style={styles.dueSub}>
                {topDueDecks.reduce((sum: number, d: any) => sum + (d?.dueCount ?? 0), 0)} cards
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dueRow}
            >
              {topDueDecks.map((deck: any) => (
                <Pressable
                  key={deck.id}
                  style={styles.dueTile}
                  onPress={() => {
                    setActiveDeckId(deck.id);
                    nav.navigate('Study');
                  }}
                >
                  <View style={styles.dueBadge}>
                    <Text style={styles.dueBadgeText}>{deck.dueCount}</Text>
                  </View>
                  <Text style={styles.dueName} numberOfLines={2}>
                    {deck.name}
                  </Text>
                  <Text style={styles.dueGo}>Study →</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
        {sections.map((section) => {
          const isOpen = !!openCats[section.key];
          return (
            <View key={section.key} style={styles.catBlock}>
              <Pressable style={styles.catTile} onPress={() => toggleCat(section.key)}>
                <Text style={styles.catTitle}>{section.key}</Text>
                <Text style={styles.catSub}>{section.data.length} decks</Text>
              </Pressable>
              {isOpen && (
                <View style={styles.grid}>
                  {section.data.map((deck) => {
                    const isActive = deck.id === activeDeckId;
                    return (
                      <Pressable
                        key={deck.id}
                        style={[styles.tile, isActive && styles.tileActive]}
                        onPress={() => {
                          setActiveDeckId(deck.id);
                          nav.navigate('Study');
                        }}
                      >
                        <Text style={styles.tileTitle} numberOfLines={2}>
                          {deck.name}
                        </Text>
                        <Text style={styles.tileSub}>{deck.cards.length} cards</Text>
                        {isActive ? <Text style={styles.activeBadge}>Active</Text> : null}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function groupIntoCategories(decks: any[]) {
  const buckets: Record<CategoryKey, any[]> = {
    Colombianisms: [],
    Essentials: [],
    'People & Relationships': [],
    'Places & Travel': [],
    'Home & Daily Life': [],
    'Food & Drink': [],
    Communication: [],
    Health: [],
    Nature: [],
    'Work & School': [],
    'Numbers & Time': [],
    'Fun & Culture': [],
    Tech: [],
    Other: [],
  };

  for (const d of decks) {
    const name = (d.name || '').toLowerCase();
    const tags = (d.cards?.[0]?.tags || []).map((t: string) => (t || '').toLowerCase());
    const text = name + ' ' + tags.join(' ');

    if (/(slang|jerga|coloquial|colombia|colombianism)/.test(text))
      buckets['Colombianisms'].push(d);
    else if (/(basic|intro|common|essential)/.test(text)) buckets['Essentials'].push(d);
    else if (/(family|people|professions|body|emotions|relationships)/.test(text))
      buckets['People & Relationships'].push(d);
    else if (/(place|travel|transport|city|cali|bogotá|bogota|medellín|medellin)/.test(text))
      buckets['Places & Travel'].push(d);
    else if (/(house|home|casa|kitchen|bathroom|daily)/.test(text))
      buckets['Home & Daily Life'].push(d);
    else if (/(food|drink|comida|bebida|restaurant|market)/.test(text))
      buckets['Food & Drink'].push(d);
    else if (/(communicat|message|call|greeting|conversation|talk)/.test(text))
      buckets['Communication'].push(d);
    else if (/(health|clinic|pharmacy|medicine|salud)/.test(text)) buckets['Health'].push(d);
    else if (/(weather|clima|nature|animals|outdoor)/.test(text)) buckets['Nature'].push(d);
    else if (/(work|job|school|study|professions|office)/.test(text))
      buckets['Work & School'].push(d);
    else if (/(number|date|time|calendar|holidays)/.test(text)) buckets['Numbers & Time'].push(d);
    else if (/(sport|hobby|music|games|culture|art)/.test(text)) buckets['Fun & Culture'].push(d);
    else if (/(tech|technology|computer|phone|apps)/.test(text)) buckets['Tech'].push(d);
    else buckets['Other'].push(d);
  }

  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([key, data]) => ({ key, data }));
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  manageBtn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: { color: '#e2e8f0', fontWeight: '900' },
  h1: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: spacing(0.5) },
  sub: { color: colors.sub, marginBottom: spacing(2) },
  catBlock: { marginBottom: spacing(2) },
  catTile: {
    backgroundColor: '#1e293b',
    padding: spacing(1.5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 6,
  },
  catTitle: { color: colors.text, fontWeight: '800', fontSize: 18 },
  catSub: { color: colors.sub },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  tile: {
    width: '48%',
    backgroundColor: colors.card,
    padding: spacing(1.5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12,
  },
  tileActive: { borderColor: colors.accent, borderWidth: 2 },
  tileTitle: { color: colors.text, fontWeight: '800' },
  tileSub: { color: colors.sub, marginTop: 2 },
  activeBadge: {
    marginTop: spacing(1),
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#0b1220',
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '800',
  },
  // Due Today section
  dueWrap: { marginBottom: spacing(2) },
  dueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  dueTitle: { color: '#e2e8f0', fontWeight: '900', fontSize: 18 },
  dueSub: { color: colors.sub, fontWeight: '700' },
  dueRow: { gap: 10 },
  dueTile: {
    width: 160,
    backgroundColor: '#0b1220',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing(1.25),
    marginRight: 10,
  },
  dueBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 6,
  },
  dueBadgeText: { color: 'white', fontWeight: '900' },
  dueName: { color: colors.text, fontWeight: '800', marginBottom: 6 },
  dueGo: { color: '#93c5fd', fontWeight: '800' },
});
