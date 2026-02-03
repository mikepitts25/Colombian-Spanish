import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, FlatList, Pressable } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import * as Speech from 'expo-speech';

type Row = { deckId: string; deckName: string; card: any };

export default function BrowseScreen() {
  const { ready, decks, setActiveDeckId } = useDeck();
  const [q, setQ] = useState('');
  const [deckFilter, setDeckFilter] = useState<string | 'all'>('all');

  const deckOptions = useMemo(() => [{ id: 'all', name: 'All' } as any].concat((decks || []).map(d => ({ id: d.id, name: d.name }))), [decks]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base: Row[] = (decks || []).flatMap(d => (d.cards || []).map(c => ({ deckId: d.id, deckName: d.name, card: c })));
    const scoped = deckFilter === 'all' ? base : base.filter(x => x.deckId === deckFilter);
    if (!query) return scoped.slice(0, 80);
    const hits = scoped.filter(x => {
      const hay = [x.card.front, x.card.back, x.card.example, (x.card.tags || []).join(' ')].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(query);
    });
    return hits.slice(0, 120);
  }, [decks, q, deckFilter]);

  function speak(text: string) {
    Speech.speak(text, { language: 'es-CO', pitch: 1.03, rate: 0.98 });
  }

  if (!ready) return <SafeAreaView style={styles.wrap}><Text style={styles.h1}>Cargando…</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Browse</Text>
      <Text style={styles.sub}>Search across all cards (Spanish, English, tags, examples).</Text>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search…"
        placeholderTextColor={colors.sub}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.filtersRow}>
        {deckOptions.slice(0, 6).map((d: any) => (
          <Pressable
            key={d.id}
            style={[styles.chip, deckFilter === d.id && styles.chipActive]}
            onPress={() => setDeckFilter(d.id)}
          >
            <Text style={[styles.chipText, deckFilter === d.id && styles.chipTextActive]} numberOfLines={1}>{d.name}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={results}
        keyExtractor={(x) => x.card.id}
        contentContainerStyle={{ paddingBottom: spacing(3) }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.front}>{item.card.front}</Text>
              <Text style={styles.back}>{item.card.back}</Text>
              {item.card.example ? <Text style={styles.example}>“{item.card.example}”</Text> : null}
              <Text style={styles.meta}>{item.deckName}{item.card.tags?.length ? ` • ${item.card.tags.join(', ')}` : ''}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.iconBtn} onPress={() => speak(item.card.front)}>
                <Text style={styles.icon}>🔊</Text>
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={() => setActiveDeckId(item.deckId)}>
                <Text style={styles.icon}>→</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  sub: { color: colors.sub, marginBottom: spacing(1.25) },
  search: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1f2937', borderRadius: 12, padding: spacing(1.25), color: colors.text, marginBottom: spacing(1) },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing(1.25) },
  chip: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1f2937', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, maxWidth: 140 },
  chipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  chipText: { color: '#cbd5e1', fontWeight: '900' },
  chipTextActive: { color: 'white' },

  row: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: '#1f2937', borderRadius: 12, padding: spacing(1.25), marginBottom: 10 },
  front: { color: colors.text, fontWeight: '900', fontSize: 16 },
  back: { color: '#cbd5e1', marginTop: 2 },
  example: { color: colors.sub, marginTop: 6, fontStyle: 'italic' },
  meta: { color: colors.sub, marginTop: 8, fontSize: 12 },
  actions: { gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1f2937' },
  icon: { color: colors.text, fontWeight: '900' },
});
