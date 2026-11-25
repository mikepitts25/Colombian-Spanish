import { controlSurface, controlText } from '../styles/controlStates';
import Pressable from '../components/ThemedPressable';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing, radius, typography } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import {
  getQuizHistory,
  getSeenWords,
  recordStudySession,
  QuizResult,
  recordQuizResult,
  SeenWord,
} from '../storage/storage';
import { FlashCard } from '../types';
import {
  appendLearningEvent,
  createLearningSessionId,
  LearningEvent,
} from '../storage/learningEvents';
import {
  cardMatchesRegion,
  getCardRegionIds,
  REGION_FILTERS,
  REGION_LABEL_KEYS,
  RegionFilterId,
} from '../utils/regions';
import { shuffle } from '../utils/shuffle';
import { useLanguage } from '../context/LanguageContext';

interface QuizQuestion {
  cardId: string;
  spanish: string;
  correctAnswer: string;
  options: string[];
  deckId: string;
  regionLabel: string;
}

interface QuizSession {
  id: string;
  region: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answers: boolean[];
}

type CardRow = {
  deckId: string;
  deckName: string;
  card: FlashCard;
};

const ROUND_SIZES = [5, 10] as const;
const meaningKey = (text: string) => text.normalize('NFKC').trim().toLowerCase();
const canPrompt = (card: FlashCard) => !!(card.front.trim() && meaningKey(card.back));

