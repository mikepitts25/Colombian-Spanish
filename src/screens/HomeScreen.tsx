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
import { colors, spacing, radius, typography } from '../styles/theme';
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

const CATEGORY_META: Record<CategoryKey, { emoji: string; color: string; bg: string }> = {
  'Colombianisms':        { emoji: '🇨🇴', color: '#FFDA00', bg: 'rgba(255,218,0,0.12)' },
  'Essentials':           { emoji: '⚡',  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  'People & Relationships': { emoji: '👥', color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  'Places & Travel':      { emoji: '🗺️',  color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  'Home & Daily Life':    { emoji: '🏠',  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  'Food & Drink':         { emoji: '🍳',  color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  'Communication':        { emoji: '💬',  color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  'Health':               { emoji: '❤️‍🩹', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  'Nature':               { emoji: '🌿',  color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  'Work & School':        { emoji: '💼',  color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  'Numbers & Time':       { emoji: '🕐',  color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  'Fun & Culture':        { emoji: '🎉',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  'Tech':                 { emoji: '💻',  color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  'Other':                { emoji: '📦',  color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
};

const COLOMBIAN_GREETINGS = [
  { text: '¡Buenos días!',   sub: 'Good morning — listo para aprender hoy?', emoji: '☀️' },
  { text: '¡Buenas tardes!', sub: 'Good afternoon — keep that racha alive!',  emoji: '🌤️' },
  { text: '¡Buenas noches!', sub: 'Good evening — una última ronda?',          emoji: '🌙' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return COLOMBIAN_GREETINGS[0];
  if (h < 19) return COLOMBIAN_GREETINGS[1];
  return COLOMBIAN_GREETINGS[2];
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const { ready, decks, activeDeckId, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  const greeting = useMemo(() => getGreeting(), []);
  const sections  = useMemo(() => groupIntoCategories(decks || []), [decks]);

  const endOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);

  const topDueDecks = useMemo(() => {
    return (decks || [])
      .map((d: any) => ({
        ...d,
        dueCount: (d.cards || []).filter((c: any) => (c?.due ?? 0) <= endOfToday).length,
      }))
      .filter((d: any) => d.dueCount > 0)
      .sort((a: any, b: any) => b.dueCount - a.dueCount)
      .slice(0, 8);
  }, [decks, endOfToday]);

  const totalCards = useMemo(
    () => (decks || []).reduce((s: number, d: any) => s + (d.cards?.length ?? 0), 0),
    [decks],
  );
  const totalDue = topDueDecks.reduce((s, d: any) => s + (d?.dueCount ?? 0), 0);

  const toggleCat = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenCats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingEmoji}>🇨🇴</Text>
          <Text style={styles.loadingText}>Cargando…</Text>
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>
                {greeting.emoji} {greeting.text}
              </Text>
              <Text style={styles.greetingSub}>{greeting.sub}</Text>
            </View>
            <Pressable
              style={styles.manageBtn}
              onPress={() => nav.navigate('ManageDecks')}
            >
              <Text style={styles.manageBtnText}>⚙️ Decks</Text>
            </Pressable>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statChip, { borderColor: 'rgba(255,218,0,0.4)' }]}>
              <Text style={styles.statEmoji}>📚</Text>
              <View>
                <Text style={styles.statValue}>{totalCards.toLocaleString()}</Text>
                <Text style={styles.statLabel}>tarjetas</Text>
              </View>
            </View>
            <View style={[styles.statChip, { borderColor: 'rgba(248,113,113,0.4)' }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <View>
                <Text style={[styles.statValue, { color: '#f87171' }]}>{totalDue}</Text>
                <Text style={styles.statLabel}>para hoy</Text>
              </View>
            </View>
            <View style={[styles.statChip, { borderColor: 'rgba(74,222,128,0.4)' }]}>
              <Text style={styles.statEmoji}>🇨🇴</Text>
              <View>
                <Text style={[styles.statValue, { color: '#4ade80' }]}>{(decks || []).length}</Text>
                <Text style={styles.statLabel}>decks</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── DUE TODAY ── */}
        {topDueDecks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Para estudiar hoy</Text>
              <View style={styles.dueTotalBadge}>
                <Text style={styles.dueTotalText}>{totalDue} cartas</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dueRow}
            >
              {topDueDecks.map((deck: any, i: number) => {
                const catKey = getCategoryForDeck(deck) as CategoryKey;
                const meta = CATEGORY_META[catKey] ?? CATEGORY_META['Other'];
                return (
                  <Pressable
                    key={deck.id}
                    style={[styles.dueTile, { borderColor: meta.color + '55' }]}
                    onPress={() => {
                      setActiveDeckId(deck.id);
                      nav.navigate('Study');
                    }}
                  >
                    <View style={[styles.dueBadge, { backgroundColor: meta.color }]}>
                      <Text style={styles.dueBadgeText}>{deck.dueCount}</Text>
                    </View>
                    <Text style={styles.dueEmoji}>{meta.emoji}</Text>
                    <Text style={styles.dueName} numberOfLines={2}>{deck.name}</Text>
                    <View style={styles.dueGoRow}>
                      <Text style={[styles.dueGo, { color: meta.color }]}>Estudiar →</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── CATEGORIES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📂 Todas las categorías</Text>
          {sections.map((section) => {
            const isOpen = !!openCats[section.key];
            const meta = CATEGORY_META[section.key as CategoryKey] ?? CATEGORY_META['Other'];
            return (
              <View key={section.key} style={styles.catBlock}>
                <Pressable
                  style={[styles.catTile, { borderLeftColor: meta.color, backgroundColor: isOpen ? meta.bg : colors.surfaceElevated }]}
                  onPress={() => toggleCat(section.key)}
                >
                  <View style={styles.catLeft}>
                    <Text style={styles.catEmoji}>{meta.emoji}</Text>
                    <View>
                      <Text style={styles.catTitle}>{section.key}</Text>
                      <Text style={styles.catSub}>{section.data.length} {section.data.length === 1 ? 'deck' : 'decks'}</Text>
                    </View>
                  </View>
                  <Text style={[styles.catChevron, isOpen && styles.catChevronOpen]}>›</Text>
                </Pressable>

                {isOpen && (
                  <View style={styles.grid}>
                    {section.data.map((deck: any) => {
                      const isActive = deck.id === activeDeckId;
                      const due = (deck.cards || []).filter((c: any) => (c?.due ?? 0) <= endOfToday).length;
                      return (
                        <Pressable
                          key={deck.id}
                          style={[
                            styles.deckTile,
                            isActive && { borderColor: meta.color, borderWidth: 2 },
                          ]}
                          onPress={() => {
                            setActiveDeckId(deck.id);
                            nav.navigate('Study');
                          }}
                        >
                          <View style={[styles.deckColorBar, { backgroundColor: meta.color }]} />
                          <View style={styles.deckBody}>
                            <Text style={styles.deckName} numberOfLines={2}>{deck.name}</Text>
                            <View style={styles.deckMetaRow}>
                              <Text style={styles.deckCardCount}>{deck.cards.length} cartas</Text>
                              {due > 0 && (
                                <View style={styles.deckDuePill}>
                                  <Text style={styles.deckDueText}>{due} hoy</Text>
                                </View>
                              )}
                            </View>
                            {isActive && (
                              <View style={[styles.activePill, { backgroundColor: meta.color + '33', borderColor: meta.color }]}>
                                <Text style={[styles.activeText, { color: meta.color }]}>✓ Activo</Text>
                              </View>
                            )}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <Text style={styles.footerFlag}>🇨🇴</Text>
          <Text style={styles.footerText}>¡Tú puedes! • You got this!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── helpers ───────────────────────────────────────────────────────────────

function getCategoryForDeck(deck: any): CategoryKey {
  const name = (deck.name || '').toLowerCase();
  const tags = (deck.cards?.[0]?.tags || []).map((t: string) => (t || '').toLowerCase());
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

function groupIntoCategories(decks: any[]) {
  const buckets: Record<CategoryKey, any[]> = {
    Colombianisms: [], Essentials: [], 'People & Relationships': [],
    'Places & Travel': [], 'Home & Daily Life': [], 'Food & Drink': [],
    Communication: [], Health: [], Nature: [], 'Work & School': [],
    'Numbers & Time': [], 'Fun & Culture': [], Tech: [], Other: [],
  };
  for (const d of decks) {
    buckets[getCategoryForDeck(d)].push(d);
  }
  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([key, data]) => ({ key, data }));
}

// ─── styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },

  // Loading
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingEmoji: { fontSize: 48 },
  loadingText: { color: colors.textSecondary, fontSize: typography.size.lg },

  // Flag stripe
  flagStripe: { flexDirection: 'row', height: 4 },
  flagBand: { height: 4 },

  scroll: { paddingBottom: spacing(4) },

  // Header
  header: {
    paddingHorizontal: spacing(2),
    paddingTop: spacing(2),
    paddingBottom: spacing(1.5),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: spacing(1.5),
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: typography.size['2xl'],
    fontWeight: '800',
    lineHeight: 30,
  },
  greetingSub: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    marginTop: 4,
  },
  manageBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.3)',
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  manageBtnText: { color: colors.textPrimary, fontWeight: '700', fontSize: 13 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statEmoji: { fontSize: 20 },
  statValue: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  statLabel: { color: colors.textSecondary, fontSize: 11 },

  // Sections
  section: { paddingHorizontal: spacing(2), marginTop: spacing(2) },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1.5),
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: '800',
  },
  dueTotalBadge: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  dueTotalText: { color: '#f87171', fontWeight: '700', fontSize: 12 },

  // Due Today tiles
  dueRow: { gap: 10, paddingRight: spacing(2) },
  dueTile: {
    width: 150,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    gap: 4,
  },
  dueBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginBottom: 4,
  },
  dueBadgeText: { color: '#0f172a', fontWeight: '900', fontSize: 12 },
  dueEmoji: { fontSize: 22, marginBottom: 2 },
  dueName: { color: colors.textPrimary, fontWeight: '700', fontSize: 13, flex: 1 },
  dueGoRow: { marginTop: 4 },
  dueGo: { fontWeight: '800', fontSize: 12 },

  // Categories
  catBlock: { marginBottom: spacing(1) },
  catTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing(1.5),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    borderLeftWidth: 4,
    marginBottom: 6,
  },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catEmoji: { fontSize: 26 },
  catTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  catSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  catChevron: {
    color: colors.textSecondary,
    fontSize: 24,
    fontWeight: '300',
    transform: [{ rotate: '0deg' }],
  },
  catChevronOpen: { transform: [{ rotate: '90deg' }] },

  // Deck grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  deckTile: {
    width: '47.5%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  deckColorBar: { height: 3, width: '100%' },
  deckBody: { padding: spacing(1.5) },
  deckName: { color: colors.textPrimary, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  deckMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  deckCardCount: { color: colors.textSecondary, fontSize: 11 },
  deckDuePill: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  deckDueText: { color: '#f87171', fontSize: 10, fontWeight: '700' },
  activePill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  activeText: { fontSize: 11, fontWeight: '700' },

  // Footer
  footer: { alignItems: 'center', paddingVertical: spacing(3), gap: 6 },
  footerFlag: { fontSize: 32 },
  footerText: { color: colors.textTertiary, fontSize: 13, fontStyle: 'italic' },
});
