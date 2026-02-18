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
import { colors, spacing, radius, typography } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';

type Row = { deckId: string; deckName: string; card: any };

export default function BrowseScreen() {
  const { ready, decks, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
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

  function handleStudyDeck(deckId: string) {
    setActiveDeckId(deckId);
    nav.navigate('Study' as never);
  }

  if (!ready)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Cargando…</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Browse</Text>
        <Text style={styles.subtitle}>
          {decks?.length || 0} decks • {decks?.reduce((s, d) => s + d.cards.length, 0) || 0} cards
        </Text>
      </View>

      <View style={styles.content}>
        {/* Search Bar - Prominent */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search cards, phrases, translations..."
            placeholderTextColor={colors.textTertiary}
            style={styles.search}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')} style={styles.clearBtn}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Filter Chips Row */}
        <View style={styles.filterRow}>
          <Pressable 
            style={[styles.filterChip, styles.filterChipActive]} 
            onPress={() => setShowDropdown(true)}
          >
            <Text style={styles.filterChipText}>📚 {selectedDeckName}</Text>
            <Text style={styles.filterChipArrow}>▼</Text>
          </Pressable>
          
          {q.length > 0 && (
            <View style={styles.resultsChip}>
              <Text style={styles.resultsChipText}>{results.length} results</Text>
            </View>
          )}
        </View>

        {/* Quick Deck Access */}
        {!q && deckFilter === 'all' && (
          <View style={styles.quickDecksSection}>
            <Text style={styles.sectionTitle}>Jump to Deck</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickDecksRow}
            >
              {(decks || []).slice(0, 8).map((deck) => (
                <Pressable
                  key={deck.id}
                  style={styles.quickDeckChip}
                  onPress={() => handleStudyDeck(deck.id)}
                >
                  <Text style={styles.quickDeckName} numberOfLines={1}>
                    {deck.name}
                  </Text>
                  <Text style={styles.quickDeckCount}>{deck.cards.length}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Results List */}
        <FlatList
          data={results}
          keyExtractor={(x) => x.card.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>
                {q ? 'No matches found' : 'Start searching'}
              </Text>
              <Text style={styles.emptyText}>
                {q 
                  ? `Try different keywords or clear your search`
                  : `Search for Spanish words, English translations, or phrases`
                }
              </Text>
              {q && (
                <Pressable style={styles.emptyAction} onPress={() => setQ('')}>
                  <Text style={styles.emptyActionText}>Clear search</Text>
                </Pressable>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable 
              style={styles.card}
              onPress={() => handleStudyDeck(item.deckId)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardMain}>
                  <Text style={styles.front}>{item.card.front}</Text>
                  <Text style={styles.back}>{item.card.back}</Text>
                  {item.card.example ? (
                    <Text style={styles.example}>{item.card.example}</Text>
                  ) : null}
                  <View style={styles.cardMeta}>
                    <Text style={styles.deckTag}>{item.deckName}</Text>
                    {item.card.tags?.map((tag: string) => (
                      <Text key={tag} style={styles.tag}>#{tag}</Text>
                    ))}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <Pressable 
                    style={styles.actionBtn} 
                    onPress={(e) => {
                      e.stopPropagation();
                      speak(item.card.front);
                    }}
                  >
                    <Text style={styles.actionBtnIcon}>🔊</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStudyDeck(item.deckId);
                    }}
                  >
                    <Text style={styles.actionBtnIcon}>→</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          )}
        />
      </View>

      {/* Deck Filter Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Deck</Text>
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
                  <View style={styles.modalItemInfo}>
                    <Text
                      style={[
                        styles.modalItemText,
                        deckFilter === deck.id && styles.modalItemTextActive,
                      ]}
                    >
                      {deck.id === 'all' ? '📚' : '🗂️'} {deck.name}
                    </Text>
                    <Text
                      style={[
                        styles.modalItemCount,
                        deckFilter === deck.id && styles.modalItemTextActive,
                      ]}
                    >
                      {deck.count} cards
                    </Text>
                  </View>
                  {deckFilter === deck.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
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
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    padding: spacing(3),
    paddingBottom: spacing(2),
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.extrabold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    marginTop: spacing(0.5),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing(2),
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(1.5),
    marginBottom: spacing(1.5),
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing(0.75),
  },
  search: {
    flex: 1,
    paddingVertical: spacing(1.25),
    color: colors.textPrimary,
    fontSize: typography.size.base,
  },
  clearBtn: {
    padding: spacing(0.5),
  },
  clearIcon: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  
  // Filter row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    marginBottom: spacing(1.5),
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: spacing(0.75),
    paddingHorizontal: spacing(1.5),
  },
  filterChipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandMuted,
  },
  filterChipText: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  filterChipArrow: {
    color: colors.textSecondary,
    fontSize: 10,
    marginLeft: spacing(0.5),
  },
  resultsChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(1),
  },
  resultsChipText: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
  },
  
  // Quick decks
  quickDecksSection: {
    marginBottom: spacing(2),
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginBottom: spacing(0.75),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickDecksRow: {
    gap: spacing(1),
    paddingRight: spacing(2),
  },
  quickDeckChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing(0.75),
    paddingHorizontal: spacing(1.25),
    gap: spacing(0.75),
  },
  quickDeckName: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    maxWidth: 120,
  },
  quickDeckCount: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing(0.5),
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  
  // List
  listContent: {
    paddingBottom: spacing(3),
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing(1),
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing(1.5),
  },
  cardMain: {
    flex: 1,
  },
  front: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.lg,
    marginBottom: spacing(0.25),
  },
  back: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
  },
  example: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
    fontStyle: 'italic',
    marginTop: spacing(0.5),
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(0.5),
    marginTop: spacing(0.75),
  },
  deckTag: {
    color: colors.brand,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  tag: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },
  cardActions: {
    justifyContent: 'center',
    gap: spacing(0.5),
    marginLeft: spacing(1),
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnIcon: {
    fontSize: 16,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing(8),
    paddingHorizontal: spacing(4),
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing(1.5),
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(0.5),
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    marginBottom: spacing(2),
  },
  emptyAction: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.lg,
  },
  emptyActionText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  
  // Modal
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
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing(1.5),
    borderRadius: radius.md,
    marginBottom: spacing(0.5),
  },
  modalItemActive: {
    backgroundColor: colors.brandMuted,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  modalItemTextActive: {
    color: colors.brand,
    fontWeight: typography.weight.bold,
  },
  modalItemCount: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  checkmark: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: typography.weight.bold,
  },
});