export default function QuizScreen() {
  const theme = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  const { decks, ready } = useDeck();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const [seenWords, setSeenWords] = useState<SeenWord[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [activeRegion, setActiveRegion] = useState<RegionFilterId>('all');
  const [roundSize, setRoundSize] = useState<(typeof ROUND_SIZES)[number]>(ROUND_SIZES[0]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const submitting = useRef(false);
  const advancing = useRef(false);
  const pending = useRef<{ event: LearningEvent; correct: boolean } | null>(null);
  const answered = useRef(false);
  const startedAt = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    Promise.all([getSeenWords(), getQuizHistory()]).then(([words, history]) => {
      setSeenWords(words);
      setQuizHistory(history);
    });
  }, [ready]);

  const allCards = useMemo<CardRow[]>(() => {
    return (decks || []).flatMap((deck) =>
      (deck.cards || []).map((card) => ({
        deckId: deck.id,
        deckName: deck.name,
        card,
      })),
    );
  }, [decks]);

  const cardRowsById = useMemo(() => {
    return new Map(allCards.map((row) => [row.card.id, row]));
  }, [allCards]);

  const answerChoices = useMemo(() => {
    const choices = new Map<string, string>();
    for (const { card } of allCards) {
      const key = meaningKey(card.back);
      if (key && !choices.has(key)) choices.set(key, card.back);
    }
    return choices;
  }, [allCards]);

  const availableSeenWords = useMemo(() => {
    const included = new Set<string>();
    return seenWords.filter((word) => {
      const row = cardRowsById.get(word.cardId);
      if (!row || included.has(word.cardId) || !canPrompt(row.card)) return false;
      if (!cardMatchesRegion(row.card, activeRegion, row.deckName)) return false;
      included.add(word.cardId);
      return true;
    });
  }, [activeRegion, cardRowsById, seenWords]);

  const canStartQuiz = availableSeenWords.length > 0 && answerChoices.size > 1;
  const canReviewMissed = (ids: string[]) =>
    answerChoices.size > 1 &&
    ids.some((id) => {
      const row = cardRowsById.get(id);
      return row && canPrompt(row.card);
    });

  // Questions and distractors are snapshots: invalidate them when access/content changes.
  const sessionAvailable = useMemo(() => {
    if (!session) return true;
    const meanings = new Set(allCards.map((row) => row.card.back));
    return session.questions.every((question) => {
      const row = cardRowsById.get(question.cardId);
      return (
        row?.deckId === question.deckId &&
        row.card.front === question.spanish &&
        row.card.back === question.correctAnswer &&
        question.options.every((option) => meanings.has(option))
      );
    });
  }, [allCards, cardRowsById, session]);

  const currentQuestion = useMemo(() => {
    if (!session || quizComplete || !sessionAvailable) return null;
    return session.questions[session.currentIndex] ?? null;
  }, [session, quizComplete, sessionAvailable]);

  const filteredHistory = useMemo(() => {
    if (activeRegion === 'all') return quizHistory;
    return quizHistory.filter((result) => result.region === activeRegion);
  }, [activeRegion, quizHistory]);

  const makeQuestion = useCallback(
    (row: CardRow): QuizQuestion | null => {
      const correctAnswer = row.card.back;
      const correctKey = meaningKey(correctAnswer);
      const distractors = shuffle(
        [...answerChoices].flatMap(([key, answer]) => (key === correctKey ? [] : [answer])),
      ).slice(0, 3);
      if (!distractors.length) return null;

      return {
        cardId: row.card.id,
        spanish: row.card.front,
        correctAnswer,
        options: shuffle([correctAnswer, ...distractors]),
        deckId: row.deckId,
        regionLabel: getCardRegionIds(row.card, row.deckName)
          .map((region) => t(REGION_LABEL_KEYS[region]))
          .join(' / '),
      };
    },
    [answerChoices, t],
  );

  const generateQuestions = useCallback(
    (words: SeenWord[]) => {
      const due: SeenWord[] = [];
      const notDue: SeenWord[] = [];
      const now = Date.now();
      for (const word of words) {
        const row = cardRowsById.get(word.cardId);
        if (row) ((row.card.due ?? 0) <= now ? due : notDue).push(word);
      }
      const selectedDue = shuffle(due).slice(0, roundSize);
      const selected = [
        ...selectedDue,
        ...shuffle(notDue).slice(0, roundSize - selectedDue.length),
      ];

      return selected
        .map((word) => {
          const row = cardRowsById.get(word.cardId);
          return row ? makeQuestion(row) : null;
        })
        .filter((question): question is QuizQuestion => question !== null);
    },
    [cardRowsById, makeQuestion, roundSize],
  );

  const startQuestions = useCallback((questions: QuizQuestion[], region: string) => {
    if (questions.length === 0 || submitting.current || advancing.current) return;
    pending.current = null;
    answered.current = false;
    startedAt.current = Date.now();
    setSaveError(false);
    setSession({
      id: createLearningSessionId(),
      region,
      questions,
      currentIndex: 0,
      score: 0,
      answers: [],
    });
    setQuizComplete(false);
    setSelectedOption(null);
    setShowFeedback(false);
  }, []);

  const startQuiz = useCallback(() => {
    startQuestions(generateQuestions(availableSeenWords), activeRegion);
  }, [activeRegion, availableSeenWords, generateQuestions, startQuestions]);

  const startMissedReview = useCallback(
    (ids: string[], region: string) => {
      const questions = [...new Set(ids)].flatMap((cardId) => {
        const row = cardRowsById.get(cardId);
        const question = row && canPrompt(row.card) ? makeQuestion(row) : null;
        return question ? [question] : [];
      });
      startQuestions(questions, region);
    },
    [cardRowsById, makeQuestion, startQuestions],
  );

  function backToPractice() {
    nav.navigate('Root', { screen: 'Study' }, { pop: true });
  }

  const finishQuiz = useCallback(
    async (nextSession: QuizSession) => {
      const missedCardIds = nextSession.questions
        .filter((_, index) => !nextSession.answers[index])
        .map((question) => question.cardId);
      const nextHistory = await recordQuizResult({
        id: nextSession.id,
        score: nextSession.score,
        total: nextSession.questions.length,
        missedCardIds,
        region: nextSession.region,
      });
      if (!mounted.current) return;
      setQuizHistory(nextHistory);
      setQuizComplete(true);
      setSession(nextSession);
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(
          t('quiz.resultsSummary', {
            score: nextSession.score,
            total: nextSession.questions.length,
          }),
        );
      }
    },
    [t],
  );

  const handleNext = useCallback(
    async (wasCorrect: boolean) => {
      if (!session || !sessionAvailable || !answered.current || advancing.current) return;
      advancing.current = true;
      setSaving(true);
      const nextAnswers = [...session.answers, wasCorrect];
      const nextScore = wasCorrect ? session.score + 1 : session.score;
      const nextIndex = session.currentIndex + 1;
      const nextSession = {
        ...session,
        score: nextScore,
        answers: nextAnswers,
        currentIndex: nextIndex,
      };

      try {
        if (nextIndex >= session.questions.length) {
          await finishQuiz(nextSession);
        } else {
          setSession(nextSession);
          setSelectedOption(null);
          setShowFeedback(false);
          startedAt.current = Date.now();
        }
        pending.current = null;
        answered.current = false;
        if (mounted.current) setSaveError(false);
      } catch {
        if (mounted.current) setSaveError(true);
      } finally {
        advancing.current = false;
        if (mounted.current) setSaving(false);
      }
    },
    [finishQuiz, session, sessionAvailable],
  );

  const persistAnswer = useCallback(async () => {
    if (!sessionAvailable || !pending.current || submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setSaveError(false);
    const attempt = pending.current;
    try {
      await appendLearningEvent(attempt.event);
      await recordStudySession();
      if (mounted.current) {
        answered.current = true;
        setIsCorrect(attempt.correct);
        setShowFeedback(true);
      }
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  }, [sessionAvailable]);

  const handleSelectOption = useCallback(
    (option: string) => {
      if (!currentQuestion || !session || showFeedback || submitting.current || pending.current)
        return;
      const correct = option === currentQuestion.correctAnswer;
      const now = Date.now();
      pending.current = {
        correct,
        event: {
          schemaVersion: 1,
          id: `${session.id}:${session.currentIndex}`,
          sessionId: session.id,
          cardId: currentQuestion.cardId,
          deckId: currentQuestion.deckId,
          modality: 'recognition',
          outcome: correct ? 'correct' : 'incorrect',
          evidence: 'answer-checked',
          occurredAt: now,
          hintsUsed: 0,
          durationMs: Math.max(0, now - startedAt.current),
        },
      };
      setSelectedOption(option);
      void persistAnswer();
    },
    [currentQuestion, session, showFeedback, persistAnswer],
  );

  const renderRegionChips = () => (
    <View style={styles.regionPanel}>
      <Text style={styles.regionLabel}>{t('quiz.region')}</Text>
      <View style={styles.regionRow}>
        {REGION_FILTERS.map((region) => (
          <Pressable
            key={region.id}
            accessibilityRole="button"
            accessibilityState={{ selected: activeRegion === region.id }}
            style={[styles.regionChip, activeRegion === region.id && styles.regionChipActive]}
            onPress={() => setActiveRegion(region.id)}
          >
            <Text
              style={[
                styles.regionChipText,
                activeRegion === region.id && styles.regionChipTextActive,
              ]}
            >
              {t(REGION_LABEL_KEYS[region.id])}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderRoundOptions = () => (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: optionsOpen }}
        onPress={() => setOptionsOpen((open) => !open)}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>{t('quiz.roundOptions')}</Text>
      </Pressable>
      {optionsOpen && (
        <View style={styles.roundOptions}>
          {renderRegionChips()}
          <View style={styles.regionPanel}>
            <Text style={styles.regionLabel}>{t('quiz.roundLength')}</Text>
            <View style={styles.regionRow}>
              {ROUND_SIZES.map((size) => (
                <Pressable
                  key={size}
                  accessibilityRole="button"
                  accessibilityState={{ selected: roundSize === size }}
                  style={[styles.regionChip, roundSize === size && styles.regionChipActive]}
                  onPress={() => setRoundSize(size)}
                >
                  <Text
                    style={[
                      styles.regionChipText,
                      roundSize === size && styles.regionChipTextActive,
                    ]}
                  >
                    {t('quiz.questionCount', { count: size })}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </>
  );

  const renderHistory = () => {
    if (filteredHistory.length === 0) return null;
    return (
      <View style={styles.historyPanel}>
        <Text style={styles.historyTitle}>{t('quiz.recentScores')}</Text>
        {filteredHistory.slice(0, 3).map((result) => {
          const percent = Math.round((result.score / Math.max(1, result.total)) * 100);
          return (
            <View key={result.id} style={[styles.historyRow, largeText && styles.stackedHistory]}>
              <View>
                <Text style={styles.historyScore}>{percent}%</Text>
                <Text style={styles.historyMeta}>
                  {t('quiz.history.correct', { score: result.score, total: result.total })}
                </Text>
              </View>
              {canReviewMissed(result.missedCardIds) ? (
                <Pressable
                  accessibilityRole="button"
                  style={styles.reviewMissedBtn}
                  onPress={() => startMissedReview(result.missedCardIds, result.region)}
                >
                  <Text style={styles.reviewMissedText}>{t('quiz.reviewMissed')}</Text>
                </Pressable>
              ) : (
                <Text style={styles.perfectText}>
                  {t(result.missedCardIds.length ? 'quiz.missedUnavailable' : 'quiz.cleanRun')}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (session && !quizComplete && !sessionAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.emptySub}>
            {t('library.quizChanged')}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.primaryButton, controlSurface(theme, pressed, saving)]}
            disabled={saving}
            accessibilityState={{ disabled: saving, busy: saving }}
            onPress={() => {
              if (submitting.current || advancing.current) return;
              pending.current = null;
              answered.current = false;
              setSession(null);
              setQuizComplete(false);
              setShowFeedback(false);
              setSaveError(false);
            }}
          >
            <Text style={[styles.primaryButtonText, controlText(theme, saving)]}>
              {t('library.quizRestart')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    const regionEmpty = activeRegion !== 'all' && availableSeenWords.length === 0;
    const wordCount = Math.min(roundSize, availableSeenWords.length);
    const needsChoices = wordCount > 0 && answerChoices.size < 2;
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView key={fontScale} contentContainerStyle={styles.startScroll}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('quiz.title')}</Text>
            <Text style={styles.headerSub}>{t('quiz.startSub')}</Text>
          </View>
          {canStartQuiz ? (
            <View style={styles.startCard}>
              {activeRegion !== 'all' && (
                <Text style={styles.startLabel}>{t(REGION_LABEL_KEYS[activeRegion])}</Text>
              )}
              <Text style={styles.emptyTitle}>
                {t('quiz.roundSize', { count: wordCount, plural: wordCount === 1 ? '' : 's' })}
              </Text>
              <Pressable
                accessibilityRole="button"
                style={styles.primaryButton}
                onPress={startQuiz}
              >
                <Text style={styles.primaryButtonText}>{t('quiz.start')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.startCard}>
              {availableSeenWords.length === 0 && !regionEmpty ? (
                <>
                  <Text style={styles.emptyTitle}>{t('quiz.locked.title')}</Text>
                  <Text style={styles.emptySub}>
                    {t('quiz.locked.need', { count: 1, plural: '' })}
                  </Text>
                  <Text style={styles.emptySub}>{t('quiz.locked.sub')}</Text>
                </>
              ) : (
                <Text accessibilityRole="alert" style={styles.emptySub}>
                  {t(regionEmpty ? 'quiz.regionEmpty' : 'quiz.notEnoughChoices')}
                </Text>
              )}
              {regionEmpty && (
                <Pressable
                  accessibilityRole="button"
                  style={styles.secondaryButton}
                  onPress={() => setActiveRegion('all')}
                >
                  <Text style={styles.secondaryButtonText}>{t('quiz.useAllRegions')}</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                style={styles.primaryButton}
                onPress={needsChoices ? () => nav.navigate('AddCard') : backToPractice}
              >
                <Text style={styles.primaryButtonText}>
                  {t(needsChoices ? 'quiz.addWord' : 'quiz.studyNow')}
                </Text>
              </Pressable>
            </View>
          )}
          {renderRoundOptions()}
          {renderHistory()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (quizComplete && session) {
    const percentage = Math.round((session.score / Math.max(1, session.questions.length)) * 100);
    const missedIds = session.questions
      .filter((_, index) => !session.answers[index])
      .map((question) => question.cardId);
    const canReview = canReviewMissed(missedIds);
    const resultMessage =
      missedIds.length === 0
        ? 'quiz.complete.strong'
        : canReview
          ? 'quiz.complete.review'
          : 'quiz.missedUnavailable';
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView key={fontScale} contentContainerStyle={styles.completeContainer}>
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            accessibilityLabel={t('quiz.resultsSummary', {
              score: session.score,
              total: session.questions.length,
            })}
            style={styles.completeTitle}
          >
            {t('quiz.complete.title')}
          </Text>
          <Text style={styles.completeMessage}>{t(resultMessage)}</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>{t('quiz.score.label')}</Text>
            <Text style={styles.scoreValue}>
              {session.score} / {session.questions.length}
            </Text>
            <Text style={styles.scorePercent}>{percentage}%</Text>
          </View>
          <View style={[styles.statsContainer, largeText && styles.stackedStats]}>
            <View style={[styles.statItem, largeText && styles.noFlex]}>
              <Text style={styles.statNumber}>{session.score}</Text>
              <Text style={styles.statLabel}>{t('quiz.correct')}</Text>
            </View>
            <View style={[styles.statDivider, largeText && styles.horizontalDivider]} />
            <View style={[styles.statItem, largeText && styles.noFlex]}>
              <Text style={styles.statNumber}>{missedIds.length}</Text>
              <Text style={styles.statLabel}>{t('quiz.missed')}</Text>
            </View>
          </View>
          {canReview && (
            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
              onPress={() => startMissedReview(missedIds, session.region)}
            >
              <Text style={styles.primaryButtonText}>{t('quiz.reviewMissed')}</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            style={canReview ? styles.secondaryButton : styles.primaryButton}
            onPress={backToPractice}
          >
            <Text style={canReview ? styles.secondaryButtonText : styles.primaryButtonText}>
              {t('quiz.end')}
            </Text>
          </Pressable>
          {canStartQuiz && (
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={startQuiz}
            >
              <Text style={styles.secondaryButtonText}>{t('quiz.tryAgain')}</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progressText = `${Math.min((session.currentIndex ?? 0) + 1, session.questions.length)} / ${session.questions.length}`;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.questionViewport}
        key={`${session.id}:${session.currentIndex}:${fontScale}`}
        testID="quiz-question-scroll"
        contentContainerStyle={styles.questionScroll}
      >
        <View style={styles.questionHeader}>
          <Text style={styles.headerTitle}>{t('quiz.title')}</Text>
          <Text style={styles.progressText}>{progressText}</Text>
        </View>

        {currentQuestion && (
          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>{t('quiz.questionLabel')}</Text>
            <Text style={styles.spanishWord}>{currentQuestion.spanish}</Text>
            <Text style={styles.regionBadge}>{currentQuestion.regionLabel}</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === currentQuestion.correctAnswer;
            return (
              <Pressable
                key={`${option}-${index}`}
                accessibilityRole="button"
                accessibilityState={{
                  selected: isSelected,
                  disabled: showFeedback || saving || saveError,
                }}
                style={[
                  styles.optionButton,
                  showFeedback && isCorrectOption && styles.optionCorrect,
                  showFeedback && isSelected && !isCorrectOption && styles.optionIncorrect,
                ]}
                onPress={() => handleSelectOption(option)}
                disabled={showFeedback || saving || saveError}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {saveError && (
          <View style={styles.feedbackContainer}>
            <Text accessibilityRole="alert" style={styles.feedbackText}>
              {t('quiz.saveError')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => (answered.current ? void handleNext(isCorrect) : void persistAnswer())}
              disabled={saving}
              style={styles.retryButton}
            >
              <Text style={styles.optionText}>{t('quiz.retrySave')}</Text>
            </Pressable>
          </View>
        )}
        {showFeedback && currentQuestion && (
          <View
            style={[
              styles.feedbackContainer,
              isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
            ]}
          >
            <Text accessibilityLiveRegion="polite" style={styles.feedbackText}>
              {isCorrect
                ? t('quiz.feedback.correct')
                : t('quiz.feedback.answer', { answer: currentQuestion.correctAnswer })}
            </Text>
          </View>
        )}
      </ScrollView>
      {showFeedback && (
        <View style={styles.questionFooter}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              styles.nextButton,
              controlSurface(theme, pressed, saving),
            ]}
            onPress={() => void handleNext(isCorrect)}
            accessibilityRole="button"
            accessibilityState={{ disabled: saving, busy: saving }}
            disabled={saving}
          >
            <Text style={[styles.primaryButtonText, controlText(theme, saving)]}>
              {t(
                session.currentIndex + 1 === session.questions.length ? 'quiz.finish' : 'quiz.next',
              )}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, elevation }: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    questionViewport: { flex: 1 },
    questionScroll: { paddingHorizontal: spacing(3), paddingVertical: spacing(2), gap: spacing(2) },
    questionHeader: { gap: 4 },
    questionFooter: {
      paddingHorizontal: spacing(3),
      paddingTop: spacing(1),
      paddingBottom: spacing(1),
    },
    nextButton: { marginTop: 0, paddingVertical: spacing(1.5) },
    retryButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(4) },
    loadingText: { color: colors.textSecondary, fontSize: typography.size.lg },

    startScroll: { flexGrow: 1, padding: spacing(2), paddingBottom: spacing(8), gap: spacing(2) },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      textAlign: 'center',
    },
    emptySub: {
      color: colors.textSecondary,
      fontSize: typography.size.base,
      textAlign: 'center',
      paddingHorizontal: spacing(2),
    },
    progressText: { color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: '800' },

    header: { padding: spacing(3), paddingBottom: spacing(1.5), gap: 4 },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
    },
    headerSub: { color: colors.textSecondary, fontSize: typography.size.sm, lineHeight: 19 },

    roundOptions: { gap: spacing(2), padding: spacing(1) },
    regionPanel: {
      gap: spacing(1),
    },
    regionLabel: {
      color: colors.textTertiary,
      fontSize: typography.size.xs,
      fontWeight: '800',
      letterSpacing: 0,
      textTransform: 'uppercase',
    },
    regionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    regionChip: {
      minHeight: 48,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    regionChipActive: { backgroundColor: colors.regionFill, borderColor: colors.regionFill },
    regionChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
    regionChipTextActive: { color: colors.regionInk, fontWeight: '900' },

    startCard: {
      backgroundColor: colors.surface,
      borderRadius: radius['2xl'],
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing(4),
      alignItems: 'center',
      gap: spacing(1.5),
      ...elevation.base,
    },
    startLabel: { color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: '800' },

    primaryButton: {
      marginTop: spacing(1),
      backgroundColor: colors.brand,
      paddingHorizontal: spacing(5),
      paddingVertical: spacing(2.5),
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      ...elevation.base,
    },
    primaryButtonText: {
      color: colors.textInverse,
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
    },
    secondaryButton: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.borderBrand,
      paddingHorizontal: spacing(5),
      paddingVertical: spacing(2.5),
      borderRadius: radius.lg,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      color: colors.brand,
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
    },

    historyPanel: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing(2),
      gap: spacing(1),
    },
    historyTitle: {
      color: colors.textPrimary,
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing(2),
      paddingVertical: spacing(1),
    },
    stackedHistory: { alignItems: 'flex-start', flexDirection: 'column' },
    historyScore: {
      color: colors.brand,
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
    },
    historyMeta: { color: colors.textTertiary, fontSize: typography.size.xs },
    reviewMissedBtn: {
      borderRadius: radius.full,
      backgroundColor: colors.quizReviewWash,
      paddingHorizontal: spacing(1.5),
      paddingVertical: spacing(1),
      minHeight: 48,
      flexShrink: 1,
      justifyContent: 'center',
    },
    reviewMissedText: {
      color: colors.quizReviewInk,
      fontSize: typography.size.xs,
      fontWeight: '900',
    },
    perfectText: {
      color: colors.textSecondary,
      fontSize: typography.size.xs,
      fontWeight: '800',
      flexShrink: 1,
    },

    questionCard: {
      backgroundColor: colors.surface,
      padding: spacing(2),
      borderRadius: radius['2xl'],
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      gap: spacing(1),
      ...elevation.lg,
    },
    questionLabel: {
      color: colors.textSecondary,
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    spanishWord: {
      color: colors.textPrimary,
      fontSize: typography.size['4xl'],
      fontWeight: typography.weight.bold,
      textAlign: 'center',
    },
    regionBadge: {
      color: colors.quizFeedbackInk,
      fontSize: typography.size.xs,
      fontWeight: '900',
      textTransform: 'uppercase',
    },

    optionsContainer: { gap: spacing(1) },
    optionButton: {
      backgroundColor: colors.surfaceElevated,
      minHeight: 48,
      justifyContent: 'center',
      paddingHorizontal: spacing(2),
      paddingVertical: spacing(1.5),
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionCorrect: { borderColor: colors.success, backgroundColor: colors.successMuted },
    optionIncorrect: { borderColor: colors.danger, backgroundColor: colors.dangerMuted },
    optionText: {
      color: colors.textPrimary,
      fontSize: typography.size.base,
      fontWeight: typography.weight.medium,
    },

    feedbackContainer: {
      padding: spacing(1.5),
      borderRadius: radius.lg,
      alignItems: 'center',
    },
    feedbackCorrect: {
      backgroundColor: colors.successMuted,
      borderWidth: 1,
      borderColor: colors.success,
    },
    feedbackIncorrect: {
      backgroundColor: colors.dangerMuted,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    feedbackText: {
      color: colors.textPrimary,
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
    },

    completeContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing(4),
      gap: spacing(2),
    },
    completeTitle: {
      color: colors.textPrimary,
      fontSize: typography.size['3xl'],
      fontWeight: typography.weight.bold,
    },
    completeMessage: {
      color: colors.textSecondary,
      fontSize: typography.size.base,
      textAlign: 'center',
      marginBottom: spacing(1),
    },
    scoreCard: {
      backgroundColor: colors.surface,
      borderRadius: radius['2xl'],
      padding: spacing(4),
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.brand,
      ...elevation.lg,
    },
    scoreLabel: {
      color: colors.textSecondary,
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
    },
    scoreValue: {
      color: colors.textPrimary,
      fontSize: typography.size['4xl'],
      fontWeight: typography.weight.extrabold,
    },
    scorePercent: {
      color: colors.brand,
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
    },
    statsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.xl,
      padding: spacing(3),
      minWidth: 220,
    },
    statItem: { flex: 1, alignItems: 'center' },
    stackedStats: { alignSelf: 'stretch', flexDirection: 'column', gap: spacing(2) },
    noFlex: { flex: 0 },
    statNumber: {
      color: colors.textPrimary,
      fontSize: typography.size['2xl'],
      fontWeight: typography.weight.bold,
    },
    statLabel: {
      color: colors.textTertiary,
      fontSize: typography.size.xs,
      fontWeight: typography.weight.medium,
      textTransform: 'uppercase',
    },
    statDivider: { width: 1, backgroundColor: colors.border },
    horizontalDivider: { width: '100%', height: 1 },
  });
