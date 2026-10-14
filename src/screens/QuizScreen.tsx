import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography, elevation } from '../styles/theme';
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
  getCardRegionId,
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

const MIN_QUIZ_WORDS = 1;
const MAX_QUIZ_QUESTIONS = 10;

export default function QuizScreen() {
  const { decks, ready } = useDeck();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const [seenWords, setSeenWords] = useState<SeenWord[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [activeRegion, setActiveRegion] = useState<RegionFilterId>('all');
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [questionsUnavailable, setQuestionsUnavailable] = useState(false);
  const submitting = useRef(false);
  const advancing = useRef(false);
  const pending = useRef<{ event: LearningEvent; correct: boolean } | null>(null);
  const answered = useRef(false);
  const startedAt = useRef(Date.now());
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

  const availableSeenWords = useMemo(() => {
    const included = new Set<string>();
    return seenWords.filter((word) => {
      const row = cardRowsById.get(word.cardId);
      if (!row || included.has(word.cardId)) return false;
      if (!cardMatchesRegion(row.card, activeRegion, row.deckName)) return false;
      included.add(word.cardId);
      return true;
    });
  }, [activeRegion, cardRowsById, seenWords]);

  const currentQuestion = useMemo(() => {
    if (!session || quizComplete) return null;
    return session.questions[session.currentIndex] ?? null;
  }, [session, quizComplete]);

  const filteredHistory = useMemo(() => {
    if (activeRegion === 'all') return quizHistory;
    return quizHistory.filter((result) => result.region === activeRegion);
  }, [activeRegion, quizHistory]);

  const makeQuestion = useCallback(
    (row: CardRow): QuizQuestion | null => {
      const correctAnswer = row.card.back;
      const key = (text: string) => text.normalize('NFKC').trim().toLowerCase();
      const meanings = new Map<string, string>();
      for (const item of allCards) {
        const answer = item.card.back;
        const meaning = key(answer);
        if (meaning && meaning !== key(correctAnswer) && !meanings.has(meaning)) {
          meanings.set(meaning, answer);
        }
      }
      const distractors = shuffle([...meanings.values()]).slice(0, 3);
      if (!distractors.length) return null;

      return {
        cardId: row.card.id,
        spanish: row.card.front,
        correctAnswer,
        options: shuffle([correctAnswer, ...distractors]),
        deckId: row.deckId,
        regionLabel: t(REGION_LABEL_KEYS[getCardRegionId(row.card, row.deckName)]),
      };
    },
    [allCards, t],
  );

  const generateQuestions = useCallback(
    (words: SeenWord[]) => {
      const due = words.filter((word) => {
        const row = cardRowsById.get(word.cardId);
        return row ? (row.card.due ?? 0) <= Date.now() : false;
      });
      const notDue = words.filter((word) => !due.some((dueWord) => dueWord.cardId === word.cardId));
      const selectedDue = shuffle(due).slice(0, MAX_QUIZ_QUESTIONS);
      const selected = [
        ...selectedDue,
        ...shuffle(notDue).slice(0, Math.max(0, MAX_QUIZ_QUESTIONS - selectedDue.length)),
      ];

      return selected
        .map((word) => {
          const row = cardRowsById.get(word.cardId);
          return row ? makeQuestion(row) : null;
        })
        .filter(Boolean) as QuizQuestion[];
    },
    [cardRowsById, makeQuestion],
  );

  const startQuestions = useCallback((questions: QuizQuestion[]) => {
    setQuestionsUnavailable(questions.length === 0);
    if (questions.length === 0) return;
    pending.current = null;
    answered.current = false;
    startedAt.current = Date.now();
    setSaveError(false);
    setSession({
      id: createLearningSessionId(),
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
    startQuestions(generateQuestions(availableSeenWords));
  }, [availableSeenWords, generateQuestions, startQuestions]);

  const startMissedReview = useCallback(
    (result: QuizResult) => {
      const questions = result.missedCardIds
        .map((cardId) => cardRowsById.get(cardId))
        .filter(Boolean)
        .map((row) => makeQuestion(row as CardRow));
      startQuestions(questions.filter((question): question is QuizQuestion => question !== null));
    },
    [cardRowsById, makeQuestion, startQuestions],
  );

  function changeRegion(region: RegionFilterId) {
    setActiveRegion(region);
    setSession(null);
    setQuizComplete(false);
    setSelectedOption(null);
    setShowFeedback(false);
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
        region: activeRegion,
      });
      if (!mounted.current) return;
      setQuizHistory(nextHistory);
      setQuizComplete(true);
      setSession(nextSession);
    },
    [activeRegion],
  );

  const handleNext = useCallback(
    async (wasCorrect: boolean) => {
      if (!session || !answered.current || advancing.current) return;
      advancing.current = true;
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
      }
    },
    [finishQuiz, session],
  );

  const persistAnswer = useCallback(async () => {
    if (!pending.current || submitting.current) return;
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
  }, []);

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
            style={[styles.regionChip, activeRegion === region.id && styles.regionChipActive]}
            onPress={() => changeRegion(region.id)}
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

  const renderHistory = () => {
    if (filteredHistory.length === 0) return null;
    return (
      <View style={styles.historyPanel}>
        <Text style={styles.historyTitle}>{t('quiz.recentScores')}</Text>
        {filteredHistory.slice(0, 3).map((result) => {
          const percent = Math.round((result.score / Math.max(1, result.total)) * 100);
          return (
            <View key={result.id} style={styles.historyRow}>
              <View>
                <Text style={styles.historyScore}>{percent}%</Text>
                <Text style={styles.historyMeta}>
                  {t('quiz.history.correct', { score: result.score, total: result.total })}
                </Text>
              </View>
              {result.missedCardIds.length > 0 ? (
                <Pressable style={styles.reviewMissedBtn} onPress={() => startMissedReview(result)}>
                  <Text style={styles.reviewMissedText}>{t('quiz.reviewMissed')}</Text>
                </Pressable>
              ) : (
                <Text style={styles.perfectText}>{t('quiz.cleanRun')}</Text>
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

  if (!session && availableSeenWords.length < MIN_QUIZ_WORDS) {
    const needed = MIN_QUIZ_WORDS - availableSeenWords.length;
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.emptyScroll}>
          {renderRegionChips()}
          <View style={styles.emptyBody}>
            <View style={styles.centerPanel}>
              <Text style={styles.emoji}>🎯</Text>
              <Text style={styles.emptyTitle}>{t('quiz.locked.title')}</Text>
              <Text style={styles.emptyNeed}>
                {t('quiz.locked.need', { count: needed, plural: needed !== 1 ? 's' : '' })}
              </Text>
              <Text style={styles.emptySub}>{t('quiz.locked.sub')}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, (availableSeenWords.length / MIN_QUIZ_WORDS) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {t('quiz.progress.words', {
                    count: availableSeenWords.length,
                    target: MIN_QUIZ_WORDS,
                  })}
                </Text>
              </View>
              <Pressable style={styles.primaryButton} onPress={() => nav.navigate('Study')}>
                <Text style={styles.primaryButtonText}>{t('quiz.studyNow')}</Text>
              </Pressable>
            </View>
          </View>
          {questionsUnavailable && (
            <Text accessibilityRole="alert" style={styles.emptySub}>
              {t('quiz.notEnoughChoices')}
            </Text>
          )}
          {renderHistory()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.startScroll}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('quiz.title')}</Text>
            <Text style={styles.headerSub}>{t('quiz.startSub')}</Text>
          </View>
          {renderRegionChips()}
          <View style={styles.startCard}>
            <Text style={styles.startCount}>{availableSeenWords.length}</Text>
            <Text style={styles.startLabel}>{t('quiz.availableWords')}</Text>
            <Text style={styles.headerSub}>
              {t('quiz.roundSize', {
                count: Math.min(MAX_QUIZ_QUESTIONS, availableSeenWords.length),
                plural: availableSeenWords.length === 1 ? '' : 's',
              })}
            </Text>
            <Pressable style={styles.primaryButton} onPress={startQuiz}>
              <Text style={styles.primaryButtonText}>{t('quiz.start')}</Text>
            </Pressable>
          </View>
          {questionsUnavailable && (
            <Text accessibilityRole="alert" style={styles.emptySub}>
              {t('quiz.notEnoughChoices')}
            </Text>
          )}
          {renderHistory()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (quizComplete && session) {
    const percentage = Math.round((session.score / Math.max(1, session.questions.length)) * 100);
    const missedCount = session.answers.filter((answer) => !answer).length;
    const latestResult = quizHistory[0];
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.completeContainer}>
          <Text style={styles.completeTitle}>{t('quiz.complete.title')}</Text>
          <Text style={styles.completeMessage}>
            {percentage >= 80 ? t('quiz.complete.strong') : t('quiz.complete.review')}
          </Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>{t('quiz.score.label')}</Text>
            <Text style={styles.scoreValue}>
              {session.score} / {session.questions.length}
            </Text>
            <Text style={styles.scorePercent}>{percentage}%</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{session.score}</Text>
              <Text style={styles.statLabel}>{t('quiz.correct')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{missedCount}</Text>
              <Text style={styles.statLabel}>{t('quiz.missed')}</Text>
            </View>
          </View>
          {latestResult?.missedCardIds.length ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={() => startMissedReview(latestResult)}
            >
              <Text style={styles.secondaryButtonText}>{t('quiz.reviewMissed')}</Text>
            </Pressable>
          ) : null}
          {questionsUnavailable && (
            <Text accessibilityRole="alert" style={styles.emptySub}>
              {t('quiz.notEnoughChoices')}
            </Text>
          )}
          <Pressable style={styles.primaryButton} onPress={startQuiz}>
            <Text style={styles.primaryButtonText}>{t('quiz.tryAgain')}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progressText = `${Math.min((session.currentIndex ?? 0) + 1, session.questions.length)} / ${session.questions.length}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        key={`${session.id}:${session.currentIndex}`}
        testID="quiz-question-scroll"
        contentContainerStyle={styles.questionScroll}
      >
        <View style={styles.header}>
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
                style={[
                  styles.optionButton,
                  showFeedback && isCorrectOption && styles.optionCorrect,
                  showFeedback && isSelected && !isCorrectOption && styles.optionIncorrect,
                ]}
                onPress={() => handleSelectOption(option)}
                disabled={showFeedback || saving || !!pending.current}
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
              onPress={() => (answered.current ? void handleNext(isCorrect) : void persistAnswer())}
              disabled={saving}
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
            <Text style={styles.feedbackText}>
              {isCorrect
                ? t('quiz.feedback.correct')
                : t('quiz.feedback.answer', { answer: currentQuestion.correctAnswer })}
            </Text>
          </View>
        )}
        {showFeedback && (
          <Pressable
            style={styles.primaryButton}
            onPress={() => void handleNext(isCorrect)}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {t(
                session.currentIndex + 1 === session.questions.length ? 'quiz.finish' : 'quiz.next',
              )}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  questionScroll: { paddingBottom: spacing(3) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(4) },
  loadingText: { color: colors.textSecondary, fontSize: typography.size.lg },

  emptyScroll: {
    flexGrow: 1,
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1.5),
    paddingBottom: spacing(8),
    gap: spacing(2),
  },
  startScroll: { flexGrow: 1, padding: spacing(2), paddingBottom: spacing(8), gap: spacing(2) },
  emptyBody: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 440,
  },
  centerPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(3),
    gap: spacing(1.25),
    ...elevation.sm,
  },
  emoji: { fontSize: 44, marginBottom: spacing(0.5) },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  emptyNeed: {
    color: colors.brand,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    paddingHorizontal: spacing(2),
  },
  progressContainer: { width: '100%', maxWidth: 280, marginTop: spacing(0.5) },
  progressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: radius.full },
  progressText: { color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: '800' },

  header: { padding: spacing(3), paddingBottom: spacing(1.5), gap: 4 },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  headerSub: { color: colors.textSecondary, fontSize: typography.size.sm, lineHeight: 19 },

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
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionChipActive: { backgroundColor: '#047857', borderColor: '#047857' },
  regionChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  regionChipTextActive: { color: '#ffffff', fontWeight: '900' },

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
  startCount: { color: colors.textPrimary, fontSize: 52, fontWeight: typography.weight.extrabold },
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
  historyScore: {
    color: colors.brand,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  historyMeta: { color: colors.textTertiary, fontSize: typography.size.xs },
  reviewMissedBtn: {
    borderRadius: radius.full,
    backgroundColor: 'rgba(4,120,87,0.18)',
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
  },
  reviewMissedText: { color: '#6ee7b7', fontSize: typography.size.xs, fontWeight: '900' },
  perfectText: { color: colors.textSecondary, fontSize: typography.size.xs, fontWeight: '800' },

  questionCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing(3),
    marginVertical: spacing(2),
    padding: spacing(4),
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing(1.5),
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
    color: '#99f6e4',
    fontSize: typography.size.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  optionsContainer: { padding: spacing(3), gap: spacing(2) },
  optionButton: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing(3),
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
    marginHorizontal: spacing(3),
    marginTop: spacing(2),
    padding: spacing(3),
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
});
