import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, FlatList, Pressable } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import * as Speech from 'expo-speech';

export default function PhrasebookScreen() {
  const { ready, decks, setActiveDeckId, toggleFavorite } = useDeck();
  const [q, setQ] = useState('');

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    const all = (decks || []).flatMap((d) =>
      (d.cards || []).map((c) => ({ deckId: d.id, deckName: d.name, card: c })),
    );
    const favs = all.filter((x) => !!x.card.favorite);
    if (!query) return favs;
    return favs.filter((x) => {
      const hay = [x.card.front, x.card.back, x.card.example, (x.card.tags || []).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });
  }, [decks, q]);

  function speak(text: string) {
    Speech.speak(text, { language: 'es-CO', pitch: 1.03, rate: 0.98 });
  }

  if (!ready)
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.h1}>Cargando…</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Phrasebook</Text>
      <Text style={styles.sub}>Your starred cards across all decks (offline + private).</Text>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search (es/en/tags)…"
        placeholderTextColor={colors.sub}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FlatList
        data={items}
        keyExtractor={(x) => x.card.id}
        contentContainerStyle={{ paddingBottom: spacing(3) }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.front}>{item.card.front}</Text>
              <Text style={styles.back}>{item.card.back}</Text>
              {item.card.example ? <Text style={styles.example}>“{item.card.example}”</Text> : null}
              <Text style={styles.meta}>
                {item.deckName}
                {item.card.tags?.length ? ` • ${item.card.tags.join(', ')}` : ''}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => {
                  setActiveDeckId(item.deckId);
                  speak(item.card.front);
                }}
              >
                <Text style={styles.actionText}>🔊</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => toggleFavorite(item.card.id)}>
                <Text style={styles.actionText}>★</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ marginTop: spacing(2) }}>
            <Text style={styles.empty}>No favorites yet.</Text>
            <Text style={styles.sub}>In Study, tap ★ to save a card here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  sub: { color: colors.sub, marginBottom: spacing(1.5) },
  search: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: spacing(1.25),
    color: colors.text,
    marginBottom: spacing(1.5),
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: spacing(1.25),
    marginBottom: 10,
  },
  front: { color: colors.text, fontWeight: '900', fontSize: 16 },
  back: { color: '#cbd5e1', marginTop: 2 },
  example: { color: colors.sub, marginTop: 6, fontStyle: 'italic' },
  meta: { color: colors.sub, marginTop: 8, fontSize: 12 },
  actions: { gap: 8, justifyContent: 'flex-start' },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  actionText: { color: colors.text, fontWeight: '900' },
  empty: { color: colors.text, fontWeight: '900', fontSize: 16 },
});
