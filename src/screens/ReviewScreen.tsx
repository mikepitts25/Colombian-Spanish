import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { FlashCard } from '../types';

type CardRow = { deckId: string; deckName: string; card: FlashCard };
type ReviewFilter = 'all' | 'unreviewed' | 'flagged' | 'needs_native' | 'missing_example_en';

const REVIEW_FILTERS: { id: ReviewFilter; name: string }[] = [
  { id: 'all', name: 'All' },
  { id: 'unreviewed', name: 'Unreviewed' },
  { id: 'flagged', name: 'Flagged' },
  { id: 'needs_native', name: 'Needs Native' },
  { id: 'missing_example_en', name: 'Missing Example EN' },
];

function missingEnglishExample(card: FlashCard) {
  if (!card.example?.trim()) return true;
  const parts = card.example.split('|');
  return parts.length < 2 || !parts[1]?.trim();
}

function matchesReviewFilter(card: FlashCard, filter: ReviewFilter) {
  if (filter === 'all') return true;
  if (filter === 'unreviewed') return !card.reviewStatus || card.reviewStatus === 'unreviewed';
  if (filter === 'flagged') return !!card.flagged;
  if (filter === 'needs_native') return card.reviewStatus === 'needs_native';
  return missingEnglishExample(card);
}

