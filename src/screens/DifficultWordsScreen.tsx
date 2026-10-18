import Pressable from '../components/ThemedPressable';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Flashcard from '../components/Flashcard';
import { useDeck } from '../hooks/useDeck';
import { selectDifficultCards, formatIntervalShort, previewInterval } from '../utils/srs';
import { createLearningSessionId } from '../storage/learningEvents';
import { AnswerAttempt, StaleGradeError } from '../storage/flashcardAnswer';
import { FlashCard } from '../types';
import { useLanguage } from '../context/LanguageContext';

const GRADES = [
  {
    labelKey: 'grades.again',
    color: '#f87171',
    bg: 'rgba(206,17,38,0.3)',
    border: '#CE1126',
    q: 1 as const,
  },
  {
    labelKey: 'grades.hard',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.25)',
    border: '#fb923c',
    q: 2 as const,
  },
  {
    labelKey: 'grades.good',
    color: '#FFDA00',
    bg: 'rgba(255,218,0,0.22)',
    border: '#FFDA00',
    q: 4 as const,
  },
  {
    labelKey: 'grades.easy',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.25)',
    border: '#10b981',
    q: 5 as const,
  },
] as const;

type DifficultRow = {
  deckId: string;
  deckName: string;
  card: FlashCard;
};

export default function DifficultWordsScreen() {
  const styles = useThemedStyles(makeStyles);
  const theme = useAppTheme();
  const grades = GRADES.map((grade) => {
    if (theme.id === 'classic') return grade;
    const { colors } = theme;
    const [color, bg] =
      grade.q === 1
        ? [colors.danger, colors.dangerMuted]
        : grade.q === 2
          ? [colors.warning, colors.warningMuted]
          : grade.q === 4
            ? [colors.success, colors.successMuted]
            : [colors.info, colors.infoMuted];
    return { ...grade, color, bg, border: color };
  });
  const { colors } = useAppTheme();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  const scroll = useRef<ScrollView>(null);
  const cardTop = useRef(0);
  const [gradeSaving, setGradeSaving] = useState(false);
  const { ready, decks, recordAnswer, reload } = useDeck();
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [queueIds, setQueueIds] = useState<string[] | null>(null);
  const grading = useRef(false);
  const pendingGrade = useRef<AnswerAttempt | undefined>(undefined);
  const sessionId = useRef(createLearningSessionId());
  const [gradeError, setGradeError] = useState<'save' | 'stale' | null>(null);

  const eligibleRows = useMemo<DifficultRow[]>(() => {
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

  if (ready && queueIds === null) setQueueIds(eligibleRows.map((row) => row.card.id));
  const byId = new Map(
    (decks || []).flatMap((deck) =>
      deck.cards.map((card) => [card.id, { card, deckId: deck.id, deckName: deck.name }] as const),
    ),
  );
  const difficultRows =
    queueIds === null
      ? eligibleRows
      : queueIds.flatMap((id) => {
          const row = byId.get(id);
          return row ? [row] : [];
        });
  const current = difficultRows[idx] ?? null;
  const count = difficultRows.length;

  useLayoutEffect(() => {
    if (idx > 0) scroll.current?.scrollTo({ y: cardTop.current, animated: false });
  }, [idx]);

  async function grade(q: 0 | 1 | 2 | 3 | 4 | 5) {
    if (!current || grading.current || gradeError === 'stale') return;
    grading.current = true;
    setGradeSaving(true);
    const attempt = pendingGrade.current ?? {
      attemptId: createLearningSessionId(),
      sessionId: sessionId.current,
      cardId: current.card.id,
      quality: q,
      context: {
        deckId: current.deckId,
        front: current.card.front,
        back: current.card.back,
        example: current.card.example,
      },
    };
    pendingGrade.current = attempt;
    try {
      await recordAnswer(attempt.cardId, attempt.quality, {
        attemptId: attempt.attemptId,
        sessionId: attempt.sessionId,
        context: attempt.context,
      });
      pendingGrade.current = undefined;
      setGradeError(null);
      setIdx((value) => value + 1);
    } catch (error) {
      if (error instanceof StaleGradeError) pendingGrade.current = undefined;
      setGradeError(error instanceof StaleGradeError ? 'stale' : 'save');
    } finally {
      grading.current = false;
      setGradeSaving(false);
    }
  }

  async function reloadStaleCards() {
    if (grading.current) return;
    grading.current = true;
    setGradeSaving(true);
    try {
      await reload({ requireFreshBudget: true });
      setQueueIds(null);
      setIdx(0);
      sessionId.current = createLearningSessionId();
      setGradeError(null);
    } catch {
      setGradeError('stale');
    } finally {
      grading.current = false;
      setGradeSaving(false);
    }
  }

  const gradeStatus = gradeError && (
    <View style={{ padding: 12, gap: 8 }}>
      <Text accessibilityRole="alert" style={{ color: colors.textPrimary }}>
        {t(gradeError === 'stale' ? 'practice.staleGrade' : 'practice.saveError')}
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={gradeSaving}
        style={{ minHeight: 48, minWidth: 48, justifyContent: 'center' }}
        onPress={
          gradeError === 'stale'
            ? reloadStaleCards
            : () => grade(pendingGrade.current?.quality ?? 1)
        }
      >
        <Text style={{ color: colors.brand }}>
          {t(gradeError === 'stale' ? 'practice.reloadCards' : 'practice.retrySave')}
        </Text>
      </Pressable>
    </View>
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <ScrollView contentContainerStyle={styles.center}>
          <View key={fontScale} style={styles.emptyContent}>
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={styles.wrap}>
        <ScrollView contentContainerStyle={styles.center}>
          <View key={fontScale} style={styles.emptyContent}>
            {gradeError === 'stale' ? (
              gradeStatus
            ) : (
              <>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyTitle}>{t('difficult.emptyTitle')}</Text>
                <Text style={styles.emptySub}>{t('difficult.emptySub')}</Text>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView ref={scroll} contentContainerStyle={styles.sessionContent}>
        <View key={`header-${fontScale}`} style={[styles.header, largeText && styles.stacked]}>
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
            <Text style={styles.counterText}>
              {idx + 1}/{count}
            </Text>
          </View>
        </View>

        <View testID="difficult-deck-badge" key={`deck-${fontScale}`} style={styles.deckPill}>
          <Text style={styles.deckPillText}>{current.deckName}</Text>
        </View>

        <View
          testID="difficult-card-area"
          style={styles.cardArea}
          onLayout={(event) => {
            cardTop.current = event.nativeEvent.layout.y;
          }}
        >
          <Flashcard key={current.card.id} card={current.card} onGrade={grade} expandForLargeText />
        </View>

        {gradeStatus}
        <View key={`grades-${fontScale}`} style={styles.gradeBar}>
          <Text style={styles.gradeLabel}>{t('difficult.reviewPrompt')}</Text>
          <View style={[styles.gradeButtons, largeText && styles.stacked]}>
            {grades.map((g) => (
              <Pressable
                key={g.labelKey}
                accessibilityRole="button"
                accessibilityState={{ disabled: !!gradeError || gradeSaving }}
                disabled={!!gradeError || gradeSaving}
                style={[
                  styles.gradeBtn,
                  largeText && styles.noFlex,
                  { backgroundColor: g.bg, borderColor: g.border },
                ]}
                onPress={() => grade(g.q)}
              >
                <Text style={[styles.gradeBtnLabel, { color: g.color }]}>{t(g.labelKey)}</Text>
                <Text
                  style={[
                    styles.gradeBtnInterval,
                    { color: theme.id === 'classic' ? g.color + 'b3' : g.color },
                  ]}
                >
                  {formatIntervalShort(previewInterval(current.card, g.q))}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, id }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    sessionContent: { flexGrow: 1 },
    stacked: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
    noFlex: { flex: 0 },
    emptyContent: { alignItems: 'center', gap: 10 },
    center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
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
      backgroundColor: colors.highlightWash,
      borderWidth: 1,
      borderColor: colors.highlightEdge,
    },
    counterText: { color: colors.brand, fontSize: 13, fontWeight: '900' },
    deckPill: {
      alignSelf: 'flex-start',
      marginHorizontal: 16,
      marginBottom: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: id === 'classic' ? colors.accentBlue : colors.tagSurface,
    },
    deckPillText: {
      color: id === 'classic' ? colors.textPrimary : colors.tagText,
      fontSize: 12,
      fontWeight: '800',
    },
    cardArea: { flexGrow: 1, flexShrink: 0, paddingHorizontal: 20, justifyContent: 'center' },

    gradeBar: {
      backgroundColor: colors.deepSurface,
      borderTopWidth: 1,
      borderTopColor: colors.highlightWash,
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
      minHeight: 48,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1.5,
    },
    gradeBtnLabel: { fontSize: 14, fontWeight: '800' },
    gradeBtnInterval: { fontSize: 10 },
  });
