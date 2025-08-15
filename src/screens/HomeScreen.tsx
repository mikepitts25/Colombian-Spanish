import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';

type CategoryKey = 'People' | 'Places' | 'Around the House' | 'Food & Drink' | 'Communication' | 'Health' | 'Nature & Weather' | 'Work & School' | 'Numbers & Dates' | 'Sports & Hobbies' | 'Tech' | 'Colombianisms' | 'Other';

export default function HomeScreen() {
  const { ready, decks, activeDeckId, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();

  // 🔧 FIX: call useMemo unconditionally so hook order never changes
  const sections = useMemo(() => groupIntoCategories(decks || []), [decks]);

  if (!ready) return <SafeAreaView style={styles.wrap}><Text style={styles.h1}>Cargando…</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Colombian Spanish 🇨🇴</Text>
      <Text style={styles.sub}>Pick a deck to study. Tap to activate — long-press to preview details.</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing(3) }}>
        {/* Colombianisms shortcut */}
        {sections.find(s => s.key === 'Colombianisms' && s.data.length > 0) ? (
          <Pressable style={styles.banner} onPress={() => {
            const slang = sections.find(s => s.key === 'Colombianisms')!.data[0];
            setActiveDeckId(slang.id); nav.navigate('Study');
          }}>
            <Text style={styles.bannerTitle}>🇨🇴 Slang & Colloquialisms</Text>
            <Text style={styles.bannerSub}>Real-life Spanish for Colombia</Text>
          </Pressable>
        ) : null}

        {sections.map(section => (
          <View key={section.key} style={{ marginBottom: spacing(2) }}>
            <Text style={styles.sectionTitle}>{section.key}</Text>
            <View style={styles.grid}>
              {section.data.map(deck => {
                const isActive = deck.id === activeDeckId;
                return (
                  <Pressable
                    key={deck.id}
                    style={[styles.tile, isActive && styles.tileActive]}
                    onPress={() => { setActiveDeckId(deck.id); nav.navigate('Study'); }}
                  >
                    <Text style={styles.tileTitle} numberOfLines={2}>{deck.name}</Text>
                    <Text style={styles.tileSub}>{deck.cards.length} cards</Text>
                    {isActive ? <Text style={styles.activeBadge}>Active</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function groupIntoCategories(decks: any[]) {
  const buckets: Record<CategoryKey, any[]> = {
    'People': [],
    'Places': [],
    'Around the House': [],
    'Food & Drink': [],
    'Communication': [],
    'Health': [],
    'Nature & Weather': [],
    'Work & School': [],
    'Numbers & Dates': [],
    'Sports & Hobbies': [],
    'Tech': [],
    'Colombianisms': [],
    'Other': []
  };

  for (const d of decks) {
    const name = (d.name || '').toLowerCase();
    const tags = (d.cards?.[0]?.tags || []).map((t: string) => (t || '').toLowerCase());
    const text = name + ' ' + tags.join(' ');

    if (/(slang|jerga|coloquial|colombia|colombianism)/.test(text)) buckets['Colombianisms'].push(d);
    else if (/(family|people|professions|body|emotions|relationships)/.test(text)) buckets['People'].push(d);
    else if (/(place|travel|transport|city|cali|bogotá|bogota|medellín|medellin)/.test(text)) buckets['Places'].push(d);
    else if (/(house|home|casa|kitchen|bathroom|around the house)/.test(text)) buckets['Around the House'].push(d);
    else if (/(food|drink|comida|bebida|restaurant|market)/.test(text)) buckets['Food & Drink'].push(d);
    else if (/(communicat|message|call|greeting|conversation|talk)/.test(text)) buckets['Communication'].push(d);
    else if (/(health|clinic|pharmacy|medicine|salud)/.test(text)) buckets['Health'].push(d);
    else if (/(weather|clima|nature|animals|outdoor)/.test(text)) buckets['Nature & Weather'].push(d);
    else if (/(work|job|school|study|professions|office)/.test(text)) buckets['Work & School'].push(d);
    else if (/(number|date|time|calendar|holidays)/.test(text)) buckets['Numbers & Dates'].push(d);
    else if (/(sport|hobby|music|games)/.test(text)) buckets['Sports & Hobbies'].push(d);
    else if (/(tech|technology|computer|phone|apps)/.test(text)) buckets['Tech'].push(d);
    else buckets['Other'].push(d);
  }

  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([key, data]) => ({ key, data }));
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: spacing(0.5) },
  sub: { color: colors.sub, marginBottom: spacing(2) },
  sectionTitle: { color: '#cbd5e1', fontWeight: '800', marginBottom: spacing(1) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '48%',
    backgroundColor: colors.card,
    padding: spacing(1.5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12
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
    fontWeight: '800'
  },
  banner: {
    backgroundColor: '#042f2e',
    padding: spacing(2),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#065f46',
    marginBottom: spacing(2)
  },
  bannerTitle: { color: '#a7f3d0', fontWeight: '900' },
  bannerSub: { color: '#6ee7b7' }
});