export default function ReviewScreen() {
  const { ready, decks, updateCardReview } = useDeck();
  const nav = useNavigation<any>();

  const [deckFilter, setDeckFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [index, setIndex] = useState(0);
  const [draftBack, setDraftBack] = useState('');
  const [draftExample, setDraftExample] = useState('');

  const allCards = useMemo<CardRow[]>(() => {
    const source = deckFilter === 'all'
      ? (decks || [])
      : (decks || []).filter((deck) => deck.id === deckFilter);

    return source.flatMap((deck) =>
      (deck.cards || [])
        .filter((card) => matchesReviewFilter(card, reviewFilter))
        .map((card) => ({ deckId: deck.id, deckName: deck.name, card })),
    );
  }, [decks, deckFilter, reviewFilter]);

  const flaggedCount = useMemo(
    () => (decks || []).flatMap((deck) => deck.cards || []).filter((card) => card.flagged).length,
    [decks],
  );

  const deckOptions = useMemo(
    () => [{ id: 'all', name: 'All Decks' }, ...(decks || []).map((deck) => ({ id: deck.id, name: deck.name }))],
    [decks],
  );

  const current = allCards[index] ?? null;
  const total = allCards.length;
  const selectedDeckName = deckOptions.find((deck) => deck.id === deckFilter)?.name ?? 'All Decks';
  const selectedReviewFilterName = REVIEW_FILTERS.find((filter) => filter.id === reviewFilter)?.name ?? 'All';

  useEffect(() => {
    setDraftBack(current?.card.back ?? '');
    setDraftExample(current?.card.example ?? '');
  }, [current?.card.back, current?.card.example, current?.card.id]);

  useEffect(() => {
    if (index > 0 && index >= total) setIndex(Math.max(0, total - 1));
  }, [index, total]);

  function go(delta: number) {
    setIndex((value) => Math.max(0, Math.min(total - 1, value + delta)));
  }

  function goNext() {
    setIndex((value) => (value >= total - 1 ? value : value + 1));
  }

  function changeDeck(id: string) {
    setDeckFilter(id);
    setIndex(0);
  }

  function changeReviewFilter(id: ReviewFilter) {
    setReviewFilter(id);
    setIndex(0);
  }

  function speak() {
    if (current) Speech.speak(current.card.front, { language: 'es-CO', pitch: 1.03, rate: 0.92 });
  }

  function leaveReview() {
    if (nav.canGoBack()) {
      nav.goBack();
      return;
    }
    nav.navigate('ManageDecks');
  }

  async function saveReview(reviewStatus: 'reviewed' | 'needs_native') {
    if (!current) return;
    const example = draftExample.trim();
    await updateCardReview(current.card.id, {
      back: draftBack.trim(),
      example: example || undefined,
      flagged: reviewStatus === 'needs_native',
      reviewStatus,
      reviewedAt: Date.now(),
    });
    goNext();
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.h1}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerActions}>
              <Pressable style={styles.backBtn} onPress={leaveReview}>
                <Text style={styles.backBtnText}>‹ Back</Text>
              </Pressable>
              <Pressable
                style={[styles.flaggedBtn, flaggedCount > 0 && styles.flaggedBtnActive]}
                onPress={() => nav.navigate('Flagged')}
              >
                <Text style={styles.flaggedBtnText}>Flagged {flaggedCount}</Text>
              </Pressable>
            </View>
            <Text style={styles.h1}>Translation Review</Text>
            <Text style={styles.sub}>Edit translations, examples, and review status from one queue.</Text>
          </View>

          <View style={styles.filterBlock}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterLabel}>Deck</Text>
              <Text style={styles.filterValue} numberOfLines={1}>{selectedDeckName}</Text>
            </View>
            <ScrollView
              horizontal
              style={styles.filterScroller}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {deckOptions.map((deck) => (
                <Pressable
                  key={deck.id}
                  style={[styles.chip, deckFilter === deck.id && styles.chipActive]}
                  onPress={() => changeDeck(deck.id)}
                >
                  <Text
                    style={[styles.chipText, deckFilter === deck.id && styles.chipTextActive]}
                    numberOfLines={1}
                  >
                    {deck.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterBlock}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterLabel}>Queue</Text>
              <Text style={styles.filterValue} numberOfLines={1}>{selectedReviewFilterName}</Text>
            </View>
            <ScrollView
              horizontal
              style={styles.filterScroller}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {REVIEW_FILTERS.map((filter) => (
                <Pressable
                  key={filter.id}
                  style={[styles.chip, reviewFilter === filter.id && styles.reviewChipActive]}
                  onPress={() => changeReviewFilter(filter.id)}
                >
                  <Text
                    style={[styles.chipText, reviewFilter === filter.id && styles.chipTextActive]}
                    numberOfLines={1}
                  >
                    {filter.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.queueSummary}>
            <Text style={styles.queueSummaryLabel}>Current card</Text>
            <Text style={styles.progress}>
              {total > 0 ? `${index + 1} / ${total}` : '0 / 0'}
            </Text>
          </View>

          {current ? (
            <View style={[styles.card, current.card.flagged && styles.cardFlagged]}>
              <View style={styles.cardTopRow}>
                <View style={styles.deckBadge}>
                  <Text style={styles.deckBadgeText} numberOfLines={1}>{current.deckName}</Text>
                </View>
                {current.card.reviewStatus ? (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{current.card.reviewStatus.replace('_', ' ')}</Text>
                  </View>
                ) : null}
              </View>

              {current.card.flagged && (
                <View style={styles.flagBanner}>
                  <Text style={styles.flagBannerText}>Flagged for review</Text>
                </View>
              )}

              <View style={styles.wordRow}>
                <Text style={styles.spanish} selectable>{current.card.front}</Text>
                <Pressable style={styles.speakBtn} onPress={speak}>
                  <Text style={styles.speakBtnText}>Escuchar</Text>
                </Pressable>
              </View>

              {current.card.ipa ? (
                <Text style={styles.ipa} selectable>[{current.card.ipa}]</Text>
              ) : null}

              <Text style={styles.label}>English</Text>
              <TextInput
                style={styles.input}
                value={draftBack}
                onChangeText={setDraftBack}
                placeholder="English translation"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.label}>Example</Text>
              <TextInput
                style={[styles.input, styles.exampleInput]}
                value={draftExample}
                onChangeText={setDraftExample}
                placeholder="Example with English after |"
                placeholderTextColor="#64748b"
                multiline
              />

              {current.card.tags?.length ? (
                <View style={styles.tagsRow}>
                  {current.card.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No cards match this queue.</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.actionBar}>
          <View style={styles.controls}>
            <Pressable
              style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
              onPress={() => go(-1)}
              disabled={index === 0}
            >
              <Text style={styles.navBtnText}>Prev</Text>
            </Pressable>
            <Pressable style={styles.navBtn} onPress={goNext} disabled={!current}>
              <Text style={styles.navBtnText}>Skip</Text>
            </Pressable>
          </View>

          <View style={styles.reviewActions}>
            <Pressable
              style={[styles.actionBtn, styles.nativeBtn, !current && styles.actionBtnDisabled]}
              onPress={() => saveReview('needs_native')}
              disabled={!current}
            >
              <Text style={styles.actionBtnText}>Needs Native Check</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.saveBtn, !current && styles.actionBtnDisabled]}
              onPress={() => saveReview('reviewed')}
              disabled={!current}
            >
              <Text style={styles.actionBtnText}>Save & Next</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  keyboardWrap: { flex: 1 },
  content: { flex: 1 },
  contentBody: { padding: spacing(2), paddingBottom: spacing(2), gap: spacing(1.5) },
  header: { gap: spacing(1) },
  headerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  h1: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', marginBottom: 4 },
  sub: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },

  backBtn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#e2e8f0', fontWeight: '900', fontSize: 13 },

  flaggedBtn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flaggedBtnActive: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' },
  flaggedBtnText: { color: '#e2e8f0', fontWeight: '900', fontSize: 13 },

  filterBlock: {
    gap: 8,
    backgroundColor: '#070d1a',
    borderWidth: 1,
    borderColor: '#172033',
    borderRadius: 14,
    padding: 10,
  },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  filterLabel: { color: '#64748b', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  filterValue: { flex: 1, color: '#e2e8f0', fontSize: 12, fontWeight: '800', textAlign: 'right' },
  filterScroller: { flexGrow: 0, height: 38 },
  filterRow: { gap: 8, paddingRight: spacing(1), alignItems: 'center' },
  chip: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 999,
    minHeight: 34,
    maxWidth: 190,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  reviewChipActive: { backgroundColor: '#047857', borderColor: '#047857' },
  chipText: { color: '#cbd5e1', fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: 'white' },

  queueSummary: {
    backgroundColor: '#070d1a',
    borderWidth: 1,
    borderColor: '#172033',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueSummaryLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  progress: {
    color: '#e2e8f0',
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },

  card: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 14,
    padding: spacing(2),
    gap: spacing(1),
  },
  cardFlagged: { borderColor: '#ef4444', borderWidth: 2 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },

  flagBanner: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  flagBannerText: { color: '#f87171', fontWeight: '900', fontSize: 13 },

  deckBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  deckBadgeText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  statusBadge: {
    backgroundColor: '#052e2b',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusBadgeText: { color: '#99f6e4', fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },

  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spanish: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 38,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    color: '#f8fafc',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  exampleInput: {
    minHeight: 104,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  ipa: { color: '#64748b', fontSize: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tagText: { color: '#94a3b8', fontSize: 12 },

  speakBtn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  speakBtnText: { color: '#e2e8f0', fontWeight: '700' },

  empty: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 14,
    padding: spacing(2),
  },
  emptyText: { color: colors.textSecondary },

  actionBar: {
    borderTopWidth: 1,
    borderTopColor: '#172033',
    backgroundColor: '#020617',
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1.25),
    paddingBottom: spacing(1.5),
    gap: spacing(1),
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  navBtn: {
    flex: 1,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#e2e8f0', fontWeight: '900', fontSize: 13 },

  reviewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  actionBtnDisabled: { opacity: 0.45 },
  nativeBtn: { backgroundColor: '#7f1d1d' },
  saveBtn: { backgroundColor: '#1d4ed8' },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, textAlign: 'center' },
});
