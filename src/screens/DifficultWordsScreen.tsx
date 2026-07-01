import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/theme';
import Flashcard from '../components/Flashcard';
import { useDeck } from '../hooks/useDeck';
import { selectDifficultCards } from '../utils/srs';
import { incrementDailyProgress } from '../storage/storage';
import { FlashCard } from '../types';
import { useLanguage } from '../context/LanguageContext';

const GRADES = [
  { labelKey: 'grades.again', interval: '<1d', color: '#f87171',  bg: 'rgba(206,17,38,0.3)',   border: '#CE1126', q: 1 as const },
  { labelKey: 'grades.hard',  interval: '1d',  color: '#fb923c',  bg: 'rgba(251,146,60,0.25)', border: '#fb923c', q: 2 as const },
  { labelKey: 'grades.good',  interval: '3d',  color: '#FFDA00',  bg: 'rgba(255,218,0,0.22)',  border: '#FFDA00', q: 4 as const },
  { labelKey: 'grades.easy',  interval: '7d',  color: '#10b981',  bg: 'rgba(16,185,129,0.25)', border: '#10b981', q: 5 as const },
] as const;

type DifficultRow = {
  deckId: string;
  deckName: string;
  card: FlashCard;
};

export default function DifficultWordsScreen() {
  const { ready, decks, recordAnswer } = useDeck();
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);

  const difficultRows = useMemo<DifficultRow[]>(() => {
    const rows = (decks || []).flatMap((deck) =>
      (deck.cards || []).map((card) => ({
        deckId: deck.id,
        deckName: deck.name,
        card,
      })),
    );
    const selectedCards = selectDifficultCards(rows.map((row) => row.card));
    const selectedIds = new Map(selectedCards.map((card, index) => [card.id, index]));

    return rows
      .filter((row) => selectedIds.has(row.card.id))
      .sort((a, b) => selectedIds.get(a.card.id)! - selectedIds.get(b.card.id)!);
  }, [decks]);

  const current = difficultRows[idx] ?? null;
  const count = difficultRows.length;

  async function grade(q: 1 | 2 | 3 | 4 | 5) {
    if (!current) return;
    await recordAnswer(current.card.id, q);
    await incrementDailyProgress(1);
    setIdx((prev) => Math.min(prev + 1, Math.max(0, count - 1)));
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>{t('difficult.emptyTitle')}</Text>
          <Text style={styles.emptySub}>{t('difficult.emptySub')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('difficult.title')}</Text>
          <Text style={styles.sub}>
            {t('difficult.count', {
              count,
              wordPlural: count === 1 ? '' : 's',
              adjectivePlural: count === 1 ? '' : 'es',
            })}
          </Text>
        </View>
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>{idx + 1}/{count}</Text>
        </View>
      </View>

      <View style={styles.deckPill}>
        <Text style={styles.deckPillText}>{current.deckName}</Text>
      </View>

      <View style={styles.cardArea}>
        <Flashcard key={current.card.id} card={current.card} onGrade={grade} />
      </View>

      <View style={styles.gradeBar}>
        <Text style={styles.gradeLabel}>{t('difficult.reviewPrompt')}</Text>
        <View style={styles.gradeButtons}>
          {GRADES.map((g) => (
            <Pressable
              key={g.labelKey}
              style={[styles.gradeBtn, { backgroundColor: g.bg, borderColor: g.border }]}
              onPress={() => grade(g.q)}
            >
              <Text style={[styles.gradeBtnLabel, { color: g.color }]}>{t(g.labelKey)}</Text>
              <Text style={[styles.gradeBtnInterval, { color: g.color + 'b3' }]}>{g.interval}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  loadingText: { color: colors.textSecondary, fontSize: 16 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '900' },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: '900' },
  sub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  counterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255,218,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.45)',
  },
  counterText: { color: colors.brand, fontSize: 13, fontWeight: '900' },
  deckPill: {
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.accentBlue,
  },
  deckPillText: { color: colors.textPrimary, fontSize: 12, fontWeight: '800' },
  cardArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },

  gradeBar: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,218,0,0.12)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  gradeLabel: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  gradeButtons: { flexDirection: 'row', gap: 8 },
  gradeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  gradeBtnLabel: { fontSize: 14, fontWeight: '800' },
  gradeBtnInterval: { fontSize: 10 },
});
