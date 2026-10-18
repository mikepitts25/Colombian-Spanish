import Pressable from '../components/ThemedPressable';
import ThemedTextInput from '../components/ThemedTextInput';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { speakCard } from '../services/tts';
import { FlashCard } from '../types';
import { useLanguage } from '../context/LanguageContext';

type CardRow = { deckId: string; deckName: string; card: FlashCard };
type ReviewSave = {
  row: CardRow;
  index: number;
  total: number;
  filter: ReviewFilter;
  patch: Pick<FlashCard, 'back' | 'example' | 'flagged' | 'reviewStatus' | 'reviewedAt'>;
};

const REVIEW_FILTERS = [
  { id: 'all', labelKey: 'review.all' },
  { id: 'unreviewed', labelKey: 'review.unreviewed' },
  { id: 'flagged', labelKey: 'review.flagged' },
  { id: 'needs_native', labelKey: 'review.needsNative' },
  { id: 'missing_example_en', labelKey: 'review.missingExampleEn' },
] as const;

type ReviewFilter = (typeof REVIEW_FILTERS)[number]['id'];

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
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = useThemedStyles(makeStyles);
  const { ready, decks, updateCardReview } = useDeck();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  // Fit Barrio’s 48pt chip and its 4pt focus ring on each side; preserve Classic sizing.
  const filterHeight = Math.ceil(
    Math.max(theme.id === 'barrio' ? 56 : 38, 38 * Math.max(1, fontScale)),
  );

  const [deckFilter, setDeckFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [index, setIndex] = useState(0);
  const [draftBack, setDraftBack] = useState('');
  const [draftExample, setDraftExample] = useState('');
  const [pendingSave, setPendingSave] = useState<ReviewSave | null>(null);
  const pending = useRef<ReviewSave | null>(null);
  const content = useRef<ScrollView>(null);
  const saving = useRef(false);
  const mounted = useRef(true);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const blocked = pendingSave !== null;
  usePreventRemove(blocked, () => {});
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const allCards = useMemo<CardRow[]>(() => {
    const source =
      deckFilter === 'all' ? decks || [] : (decks || []).filter((deck) => deck.id === deckFilter);

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
    () => [
      { id: 'all', name: t('review.allDecks') },
      ...(decks || []).map((deck) => ({ id: deck.id, name: deck.name })),
    ],
    [decks, t],
  );

  const current = pendingSave?.row ?? allCards[index] ?? null;
  const total = allCards.length;
  const selectedDeckName =
    deckOptions.find((deck) => deck.id === deckFilter)?.name ?? t('review.allDecks');
  const selectedReviewFilterName = t(
    REVIEW_FILTERS.find((filter) => filter.id === reviewFilter)?.labelKey ?? 'review.all',
  );

  const editorKey = JSON.stringify([current?.card.id, current?.card.back, current?.card.example]);
  const [previousEditorKey, setPreviousEditorKey] = useState<string | null>(null);
  if (!pendingSave && editorKey !== previousEditorKey) {
    setPreviousEditorKey(editorKey);
    setDraftBack(current?.card.back ?? '');
    setDraftExample(current?.card.example ?? '');
  }

  if (!pendingSave && index > 0 && index >= total) setIndex(Math.max(0, total - 1));

  function go(delta: number) {
    if (pending.current) return;
    setIndex((value) => Math.max(0, Math.min(total - 1, value + delta)));
  }

  function goNext() {
    if (pending.current) return;
    setIndex((value) => (value >= total - 1 ? value : value + 1));
  }

  function changeDeck(id: string) {
    if (pending.current) return;
    setDeckFilter(id);
    setIndex(0);
  }

  function changeReviewFilter(id: ReviewFilter) {
    if (pending.current) return;
    setReviewFilter(id);
    setIndex(0);
  }

  function speak() {
    if (current) void speakCard(current.card);
  }

  function leaveReview() {
    if (pending.current) return;
    if (nav.canGoBack()) {
      nav.goBack();
      return;
    }
    nav.navigate('ManageDecks', undefined, { pop: true });
  }

  async function persistReview(attempt: ReviewSave) {
    if (saving.current) return;
    saving.current = true;
    setSaveBusy(true);
    setSaveError(false);
    try {
      await updateCardReview(attempt.row.card.id, attempt.patch);
      if (!mounted.current) return;
      const retained = matchesReviewFilter(
        { ...attempt.row.card, ...attempt.patch },
        attempt.filter,
      );
      setIndex(retained ? Math.min(attempt.total - 1, attempt.index + 1) : attempt.index);
      pending.current = null;
      setPendingSave(null);
      content.current?.scrollTo({ y: 0, animated: false });
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      saving.current = false;
      if (mounted.current) setSaveBusy(false);
    }
  }

  function saveReview(reviewStatus: 'reviewed' | 'needs_native') {
    if (!current || pending.current) return;
    const attempt: ReviewSave = {
      row: current,
      index,
      total,
      filter: reviewFilter,
      patch: {
        back: draftBack.trim(),
        example: draftExample.trim() || undefined,
        flagged: reviewStatus === 'needs_native',
        reviewStatus,
        reviewedAt: Date.now(),
      },
    };
    pending.current = attempt;
    setPendingSave(attempt);
    void persistReview(attempt);
  }

  const actions = (
    <View style={styles.actionBar}>
      <View style={[styles.controls, largeText && styles.stacked]}>
        <Pressable
          style={[
            styles.navBtn,
            largeText && styles.fullWidth,
            (blocked || index === 0) && styles.navBtnDisabled,
          ]}
          onPress={() => go(-1)}
          disabled={blocked || index === 0}
        >
          <Text style={styles.navBtnText}>{t('review.prev')}</Text>
        </Pressable>
        <Pressable
          style={[styles.navBtn, largeText && styles.fullWidth, blocked && styles.controlDisabled]}
          onPress={goNext}
          disabled={blocked || !current}
        >
          <Text style={styles.navBtnText}>{t('review.skip')}</Text>
        </Pressable>
      </View>

      <View style={[styles.reviewActions, largeText && styles.stacked]}>
        <Pressable
          style={[
            styles.actionBtn,
            largeText && styles.fullWidth,
            styles.nativeBtn,
            (blocked || !current) && styles.actionBtnDisabled,
          ]}
          onPress={() => saveReview('needs_native')}
          disabled={blocked || !current}
        >
          <Text style={styles.actionBtnText}>{t('review.needsNativeCheck')}</Text>
        </Pressable>
        <Pressable
          style={[
            styles.actionBtn,
            largeText && styles.fullWidth,
            styles.saveBtn,
            (blocked || !current) && styles.actionBtnDisabled,
          ]}
          onPress={() => saveReview('reviewed')}
          disabled={blocked || !current}
        >
          <Text style={styles.actionBtnText}>{t('review.saveNext')}</Text>
        </Pressable>
      </View>
    </View>
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.h1}>{t('common.loading')}</Text>
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
          key={fontScale}
          ref={content}
          onContentSizeChange={() => {
            if (saveError) content.current?.scrollTo({ y: 0, animated: false });
          }}
          style={styles.content}
          contentContainerStyle={styles.contentBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {saveBusy && (
            <Text accessibilityLiveRegion="polite" style={styles.sub}>
              {t('review.saving')}
            </Text>
          )}
          {saveError && (
            <View>
              <Text accessibilityRole="alert" style={styles.sub}>
                {t('review.saveError')}
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={saveBusy}
                onPress={() => {
                  if (pending.current) void persistReview(pending.current);
                }}
              >
                <Text style={styles.saveRetry}>{t('practice.retrySave')}</Text>
              </Pressable>
            </View>
          )}
          <View style={styles.header}>
            <View style={[styles.headerActions, largeText && styles.stacked]}>
              <Pressable
                style={[styles.backBtn, blocked && styles.controlDisabled]}
                onPress={leaveReview}
                disabled={blocked}
              >
                <Text style={styles.backBtnText}>{t('review.back')}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.flaggedBtn,
                  flaggedCount > 0 && styles.flaggedBtnActive,
                  blocked && styles.controlDisabled,
                ]}
                disabled={blocked}
                onPress={() => {
                  if (!pending.current) nav.navigate('Flagged');
                }}
              >
                <Text style={styles.flaggedBtnText}>
                  {t('review.flaggedCount', { count: flaggedCount })}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.h1}>{t('review.title')}</Text>
            <Text style={styles.sub}>{t('review.sub')}</Text>
          </View>

          <View style={styles.filterBlock}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterLabel}>{t('review.deck')}</Text>
              <Text style={styles.filterValue} numberOfLines={1}>
                {selectedDeckName}
              </Text>
            </View>
            <ScrollView
              horizontal
              style={[styles.filterScroller, { height: filterHeight }]}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {deckOptions.map((deck) => (
                <Pressable
                  key={deck.id}
                  style={[
                    styles.chip,
                    deckFilter === deck.id && styles.chipActive,
                    blocked && styles.controlDisabled,
                  ]}
                  disabled={blocked}
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
              <Text style={styles.filterLabel}>{t('review.queue')}</Text>
              <Text style={styles.filterValue} numberOfLines={1}>
                {selectedReviewFilterName}
              </Text>
            </View>
            <ScrollView
              horizontal
              style={[styles.filterScroller, { height: filterHeight }]}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {REVIEW_FILTERS.map((filter) => (
                <Pressable
                  key={filter.id}
                  style={[
                    styles.chip,
                    reviewFilter === filter.id && styles.reviewChipActive,
                    blocked && styles.controlDisabled,
                  ]}
                  disabled={blocked}
                  onPress={() => changeReviewFilter(filter.id)}
                >
                  <Text
                    style={[styles.chipText, reviewFilter === filter.id && styles.chipTextActive]}
                    numberOfLines={1}
                  >
                    {t(filter.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.queueSummary, largeText && styles.stacked]}>
            <Text style={styles.queueSummaryLabel}>{t('review.currentCard')}</Text>
            <Text style={styles.progress}>{total > 0 ? `${index + 1} / ${total}` : '0 / 0'}</Text>
          </View>

          {current ? (
            <View style={[styles.card, current.card.flagged && styles.cardFlagged]}>
              <View style={[styles.cardTopRow, largeText && styles.stacked]}>
                <View style={styles.deckBadge}>
                  <Text style={styles.deckBadgeText} numberOfLines={1}>
                    {current.deckName}
                  </Text>
                </View>
                {current.card.reviewStatus ? (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {current.card.reviewStatus.replace('_', ' ')}
                    </Text>
                  </View>
                ) : null}
              </View>

              {current.card.flagged && (
                <View style={styles.flagBanner}>
                  <Text style={styles.flagBannerText}>{t('review.flaggedBanner')}</Text>
                </View>
              )}

              <View style={[styles.wordRow, largeText && styles.stacked]}>
                <Text style={[styles.spanish, largeText && styles.fullWidth]} selectable>
                  {current.card.front}
                </Text>
                <Pressable style={styles.speakBtn} onPress={speak}>
                  <Text style={styles.speakBtnText}>{t('common.listen')}</Text>
                </Pressable>
              </View>

              {current.card.ipa ? (
                <Text style={styles.ipa} selectable>
                  [{current.card.ipa}]
                </Text>
              ) : null}

              <Text style={styles.label}>{t('review.english')}</Text>
              <ThemedTextInput
                style={styles.input}
                multiline={largeText}
                value={draftBack}
                editable={!blocked}
                onChangeText={(value) => {
                  if (!pending.current) setDraftBack(value);
                }}
                placeholder={t('review.englishPlaceholder')}
                placeholderTextColor={colors.mutedInk}
              />

              <Text style={styles.label}>{t('review.example')}</Text>
              <ThemedTextInput
                style={[styles.input, styles.exampleInput]}
                value={draftExample}
                editable={!blocked}
                onChangeText={(value) => {
                  if (!pending.current) setDraftExample(value);
                }}
                placeholder={t('review.examplePlaceholder')}
                placeholderTextColor={colors.mutedInk}
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
              <Text style={styles.emptyText}>{t('review.empty')}</Text>
            </View>
          )}
          {largeText && actions}
        </ScrollView>

        {!largeText && actions}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    stacked: { flexDirection: 'column', alignItems: 'stretch' },
    fullWidth: { flex: 0, width: '100%' },
    controlDisabled: { opacity: 0.45 },
    saveRetry: { color: colors.brand, fontWeight: '700', paddingVertical: 12 },
    keyboardWrap: { flex: 1 },
    content: { flex: 1 },
    contentBody: { padding: spacing(2), paddingBottom: spacing(2), gap: spacing(1.5) },
    header: { gap: spacing(1) },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    h1: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', marginBottom: 4 },
    sub: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },

    backBtn: {
      backgroundColor: colors.editorSurface,
      borderWidth: 1,
      borderColor: colors.editorBorder,
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backBtnText: { color: colors.editorInk, fontWeight: '900', fontSize: 13 },

    flaggedBtn: {
      backgroundColor: colors.editorSurface,
      borderWidth: 1,
      borderColor: colors.editorBorder,
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flaggedBtnActive: { borderColor: colors.alertInk, backgroundColor: colors.editorAlertWash },
    flaggedBtnText: { color: colors.editorInk, fontWeight: '900', fontSize: 13 },

    filterBlock: {
      gap: 8,
      backgroundColor: colors.editorOuter,
      borderWidth: 1,
      borderColor: colors.editorRule,
      borderRadius: 14,
      padding: 10,
    },
    filterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    filterLabel: {
      color: colors.mutedInk,
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    filterValue: {
      flex: 1,
      color: colors.editorInk,
      fontSize: 12,
      fontWeight: '800',
      textAlign: 'right',
    },
    filterScroller: { flexGrow: 0, height: 38 },
    filterRow: { gap: 8, paddingRight: spacing(1), alignItems: 'center' },
    chip: {
      backgroundColor: colors.editorSurface,
      borderWidth: 1,
      borderColor: colors.editorSoftEdge,
      borderRadius: 999,
      minHeight: 34,
      maxWidth: 190,
      paddingVertical: 7,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipActive: { backgroundColor: colors.editorPrimary, borderColor: colors.editorPrimary },
    reviewChipActive: { backgroundColor: colors.regionFill, borderColor: colors.regionFill },
    chipText: { color: colors.editorSecondary, fontWeight: '700', fontSize: 13 },
    chipTextActive: { color: colors.editorActionInk },

    queueSummary: {
      backgroundColor: colors.editorOuter,
      borderWidth: 1,
      borderColor: colors.editorRule,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    queueSummaryLabel: {
      color: colors.editorTertiary,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    progress: {
      color: colors.editorInk,
      fontWeight: '900',
      fontVariant: ['tabular-nums'],
    },

    card: {
      backgroundColor: colors.deepSurface,
      borderWidth: 1,
      borderColor: colors.editorSoftEdge,
      borderRadius: 14,
      padding: spacing(2),
      gap: spacing(1),
    },
    cardFlagged: { borderColor: colors.alertInk, borderWidth: 2 },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },

    flagBanner: {
      backgroundColor: colors.alertWash,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignSelf: 'flex-start',
    },
    flagBannerText: { color: colors.restoreDanger, fontWeight: '900', fontSize: 13 },

    deckBadge: {
      backgroundColor: colors.slateTrack,
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 10,
      alignSelf: 'flex-start',
      maxWidth: '70%',
    },
    deckBadgeText: { color: colors.editorTertiary, fontSize: 12, fontWeight: '700' },
    statusBadge: {
      backgroundColor: colors.editorSuccessWash,
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    statusBadgeText: {
      color: colors.quizFeedbackInk,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'capitalize',
    },

    wordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    spanish: {
      flex: 1,
      color: colors.editorText,
      fontSize: 31,
      fontWeight: '900',
      lineHeight: 38,
    },
    label: {
      color: colors.editorTertiary,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    input: {
      backgroundColor: colors.editorSurface,
      borderWidth: 1,
      borderColor: colors.editorBorder,
      borderRadius: 10,
      color: colors.editorText,
      fontSize: 16,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    exampleInput: {
      minHeight: 104,
      textAlignVertical: 'top',
      lineHeight: 22,
    },
    ipa: { color: colors.mutedInk, fontSize: 14 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: {
      backgroundColor: colors.slateTrack,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 8,
    },
    tagText: { color: colors.editorTertiary, fontSize: 12 },

    speakBtn: {
      backgroundColor: colors.editorSurface,
      borderWidth: 1,
      borderColor: colors.editorSoftEdge,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    speakBtnText: { color: colors.editorInk, fontWeight: '700' },

    empty: {
      minHeight: 220,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.deepSurface,
      borderWidth: 1,
      borderColor: colors.editorSoftEdge,
      borderRadius: 14,
      padding: spacing(2),
    },
    emptyText: { color: colors.textSecondary },

    actionBar: {
      borderTopWidth: 1,
      borderTopColor: colors.editorRule,
      backgroundColor: colors.bg,
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
      backgroundColor: colors.editorSurface,
      borderWidth: 1,
      borderColor: colors.editorSoftEdge,
      borderRadius: 12,
      paddingVertical: 9,
      alignItems: 'center',
    },
    navBtnDisabled: { opacity: 0.3 },
    navBtnText: { color: colors.editorInk, fontWeight: '900', fontSize: 13 },

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
    nativeBtn: { backgroundColor: colors.editorDangerFill },
    saveBtn: { backgroundColor: colors.editorPrimary },
    actionBtnText: {
      color: colors.editorActionInk,
      fontWeight: '900',
      fontSize: 14,
      textAlign: 'center',
    },
  });
