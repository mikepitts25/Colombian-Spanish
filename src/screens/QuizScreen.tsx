// src/screens/QuizScreen.tsx
// Vocabulary quiz with SRS integration - correct answers mark as 'good', incorrect as 'again'

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, elevation } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { getSeenWords, SeenWord, incrementDailyProgress } from '../storage/storage';
import { gradeCard } from '../utils/srs';
import { FlashCard } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');

interface QuizQuestion {
  cardId: string;
  spanish: string;
  correctAnswer: string;
  options: string[];
  deckId: string;
}

interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answers: boolean[];
}

// SRS quality ratings
const QUALITY_AGAIN = 1; // Incorrect - reset/push back
const QUALITY_GOOD = 4;  // Correct - normal progression

export default function QuizScreen() {
  const { decks, ready } = useDeck();
  const [seenWords, setSeenWords] = useState<SeenWord[]>([]);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  // Animation values
  const cardScale = useSharedValue(1);
  const cardShake = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Load seen words on mount
  useEffect(() => {
    if (ready) {
      loadSeenWords();
    }
  }, [ready]);

  const loadSeenWords = async () => {
    const words = await getSeenWords();
    setSeenWords(words);
  };

  // Get all available cards from decks for distractor selection
  const allCards = useMemo(() => {
    const cards: { id: string; front: string; back: string; deckId: string }[] = [];
    decks.forEach((deck) => {
      deck.cards.forEach((card) => {
        cards.push({
          id: card.id,
          front: card.front,
          back: card.back,
          deckId: deck.id,
        });
      });
    });
    return cards;
  }, [decks]);

  // Get due cards (for SRS priority selection)
  const getDueCards = useCallback((words: SeenWord[]) => {
    const now = Date.now();
    const dueCards: SeenWord[] = [];
    const notDueCards: SeenWord[] = [];

    words.forEach((word) => {
      // Find the actual card to check its due date
      const card = allCards.find((c) => c.id === word.cardId);
      if (card) {
        // Get the full card from decks to check due date
        const fullCard = decks
          .flatMap((d) => d.cards)
          .find((c) => c.id === word.cardId);
        
        if (fullCard && (fullCard.due ?? 0) <= now) {
          dueCards.push(word);
        } else {
          notDueCards.push(word);
        }
      }
    });

    return { dueCards, notDueCards };
  }, [allCards, decks]);

  // Generate quiz questions - prioritize due cards
  const generateQuestions = useCallback((words: SeenWord[]): QuizQuestion[] => {
    if (words.length === 0) return [];

    const { dueCards, notDueCards } = getDueCards(words);
    
    // Prioritize due cards, fill with non-due if needed
    let selected = dueCards.slice(0, 10);
    if (selected.length < 10) {
      const remaining = 10 - selected.length;
      // Shuffle notDueCards and take what we need
      const shuffledNotDue = [...notDueCards].sort(() => Math.random() - 0.5);
      selected = [...selected, ...shuffledNotDue.slice(0, remaining)];
    }

    // Shuffle final selection
    selected = selected.sort(() => Math.random() - 0.5);

    return selected.map((word) => {
      // Get 3 random incorrect options
      const otherCards = allCards.filter((c) => c.id !== word.cardId);
      const shuffled = otherCards.sort(() => Math.random() - 0.5);
      const distractors = shuffled.slice(0, 3).map((c) => c.back);

      // Combine and shuffle options
      const options = [word.english, ...distractors].sort(() => Math.random() - 0.5);

      return {
        cardId: word.cardId,
        spanish: word.spanish,
        correctAnswer: word.english,
        options,
        deckId: word.deckId,
      };
    });
  }, [allCards, getDueCards]);

  // Start a new quiz session
  const startQuiz = useCallback(() => {
    const questions = generateQuestions(seenWords);
    if (questions.length > 0) {
      setSession({
        questions,
        currentIndex: 0,
        score: 0,
        answers: [],
      });
      setQuizComplete(false);
      setSelectedOption(null);
      setShowFeedback(false);
      progressWidth.value = withTiming(0, { duration: 300 });
    }
  }, [seenWords, generateQuestions, progressWidth]);

  // Get current question
  const currentQuestion = useMemo(() => {
    if (!session || quizComplete) return null;
    return session.questions[session.currentIndex];
  }, [session, quizComplete]);

  // Update progress animation
  useEffect(() => {
    if (session) {
      const progress = (session.currentIndex / session.questions.length) * 100;
      progressWidth.value = withTiming(progress, { duration: 300 });
    }
  }, [session, progressWidth]);

  // Handle answer selection
  const handleSelectOption = useCallback(async (option: string) => {
    if (!session || !currentQuestion || showFeedback) return;

    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update SRS based on answer
    const quality = correct ? QUALITY_GOOD : QUALITY_AGAIN;
    await updateCardSRS(currentQuestion.cardId, quality);

    // Increment daily progress
    await incrementDailyProgress(1);

    // Animate feedback
    if (correct) {
      cardScale.value = withSequence(
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    } else {
      // Shake animation for wrong answer
      cardShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }

    // Auto-advance after delay
    setTimeout(() => {
      handleNext(correct);
    }, 1200);
  }, [session, currentQuestion, showFeedback, cardScale, cardShake]);

  // Update card in SRS
  const updateCardSRS = async (cardId: string, quality: number) => {
    // Find the card in decks and update it
    for (const deck of decks) {
      const cardIndex = deck.cards.findIndex((c) => c.id === cardId);
      if (cardIndex !== -1) {
        const card = deck.cards[cardIndex];
        const updatedCard = gradeCard(card, quality as 0 | 1 | 2 | 3 | 4 | 5);
        
        // Update the deck with the graded card
        deck.cards[cardIndex] = updatedCard;
        
        // Save to storage
        const { saveDecks } = await import('../storage/storage');
        await saveDecks(decks);
        break;
      }
    }
  };

  // Move to next question
  const handleNext = useCallback((wasCorrect: boolean) => {
    if (!session) return;

    const newAnswers = [...session.answers, wasCorrect];
    const newScore = wasCorrect ? session.score + 1 : session.score;
    const nextIndex = session.currentIndex + 1;

    if (nextIndex >= session.questions.length) {
      // Quiz complete
      setQuizComplete(true);
      setSession({
        ...session,
        score: newScore,
        answers: newAnswers,
      });
    } else {
      // Next question
      setSession({
        ...session,
        currentIndex: nextIndex,
        score: newScore,
        answers: newAnswers,
      });
      setSelectedOption(null);
      setShowFeedback(false);
    }
  }, [session]);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateX: cardShake.value },
    ],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Loading state
  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not enough seen words
  if (seenWords.length < 10) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emoji}>🎯</Text>
          <Text style={styles.emptyTitle}>Study More to Unlock Quiz!</Text>
          <Text style={styles.emptySub}>
            You've seen {seenWords.length} of 10 words needed.
          </Text>
          <Text style={styles.emptySub}>
            Flip through flashcards in the Study tab to add words to your quiz pool.
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(100, (seenWords.length / 10) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {seenWords.length} / 10 words
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Quiz complete screen
  if (quizComplete && session) {
    const percentage = Math.round((session.score / session.questions.length) * 100);
    let message = '';
    let emoji = '';
    
    if (percentage === 100) {
      message = '¡Perfecto! Outstanding work!';
      emoji = '🏆';
    } else if (percentage >= 80) {
      message = '¡Muy bien! Great job!';
      emoji = '🌟';
    } else if (percentage >= 60) {
      message = '¡Bien hecho! Keep practicing!';
      emoji = '👍';
    } else {
      message = 'Keep studying! You\'ll get there!';
      emoji = '💪';
    }

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.completeContainer}>
          <Text style={styles.completeEmoji}>{emoji}</Text>
          <Text style={styles.completeTitle}>Quiz Complete!</Text>
          <Text style={styles.completeMessage}>{message}</Text>
          
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={styles.scoreValue}>
              {session.score} / {session.questions.length}
            </Text>
            <Text style={styles.scorePercent}>{percentage}%</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {session.answers.filter(Boolean).length}
              </Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {session.answers.filter((a) => !a).length}
              </Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
          </View>

          <Pressable style={styles.retryButton} onPress={startQuiz}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
          
          <Text style={styles.srsNote}>
            Correct answers moved cards forward in SRS.{'\n'}
            Incorrect answers reset cards for re-review.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active quiz
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Vocabulary Quiz</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
            </View>
          </View>
          <Text style={styles.progressText}>
            {session?.currentIndex ?? 0} / {session?.questions.length ?? 0}
          </Text>
        </View>
      </View>

      {/* Question Card */}
      {currentQuestion && (
        <Animated.View style={[styles.questionCard, cardAnimatedStyle]}>
          <Text style={styles.questionLabel}>What does this mean?</Text>
          <Text style={styles.spanishWord}>{currentQuestion.spanish}</Text>
        </Animated.View>
      )}

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion?.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrectOption = option === currentQuestion.correctAnswer;

          const getOptionStyle = () => {
            const baseStyle: any[] = [styles.optionButton];
            if (showFeedback) {
              if (isCorrectOption) baseStyle.push(styles.optionCorrect);
              else if (isSelected) baseStyle.push(styles.optionIncorrect);
            } else if (isSelected) {
              baseStyle.push(styles.optionSelected);
            }
            return baseStyle;
          };

          const getTextStyle = () => {
            const baseStyle: any[] = [styles.optionText];
            if (showFeedback) {
              if (isCorrectOption) baseStyle.push(styles.optionTextCorrect);
              else if (isSelected) baseStyle.push(styles.optionTextIncorrect);
            }
            return baseStyle;
          };

          return (
            <Pressable
              key={`${option}-${index}`}
              style={getOptionStyle()}
              onPress={() => handleSelectOption(option)}
              disabled={showFeedback}
            >
              <Text style={getTextStyle()}>{option}</Text>
              {showFeedback && isCorrectOption && (
                <Text style={styles.checkmark}>✓</Text>
              )}
              {showFeedback && isSelected && !isCorrectOption && (
                <Text style={styles.xmark}>✗</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Feedback */}
      {showFeedback && (
        <View style={[styles.feedbackContainer, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <Text style={styles.feedbackText}>
            {isCorrect ? '¡Correcto! ✅' : 'Not quite! ❌'}
          </Text>
          {!isCorrect && currentQuestion && (
            <Text style={styles.feedbackSubtext}>
              The answer was: {currentQuestion.correctAnswer}
            </Text>
          )}
          <Text style={styles.srsFeedback}>
            {isCorrect ? 'Card moved forward in SRS' : 'Card reset for re-review'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(4),
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.size.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing(2),
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    marginBottom: spacing(1),
    textAlign: 'center',
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    marginBottom: spacing(2),
    paddingHorizontal: spacing(2),
  },
  progressContainer: {
    width: '100%',
    maxWidth: 280,
    marginTop: spacing(3),
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    textAlign: 'center',
    marginTop: spacing(1),
  },

  // Header
  header: {
    padding: spacing(3),
    paddingBottom: spacing(2),
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(2),
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  progressBarContainer: {
    flex: 1,
  },

  // Question Card
  questionCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing(3),
    marginVertical: spacing(2),
    padding: spacing(4),
    borderRadius: radius['2xl'],
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    ...elevation.lg,
  },
  questionLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginBottom: spacing(2),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  spanishWord: {
    color: colors.textPrimary,
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },

  // Options
  optionsContainer: {
    padding: spacing(3),
    gap: spacing(2),
  },
  optionButton: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing(3),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandMuted,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successMuted,
  },
  optionIncorrect: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    flex: 1,
  },
  optionTextCorrect: {
    color: colors.success,
    fontWeight: typography.weight.bold,
  },
  optionTextIncorrect: {
    color: colors.danger,
  },
  checkmark: {
    color: colors.success,
    fontSize: 20,
    fontWeight: typography.weight.bold,
  },
  xmark: {
    color: colors.danger,
    fontSize: 20,
    fontWeight: typography.weight.bold,
  },

  // Feedback
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
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(0.5),
  },
  feedbackSubtext: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    marginBottom: spacing(1),
  },
  srsFeedback: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    fontStyle: 'italic',
  },

  // Complete Screen
  completeContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(4),
  },
  completeEmoji: {
    fontSize: 80,
    marginBottom: spacing(2),
  },
  completeTitle: {
    color: colors.textPrimary,
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    marginBottom: spacing(1),
  },
  completeMessage: {
    color: colors.textSecondary,
    fontSize: typography.size.lg,
    marginBottom: spacing(4),
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing(4),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.brand,
    marginBottom: spacing(3),
    ...elevation.lg,
  },
  scoreLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginBottom: spacing(1),
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.extrabold,
    marginBottom: spacing(0.5),
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
    marginBottom: spacing(4),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
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
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  retryButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderRadius: radius.lg,
    ...elevation.base,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  srsNote: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    textAlign: 'center',
    marginTop: spacing(3),
    lineHeight: 18,
  },
});
