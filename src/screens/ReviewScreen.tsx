import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';

type CardRow = { deckId: string; deckName: string; card: any };

export default function ReviewScreen() {
  const { ready, decks, flagCard } = useDeck();
  const nav = useNavigation<any>();

  const [deckFilter, setDeckFilter] = useState<string>('all');
  const [index, setIndex] = useState(0);

  const allCards = useMemo<CardRow[]>(() => {
    const source = deckFilter === 'all'
      ? (decks || [])
      : (decks || []).filter((d) => d.id === deckFilter);
    return source.flatMap((d) =>
      (d.cards || []).map((c: any) => ({ deckId: d.id, deckName: d.name, card: c })),
    );
  }, [decks, deckFilter]);

  const flaggedCount = useMemo(
    () => (decks || []).flatMap((d) => d.cards || []).filter((c: any) => c.flagged).length,
    [decks],
  );

  const deckOptions = useMemo(
    () => [{ id: 'all', name: 'All Decks' }, ...(decks || []).map((d) => ({ id: d.id, name: d.name }))],
    [decks],
  );

  const current = allCards[index] ?? null;
  const total = allCards.length;

  function go(delta: number) {
    setIndex((i) => Math.max(0, Math.min(total - 1, i + delta)));
  }

  function changeDeck(id: string) {
    setDeckFilter(id);
    setIndex(0);
  }

  function speak() {
    if (current) Speech.speak(current.card.front, { language: 'es-CO', pitch: 1.03, rate: 0.92 });
  }

  async function toggleFlag() {
    if (!current) return;
    await flagCard(current.card.id, !current.card.flagged);
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.h1}>Cargando…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Translation Review</Text>
          <Text style={styles.sub}>Flag cards that need a better translation.</Text>
        </View>
        <Pressable
          style={[styles.flaggedBtn, flaggedCount > 0 && styles.flaggedBtnActive]}
          onPress={() => nav.navigate('Flagged')}
        >
          <Text style={styles.flaggedBtnText}>🚩 {flaggedCount}</Text>
        </Pressable>
      </View>

      {/* Deck filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {deckOptions.map((d) => (
          <Pressable
            key={d.id}
            style={[styles.chip, deckFilter === d.id && styles.chipActive]}
            onPress={() => changeDeck(d.id)}
          >
            <Text
              style={[styles.chipText, deckFilter === d.id && styles.chipTextActive]}
              numberOfLines={1}
            >
              {d.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Progress */}
      {total > 0 && (
        <Text style={styles.progress}>
          {index + 1} / {total}
        </Text>
      )}

      {/* Card */}
      {current ? (
        <View style={[styles.card, current.card.flagged && styles.cardFlagged]}>
          {current.card.flagged && (
            <View style={styles.flagBanner}>
              <Text style={styles.flagBannerText}>🚩 Flagged for review</Text>
            </View>
          )}

          <View style={styles.deckBadge}>
            <Text style={styles.deckBadgeText}>{current.deckName}</Text>
          </View>

          <Text style={styles.spanish}>{current.card.front}</Text>
          <Text style={styles.english}>{current.card.back}</Text>

          {current.card.example ? (
            <Text style={styles.example}>"{current.card.example}"</Text>
          ) : null}

          {current.card.ipa ? (
            <Text style={styles.ipa}>[{current.card.ipa}]</Text>
          ) : null}

          {current.card.tags?.length ? (
            <View style={styles.tagsRow}>
              {current.card.tags.map((t: string) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Pressable style={styles.speakBtn} onPress={speak}>
            <Text style={styles.speakBtnText}>🔊 Escuchar</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No cards in this deck.</Text>
        </View>
      )}

      {/* Navigation + Flag */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
          onPress={() => go(-1)}
          disabled={index === 0}
        >
          <Text style={styles.navBtnText}>← Prev</Text>
        </Pressable>

        <Pressable
          style={[styles.flagBtn, current?.card.flagged && styles.flagBtnActive]}
          onPress={toggleFlag}
          disabled={!current}
        >
          <Text style={styles.flagBtnText}>
            {current?.card.flagged ? '🚩 Flagged' : '🏳 Flag'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.navBtn, index >= total - 1 && styles.navBtnDisabled]}
          onPress={() => go(1)}
          disabled={index >= total - 1}
        >
          <Text style={styles.navBtnText}>Next →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: spacing(1.5) },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 2 },
  sub: { color: colors.textSecondary, fontSize: 13 },

  flaggedBtn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flaggedBtnActive: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' },
  flaggedBtnText: { color: '#e2e8f0', fontWeight: '900', fontSize: 15 },

  filterRow: { gap: 8, paddingRight: spacing(2), marginBottom: spacing(1) },
  chip: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  chipText: { color: '#cbd5e1', fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: 'white' },

  progress: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing(1.5),
  },

  card: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    padding: spacing(2.5),
    marginBottom: spacing(2),
  },
  cardFlagged: { borderColor: '#ef4444', borderWidth: 2 },

  flagBanner: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing(1.5),
  },
  flagBannerText: { color: '#f87171', fontWeight: '900', fontSize: 13 },

  deckBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: spacing(2),
  },
  deckBadgeText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },

  spanish: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: spacing(1),
    lineHeight: 40,
  },
  english: { color: '#93c5fd', fontSize: 20, fontWeight: '700', marginBottom: spacing(1.5) },
  example: {
    color: '#64748b',
    fontStyle: 'italic',
    fontSize: 15,
    marginBottom: spacing(1.5),
    lineHeight: 22,
  },
  ipa: { color: '#475569', fontSize: 14, marginBottom: spacing(1) },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing(1.5) },
  tag: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tagText: { color: '#64748b', fontSize: 12 },

  speakBtn: {
    alignSelf: 'flex-start',
    marginTop: 'auto',
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  speakBtnText: { color: '#e2e8f0', fontWeight: '700' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textSecondary },

  controls: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  navBtn: {
    flex: 1,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#e2e8f0', fontWeight: '900' },

  flagBtn: {
    flex: 1.4,
    backgroundColor: '#0b1220',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  flagBtnActive: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: '#ef4444' },
  flagBtnText: { color: '#e2e8f0', fontWeight: '900', fontSize: 16 },
});
