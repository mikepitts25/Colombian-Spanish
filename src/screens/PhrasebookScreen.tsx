import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Pressable,
} from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';

export default function PhrasebookScreen() {
  const { ready, decks, setActiveDeckId, toggleFavorite } = useDeck();
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    const all = (decks || []).flatMap((d) =>
      (d.cards || []).map((c) => ({
        deckId: d.id,
        deckName: d.name,
        card: c,
        savedAt: c.favoritedAt || c.createdAt || 0,
      })),
    );
    const favs = all.filter((x) => !!x.card.favorite);
    
    // Sort by most recently favorited
    favs.sort((a, b) => b.savedAt - a.savedAt);
    
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

  function handleStudy(cardDeckId: string) {
    setActiveDeckId(cardDeckId);
    nav.navigate('Study' as never);
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Phrasebook</Text>
        <Text style={styles.subtitle}>
          {items.length} {items.length === 1 ? 'phrase' : 'phrases'} saved
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search saved phrases..."
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

      {/* Results */}
      <FlatList
        data={items}
        keyExtractor={(x) => x.card.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.front}>{item.card.front}</Text>
              <Text style={styles.back}>{item.card.back}</Text>
              {item.card.example ? (
                <Text style={styles.example}>"{item.card.example}"</Text>
              ) : null}
              <View style={styles.tagsRow}>
                <Text style={styles.deckName}>{item.deckName}</Text>
                {item.card.tags?.length ? (
                  <Text style={styles.tags}>• {item.card.tags.slice(0, 3).join(', ')}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionBtn, styles.speakBtn]}
                onPress={() => {
                  setActiveDeckId(item.deckId);
                  speak(item.card.front);
                }}
              >
                <Text style={styles.actionText}>🔊</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.studyBtn]}
                onPress={() => handleStudy(item.deckId)}
              >
                <Text style={styles.actionText}>📚</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.unfavoriteBtn]}
                onPress={() => toggleFavorite(item.card.id)}
              >
                <Text style={styles.unfavoriteText}>★</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⭐</Text>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySub}>
              While studying, tap the ★ button to save phrases here for quick review.
            </Text>
            <Pressable style={styles.emptyButton} onPress={() => nav.navigate('Learn' as never)}>
              <Text style={styles.emptyButtonText}>Start Studying</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    textAlign: 'center',
    marginTop: spacing(4),
  },
  
  // Header
  header: {
    padding: spacing(2),
    paddingTop: spacing(3),
    paddingBottom: spacing(2),
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    marginTop: spacing(0.5),
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
    marginHorizontal: spacing(2),
    marginBottom: spacing(2),
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
  
  // List
  listContent: {
    padding: spacing(2),
    paddingTop: 0,
    paddingBottom: spacing(4),
  },
  
  // Card
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    marginBottom: spacing(1.5),
  },
  cardContent: {
    flex: 1,
  },
  front: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.lg,
  },
  back: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    marginTop: spacing(0.25),
  },
  example: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
    marginTop: spacing(1),
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing(1),
    flexWrap: 'wrap',
  },
  deckName: {
    color: colors.brand,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  tags: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    marginLeft: spacing(0.5),
  },
  
  // Actions
  actions: {
    gap: 8,
    justifyContent: 'flex-start',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  studyBtn: {
    backgroundColor: colors.brandMuted,
    borderWidth: 1,
    borderColor: colors.borderBrand,
  },
  unfavoriteBtn: {
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: colors.dangerMuted,
  },
  actionText: {
    fontSize: 18,
  },
  unfavoriteText: {
    color: colors.danger,
    fontWeight: typography.weight.bold,
    fontSize: 18,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing(8),
    paddingHorizontal: spacing(4),
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing(2),
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(1),
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    marginBottom: spacing(3),
  },
  emptyButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(3),
  },
  emptyButtonText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
});
