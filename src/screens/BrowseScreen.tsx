import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { colors, spacing, radius } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import * as Speech from 'expo-speech';

type Row = { deckId: string; deckName: string; card: any };

export default function BrowseScreen() {
  const { ready, decks, setActiveDeckId } = useDeck();
  const [q, setQ] = useState('');
  const [deckFilter, setDeckFilter] = useState<string | 'all'>('all');
  const [showDropdown, setShowDropdown] = useState(false);

  const deckOptions = useMemo(
    () => [{ id: 'all', name: 'All Decks', count: decks?.reduce((sum, d) => sum + d.cards.length, 0) || 0 }]
      .concat(
        (decks || []).map((d) => ({
          id: d.id,
          name: d.name,
          count: d.cards.length,
        })),
      ),
    [decks],
  );

  const selectedDeckName = useMemo(
    () => deckOptions.find((d) => d.id === deckFilter)?.name || 'All Decks',
    [deckOptions, deckFilter],
  );

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base: Row[] = (decks || []).flatMap((d) =>
      (d.cards || []).map((c) => ({ deckId: d.id, deckName: d.name, card: c })),
    );
    const scoped = deckFilter === 'all' ? base : base.filter((x) => x.deckId === deckFilter);
    if (!query) return scoped.slice(0, 80);
    const hits = scoped.filter((x) => {
      const hay = [x.card.front, x.card.back, x.card.example, (x.card.tags || []).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });
    return hits.slice(0, 120);
  }, [decks, q, deckFilter]);

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
      <Text style={styles.h1}>Browse All Decks</Text>
      <Text style={styles.sub}>
        Search across {decks?.length || 0} decks with {decks?.reduce((s, d) => s + d.cards.length, 0) || 0} cards
      </Text>

      {/* Deck Dropdown */}
      <Pressable style={styles.dropdownTrigger} onPress={() => setShowDropdown(true)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dropdownLabel}>Filter by deck</Text>
          <Text style={styles.dropdownValue}>{selectedDeckName}</Text>
        </View>
        <Text style={styles.dropdownArrow}>▼</Text>
      </Pressable>

      {/* Search */}
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search cards..."
        placeholderTextColor={colors.sub}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {results.length} {results.length === 1 ? 'card' : 'cards'} found
      </Text>

      <FlatList
        data={results}
        keyExtractor={(x) => x.card.id}
        contentContainerStyle={{ paddingBottom: spacing(3) }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No cards found</Text>
            <Text style={styles.emptyText}>Try a different search term or deck filter</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.front}>{item.card.front}</Text>
              <Text style={styles.back}>{item.card.back}</Text>
              {item.card.example ? (
                <Text style={styles.example}>"{item.card.example}"</Text>
              ) : null}
              <Text style={styles.meta}>
                {item.deckName}
                {item.card.tags?.length ? ` • ${item.card.tags.join(', ')}` : ''}
              </Text>
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

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Deck</Text>
              <Pressable onPress={() => setShowDropdown(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {deckOptions.map((deck) => (
                <Pressable
                  key={deck.id}
                  style={[
                    styles.modalItem,
                    deckFilter === deck.id && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setDeckFilter(deck.id);
                    setShowDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      deckFilter === deck.id && styles.modalItemTextActive,
                    ]}
                  >
                    {deck.name}
                  </Text>
                  <Text
                    style={[
                      styles.modalItemCount,
                      deckFilter === deck.id && styles.modalItemTextActive,
                    ]}
                  >
                    {deck.count} cards
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  sub: { color: colors.textSecondary, marginBottom: spacing(1.5) },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(1.25),
    marginBottom: spacing(1),
  },
  dropdownLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  dropdownValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownArrow: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: spacing(1),
  },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(1.25),
    color: colors.textPrimary,
    marginBottom: spacing(1),
  },
  resultsCount: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing(1),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing(6),
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing(1),
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing(0.5),
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(1.25),
    marginBottom: 10,
  },
  front: { color: colors.textPrimary, fontWeight: '900', fontSize: 16 },
  back: { color: colors.textSecondary, marginTop: 2 },
  example: { color: colors.textTertiary, marginTop: 6, fontStyle: 'italic' },
  meta: { color: colors.textSecondary, marginTop: 8, fontSize: 12 },
  actions: { gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { color: colors.textPrimary, fontWeight: '900' },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    maxHeight: '70%',
    padding: spacing(2),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
    paddingBottom: spacing(1),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  modalClose: {
    color: colors.textSecondary,
    fontSize: 20,
    padding: spacing(1),
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(1.5),
    borderRadius: radius.md,
    marginBottom: 4,
  },
  modalItemActive: {
    backgroundColor: colors.info,
  },
  modalItemText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalItemTextActive: {
    color: 'white',
  },
  modalItemCount: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
