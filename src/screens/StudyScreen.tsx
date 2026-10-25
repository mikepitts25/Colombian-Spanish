import ThemeIcon from '../components/ThemeIcon';
import Pressable from '../components/ThemedPressable';
import ThemedTextInput from '../components/ThemedTextInput';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useDeck } from '../hooks/useDeck';
import Flashcard from '../components/Flashcard';
import {
  getDailyProgress,
  getLastStudySession,
  LastStudySession,
  saveLastStudySession,
  saveResumedStudySession,
} from '../storage/storage';
import ConjugationPanel from '../components/ConjugationPanel';
import { isVerb } from '../utils/verbUtils';
import {
  cardMatchesRegion,
  REGION_FILTERS,
  REGION_LABEL_KEYS,
  RegionFilterId,
} from '../utils/regions';
import { useLanguage } from '../context/LanguageContext';
import {
  CATEGORY_DISPLAY,
  getDeckDisplayName,
  getCategoryForDeck,
  getDecksForCategory,
  getPreferredDeckForCategory,
} from '../utils/deckCategories';
import type { CategoryKey } from '../utils/deckCategories';
import type { FlashCard } from '../types';
import { createLearningSessionId } from '../storage/learningEvents';
import { AnswerAttempt, DailyNewCardLimitError, StaleGradeError } from '../storage/flashcardAnswer';
import { speakCard } from '../services/tts';
import {
  StudyQueueSnapshot,
  copySessionInput,
  sameStudySession,
  StaleStudySessionError,
} from '../storage/studySession';
import { isNewCard, formatIntervalShort, previewInterval } from '../utils/srs';
import { useActiveStudyTime } from '../hooks/useActiveStudyTime';
import { readDailyPlan } from '../storage/dailyPlans';

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

type StudyMode = 'landing' | 'session';
type SearchRow = { deckId: string; deckName: string; card: FlashCard };

export default function StudyScreen() {
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
  const {
    ready,
    decks,
    activeDeck,
    getStudyBatch,
    recordAnswer,
    toggleFavorite,
    setActiveDeckId,
    reload,
  } = useDeck();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const [mode, setMode] = useState<StudyMode>('landing');
  const [topicBrowserOpen, setTopicBrowserOpen] = useState(false);
  const dailyPlan = useRef<string | undefined>(undefined);
  const [resumePlanId, setResumePlanId] = useState<string | undefined>();
  const [planOpening, setPlanOpening] = useState(false);
  const openingPlan = useRef(false);
  const [planOpenError, setPlanOpenError] = useState(false);
  const [planOpenAttempt, setPlanOpenAttempt] = useState(0);
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [resumeLoadError, setResumeLoadError] = useState(false);
  const [resumeLoadAttempt, setResumeLoadAttempt] = useState(0);
  const [resumeSession, setResumeSession] = useState<LastStudySession | undefined>(undefined);
  const [startCardId, setStartCardId] = useState<string | undefined>(undefined);
  const [seed, setSeed] = useState(0);
  const [activeRegion, setActiveRegion] = useState<RegionFilterId>('all');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [checkpointBusy, setCheckpointBusy] = useState(false);
  const [checkpointFailed, setCheckpointFailed] = useState(false);
  const checkpointBlocked = useRef(false);
  const pendingCheckpoint = useRef<Omit<LastStudySession, 'updatedAt'> | undefined>(undefined);
  const newCardRegion = useRef<RegionFilterId>('all');
  const requestedQueue = useRef<StudyQueueSnapshot | undefined>(undefined);
  const resumeExpectation = useRef<Omit<LastStudySession, 'updatedAt'> | undefined>(undefined);
  const sessionLimits = useRef({ cardLimit: 15, newLimit: 15 });
  const boundedLimits = useRef<StudyQueueSnapshot['limits']>(undefined);
  const [queuedCardIds, setQueuedCardIds] = useState<string[]>([]);
  const sessionScroll = useRef<ScrollView>(null);
  const cardTop = useRef(0);
  const revealNextCard = useRef<number | undefined>(undefined);
  const grading = useRef(false);
  const gradeSettled = useRef<Promise<void>>(Promise.resolve());
  const queueDeckId = useRef<string | undefined>(undefined);
  const [gradeSaving, setGradeSaving] = useState(false);
  const pendingGrade = useRef<AnswerAttempt | undefined>(undefined);
  const learningSession = useRef(createLearningSessionId());
  const [gradeError, setGradeError] = useState<'save' | 'limit' | 'stale' | null>(null);
  const sessionVersion = useRef(0);
  const [daily, setDaily] = useState({ count: 0, target: 10 });

  useEffect(
    () => () => {
      // A deferred checkpoint must not outlive this screen and replace another flow's session.
      sessionVersion.current += 1;
      pendingCheckpoint.current = undefined;
      resumeExpectation.current = undefined;
    },
    [],
  );

  const allCards = useMemo<SearchRow[]>(
    () =>
      (decks || []).flatMap((deck) =>
        (deck.cards || []).map((card) => ({
          deckId: deck.id,
          deckName: getDeckDisplayName(deck),
          card,
        })),
      ),
    [decks],
  );

  const visibleCategories = useMemo(
    () =>
      CATEGORY_DISPLAY.filter((cat) => getDecksForCategory(decks || [], cat.key).length > 0).map(
        (cat) =>
          theme.id === 'classic' ? cat : { ...cat, color: colors.info, bg: colors.infoMuted },
      ),
    [decks, theme, colors],
  );

  const searchResults = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];

    return allCards
      .filter((item) => {
        const haystack = [
          item.card.front,
          item.card.back,
          item.card.example,
          item.deckName,
          (item.card.tags || []).join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 80);
  }, [allCards, q]);

  const resumeDeck = useMemo(
    () =>
      resumeSession && resumeSession.queue?.cardIds.length !== 0
        ? decks.find((deck) => deck.id === resumeSession.deckId)
        : undefined,
    [decks, resumeSession],
  );

  // Snapshot membership/order at session boundaries. Grading changes the provider's
  // eligible queue, but must not remove a card before this screen advances its index.
  const activeDeckId = activeDeck?.id;
  useEffect(() => {
    // Reload can publish replacement decks before its budget read completes.
    // Preserve the imported checkpoint through recovery, including read failure.
    if (gradeError === 'stale') return undefined;
    const externalDeckChange = mode === 'session' && queueDeckId.current !== activeDeckId;
    if (externalDeckChange) {
      dailyPlan.current = undefined;
      // Explicit starts set their owner first; a provider-driven switch is a new intent.
      sessionVersion.current += 1;
      queueDeckId.current = activeDeckId;
      pendingGrade.current = undefined;
      pendingCheckpoint.current = undefined;
      resumeExpectation.current = undefined;
      checkpointBlocked.current = false;
      requestedQueue.current = undefined;
      newCardRegion.current = 'all';
      learningSession.current = createLearningSessionId();
      boundedLimits.current = undefined;
      sessionLimits.current = { cardLimit: 15, newLimit: 15 };
      // Discard the previous deck's failure UI at this external session boundary.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGradeError(null);
    }
    if (!ready || !activeDeck || mode !== 'session') {
      // Snapshot a session at this navigation/storage boundary; grading must not recompute it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQueuedCardIds([]);
      return;
    }
    const eligible =
      activeRegion === 'all' && newCardRegion.current !== 'all'
        ? getStudyBatch(15, { preferredRegion: newCardRegion.current })
        : getStudyBatch(activeRegion === 'all' ? 15 : 100);
    const filtered = eligible.filter((card) =>
      cardMatchesRegion(card, activeRegion, activeDeck.name),
    );
    const preferred =
      !externalDeckChange && startCardId
        ? activeDeck.cards.find(
            (card) =>
              card.id === startCardId && cardMatchesRegion(card, activeRegion, activeDeck.name),
          )
        : undefined;
    const saved = requestedQueue.current;
    requestedQueue.current = undefined;
    const selected = saved
      ? saved.cardIds.flatMap((id) => {
          const card = activeDeck.cards.find((item) => item.id === id);
          return card &&
            (dailyPlan.current ||
              (cardMatchesRegion(card, activeRegion, activeDeck.name) &&
                (isNewCard(card) || card.due <= Date.now())))
            ? [card]
            : [];
        })
      : preferred
        ? [preferred, ...filtered.filter((card) => card.id !== preferred.id)]
        : filtered;
    let newSelected = 0;
    const limited = saved
      ? selected
      : selected.filter((card) => {
          if (!isNewCard(card)) return true;
          return newSelected++ < sessionLimits.current.newLimit;
        });
    const ids = limited
      .slice(0, saved ? 15 : sessionLimits.current.cardLimit)
      .map((card) => card.id);
    setQueuedCardIds(ids);
    setSessionComplete(!!saved && ids.length === 0);
    const queue: StudyQueueSnapshot = {
      schemaVersion: 1,
      cardIds: ids,
      region: activeRegion,
      sessionId: learningSession.current,
      ...(boundedLimits.current ? { limits: { ...boundedLimits.current } } : {}),
    };
    void persistQueueCheckpoint({
      deckId: activeDeck.id,
      ...(ids[0] ? { cardId: ids[0] } : {}),
      queue,
    });
    // Deliberately exclude deck-object/provider-function updates after a grade.
    // Only explicit session boundaries request a new eligible queue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mode, activeDeckId, activeRegion, startCardId, seed]);

  const batch = useMemo(() => {
    const byId = new Map(activeDeck?.cards.map((card) => [card.id, card]));
    return queuedCardIds.flatMap((id) => {
      const queued = byId.get(id);
      return queued ? [queued] : [];
    });
  }, [activeDeck, queuedCardIds]);

  const progress = daily.target > 0 ? Math.min(1, daily.count / daily.target) : 0;
  const remaining = batch.length;
  const card = batch[0];
  const activeDuration = useActiveStudyTime(
    mode === 'session' && card
      ? `${learningSession.current}:${activeDeckId}:${card.id}`
      : undefined,
    !topicBrowserOpen &&
      !checkpointBusy &&
      !checkpointFailed &&
      !gradeSaving &&
      !gradeError &&
      !planOpening &&
      !planOpenError,
  );
  useLayoutEffect(() => {
    if (revealNextCard.current === undefined) return;
    const version = revealNextCard.current;
    revealNextCard.current = undefined;
    if (sessionVersion.current === version)
      sessionScroll.current?.scrollTo({ y: cardTop.current, animated: false });
  }, [queuedCardIds]);

  // Honest per-card scheduling preview for each grade (what Anki does).
  const gradeIntervals = useMemo(() => {
    const labels: Partial<Record<1 | 2 | 4 | 5, string>> = {};
    if (!card) return labels;
    for (const g of GRADES) {
      labels[g.q] = formatIntervalShort(previewInterval(card, g.q));
    }
    return labels;
  }, [card]);
  const deckTitle = activeDeck ? getDeckDisplayName(activeDeck) : '';
  const showResults = searching && q.trim().length > 0;
  const navigationBlocked =
    gradeSaving ||
    gradeError === 'save' ||
    gradeError === 'stale' ||
    checkpointBusy ||
    checkpointFailed ||
    planOpening ||
    planOpenError;
  const hasCurrentSession = mode === 'session' && queueDeckId.current === activeDeckId;

  function openTopicBrowser() {
    if (navigationBlocked || grading.current || pendingGrade.current || checkpointBlocked.current)
      return;
    setQ('');
    setSearching(false);
    setTopicBrowserOpen(true);
  }

  async function continueCurrentSession() {
    if (navigationBlocked || checkpointBlocked.current || !activeDeck) return;
    const version = sessionVersion.current;
    checkpointBlocked.current = true;
    setCheckpointBusy(true);
    try {
      const stored = await getLastStudySession();
      if (version !== sessionVersion.current) return;
      // Validate ownership without rebuilding or rewriting the live queue. A backup
      // restore or another activity may have replaced the checkpoint while browsing.
      if (
        !sameStudySession(stored, {
          deckId: activeDeck.id,
          ...(queuedCardIds[0] ? { cardId: queuedCardIds[0] } : {}),
          queue: {
            schemaVersion: 1,
            cardIds: queuedCardIds,
            region: activeRegion,
            sessionId: learningSession.current,
            ...(boundedLimits.current ? { limits: { ...boundedLimits.current } } : {}),
          },
        })
      )
        setGradeError('stale');
      setResumeLoadError(false);
      setTopicBrowserOpen(false);
    } catch {
      if (version === sessionVersion.current) setResumeLoadError(true);
    } finally {
      if (version === sessionVersion.current) {
        checkpointBlocked.current = false;
        setCheckpointBusy(false);
      }
    }
  }

  const topicBrowserRequest = route.params?.topicBrowserRequest;
  useEffect(() => {
    if (!ready || !topicBrowserRequest) return;
    // Consume once, including when a pending save prevents navigation. A later retry
    // must be an explicit action, not a delayed jump away from the recovery UI.
    nav.setParams({ topicBrowserRequest: undefined });
    openTopicBrowser();
    // The request is an event; changes to save status must not replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, topicBrowserRequest]);

  useEffect(() => {
    if (!ready) return undefined;
    let mounted = true;
    const version = sessionVersion.current;
    // A fresh storage read replaces the previous attempt and its error status.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResumeLoadError(false);
    Promise.all([getLastStudySession(), readDailyPlan()]).then(
      ([session, plan]) => {
        if (mounted && version === sessionVersion.current) {
          const linked =
            plan?.phase === 'review' &&
            plan.review?.session.queue?.sessionId === session?.queue?.sessionId &&
            plan.review?.session.deckId === session?.deckId;
          setResumeSession(linked ? plan!.review!.session : session);
          setResumePlanId(linked ? plan!.id : undefined);
        }
      },
      () => {
        if (mounted && version === sessionVersion.current) setResumeLoadError(true);
      },
    );
    return () => {
      mounted = false;
    };
  }, [ready, resumeLoadAttempt]);

  useEffect(() => {
    if (!ready || !activeDeck || mode !== 'session') return undefined;
    let mounted = true;
    getDailyProgress().then((dp) => {
      if (mounted) setDaily({ count: dp.count, target: dp.target });
    });
    return () => {
      mounted = false;
    };
  }, [activeDeck, mode, ready]);

  async function persistQueueCheckpoint(payload: Omit<LastStudySession, 'updatedAt'>) {
    const version = sessionVersion.current;
    const planId = dailyPlan.current;
    const expected = resumeExpectation.current;
    pendingCheckpoint.current = payload;
    checkpointBlocked.current = true;
    setCheckpointBusy(true);
    setCheckpointFailed(false);
    try {
      // Grades enter the history coordinator before durable storage. Do not let a
      // newer deck checkpoint jump that queue and then be overwritten by the grade.
      await gradeSettled.current;
      if (version !== sessionVersion.current || pendingCheckpoint.current !== payload) return;
      const saved = expected
        ? await saveResumedStudySession(payload, expected)
        : await saveLastStudySession(payload);
      if (version === sessionVersion.current && pendingCheckpoint.current === payload) {
        setResumeSession(saved);
        setResumePlanId(planId);
        setResumeLoadError(false);
        pendingCheckpoint.current = undefined;
        resumeExpectation.current = undefined;
        checkpointBlocked.current = false;
      }
    } catch (error) {
      if (version === sessionVersion.current) {
        if (error instanceof StaleStudySessionError) {
          pendingCheckpoint.current = undefined;
          resumeExpectation.current = undefined;
          checkpointBlocked.current = false;
          setCheckpointFailed(false);
          setGradeError('stale');
        } else setCheckpointFailed(true);
      }
    } finally {
      if (version === sessionVersion.current) setCheckpointBusy(false);
    }
  }

  function startSession(
    deckId: string,
    cardId?: string,
    saved?: LastStudySession,
    limits?: { cardLimit?: unknown; newLimit?: unknown; preferredRegion?: unknown },
    planId?: string,
    intent: 'study' | 'plan' = 'study',
  ) {
    if (
      grading.current ||
      pendingGrade.current ||
      checkpointBlocked.current ||
      (openingPlan.current && !planId)
    )
      return false;
    if (
      planId &&
      (!saved?.queue ||
        saved.queue.cardIds.some(
          (id) => !decks.find((deck) => deck.id === deckId)?.cards.some((card) => card.id === id),
        ))
    ) {
      setPlanOpenError(true);
      return false;
    }
    dailyPlan.current = planId;
    sessionVersion.current += 1;
    queueDeckId.current = deckId;
    pendingGrade.current = undefined;
    requestedQueue.current = saved?.queue;
    // Explicit plan opening owns its separately persisted plan session.
    // Ordinary Continue must still match the global checkpoint it selected.
    resumeExpectation.current = saved && intent === 'study' ? copySessionInput(saved) : undefined;
    newCardRegion.current =
      !saved && REGION_FILTERS.some((region) => region.id === limits?.preferredRegion)
        ? (limits!.preferredRegion as RegionFilterId)
        : 'all';
    const validLimit = (value: unknown, minimum: number) =>
      typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= 15;
    const requestedLimits = {
      cardLimit: validLimit(limits?.cardLimit, 1) ? (limits!.cardLimit as number) : 15,
      newLimit: validLimit(limits?.newLimit, 0) ? (limits!.newLimit as number) : 15,
    };
    boundedLimits.current = saved?.queue?.limits
      ? { ...saved.queue.limits }
      : validLimit(limits?.cardLimit, 1) || validLimit(limits?.newLimit, 0)
        ? requestedLimits
        : undefined;
    sessionLimits.current = boundedLimits.current ?? { cardLimit: 15, newLimit: 15 };
    learningSession.current = saved?.queue?.sessionId ?? createLearningSessionId();
    checkpointBlocked.current = true;
    setCheckpointBusy(true);
    setCheckpointFailed(false);
    setSessionComplete(false);
    setGradeError(null);
    setSeed((value) => value + 1);
    setActiveDeckId(deckId);
    setStartCardId(cardId);
    setActiveRegion(saved?.queue?.region ?? 'all');
    setMode('session');
    setTopicBrowserOpen(false);
    return true;
  }

  const requestedPlanId = route.params?.dailyPlanId;
  useEffect(() => {
    if (!ready || !requestedPlanId) return undefined;
    let cancelled = false;
    openingPlan.current = true;
    // This navigation boundary starts the asynchronous persisted-plan read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlanOpening(true);
    setPlanOpenError(false);
    void (async () => {
      try {
        await gradeSettled.current;
        const plan = await readDailyPlan();
        if (cancelled) return;
        if (!plan || plan.id !== requestedPlanId) throw new Error('Plan unavailable');
        if (pendingGrade.current || grading.current || checkpointBlocked.current)
          throw new Error('Pending study write');
        if (plan.phase !== 'review') {
          nav.navigate('DailyPlan', { planId: plan.id });
        } else {
          const session = plan.review!.session;
          const deck = decks.find((deck) => deck.id === session.deckId);
          if (
            !deck ||
            session.queue!.cardIds.some((id) => !deck.cards.some((card) => card.id === id))
          )
            throw new Error('Plan cards unavailable');
          if (!startSession(session.deckId, session.cardId, session, undefined, plan.id, 'plan'))
            throw new Error('Study busy');
        }
        nav.setParams({ dailyPlanId: undefined });
      } catch {
        if (!cancelled) setPlanOpenError(true);
      } finally {
        if (!cancelled) {
          openingPlan.current = false;
          setPlanOpening(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      openingPlan.current = false;
    };
    // The request freezes one exact plan; provider changes must not reopen it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, requestedPlanId, planOpenAttempt]);

  // Onboarding hands off with an autoStartDeckId param so the very first
  // session begins immediately instead of landing on the browse view.
  const autoStartDeckId = route.params?.autoStartDeckId;
  useEffect(() => {
    if (!ready || !autoStartDeckId) return;
    if (decks?.some((deck) => deck.id === autoStartDeckId)) {
      // Consume the external onboarding/review handoff once, before checkpointing.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startSession(autoStartDeckId, undefined, undefined, {
        cardLimit: route.params?.sessionCardLimit,
        newLimit: route.params?.sessionNewLimit,
        preferredRegion: route.params?.sessionPreferredRegion,
      });
    }
    nav.setParams({
      autoStartDeckId: undefined,
      sessionCardLimit: undefined,
      sessionNewLimit: undefined,
      sessionPreferredRegion: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, autoStartDeckId]);

  function handleCategoryPress(catKey: CategoryKey) {
    const deck = getPreferredDeckForCategory(decks || [], catKey);
    if (deck) startSession(deck.id);
  }

  function changeRegion(region: RegionFilterId) {
    if (
      (region === activeRegion && newCardRegion.current === 'all' && !dailyPlan.current) ||
      openingPlan.current ||
      grading.current ||
      pendingGrade.current ||
      checkpointBlocked.current
    )
      return;
    sessionVersion.current += 1;
    pendingGrade.current = undefined;
    learningSession.current = createLearningSessionId();
    setGradeError(null);
    checkpointBlocked.current = true;
    setCheckpointBusy(true);
    setCheckpointFailed(false);
    setStartCardId(undefined);
    newCardRegion.current = 'all';
    dailyPlan.current = undefined;
    setSeed((value) => value + 1);
    setActiveRegion(region);
  }

  async function grade(qValue: 0 | 1 | 2 | 3 | 4 | 5) {
    const currentCard = batch[0];
    if (
      !currentCard ||
      !activeDeck ||
      grading.current ||
      gradeError === 'stale' ||
      checkpointBlocked.current ||
      openingPlan.current ||
      (planOpenError && !pendingGrade.current)
    )
      return;
    grading.current = true;
    let finishGrade!: () => void;
    gradeSettled.current = new Promise<void>((resolve) => {
      finishGrade = resolve;
    });
    setGradeSaving(true);
    const version = sessionVersion.current;
    const nextCard = batch[1];
    const attempt = pendingGrade.current ?? {
      attemptId: createLearningSessionId(),
      sessionId: learningSession.current,
      cardId: currentCard.id,
      quality: qValue,
      durationMs: activeDuration(),
      context: {
        deckId: activeDeck.id,
        front: currentCard.front,
        back: currentCard.back,
        example: currentCard.example,
        session: {
          deckId: activeDeck.id,
          cardId: queuedCardIds[0],
          queue: {
            schemaVersion: 1 as const,
            cardIds: [...queuedCardIds],
            region: activeRegion,
            sessionId: learningSession.current,
            ...(boundedLimits.current ? { limits: { ...boundedLimits.current } } : {}),
          },
        },
      },
      ...(dailyPlan.current ? { planId: dailyPlan.current } : {}),
      nextSession: {
        deckId: activeDeck.id,
        ...(nextCard ? { cardId: nextCard.id } : {}),
        queue: {
          schemaVersion: 1 as const,
          cardIds: batch.slice(1).map((card) => card.id),
          region: activeRegion,
          sessionId: learningSession.current,
          ...(boundedLimits.current ? { limits: { ...boundedLimits.current } } : {}),
        },
      },
    };
    pendingGrade.current = attempt;
    try {
      await recordAnswer(attempt.cardId, attempt.quality, {
        attemptId: attempt.attemptId,
        sessionId: attempt.sessionId,
        durationMs: attempt.durationMs,
        context: attempt.context,
        ...(attempt.planId ? { planId: attempt.planId } : {}),
        nextSession: attempt.nextSession,
      });
      const nextDP = await getDailyProgress();
      if (pendingGrade.current === attempt) pendingGrade.current = undefined;
      if (sessionVersion.current !== version) return;
      setGradeError(null);
      setDaily({ count: nextDP.count, target: nextDP.target });
      setResumeSession({ ...attempt.nextSession!, updatedAt: Date.now() });
      setResumePlanId(attempt.planId);
      revealNextCard.current = version;
      setQueuedCardIds(attempt.nextSession?.queue?.cardIds ?? []);
      if (!nextCard) setSessionComplete(true);
    } catch (error) {
      if (sessionVersion.current === version) {
        if (error instanceof DailyNewCardLimitError || error instanceof StaleGradeError)
          pendingGrade.current = undefined;
        setGradeError(
          error instanceof StaleGradeError
            ? 'stale'
            : error instanceof DailyNewCardLimitError
              ? 'limit'
              : 'save',
        );
      }
    } finally {
      grading.current = false;
      setGradeSaving(false);
      finishGrade();
    }
  }

  async function reloadStaleStudy() {
    if (grading.current) return;
    grading.current = true;
    setGradeSaving(true);
    try {
      const [, session, plan] = await Promise.all([
        reload({ requireFreshBudget: true }),
        getLastStudySession(),
        readDailyPlan(),
      ]);
      const linked =
        plan?.phase === 'review' &&
        plan.review?.session.queue?.sessionId === session?.queue?.sessionId &&
        plan.review?.session.deckId === session?.deckId;
      setResumeSession(linked ? plan!.review!.session : session);
      setResumePlanId(linked ? plan!.id : undefined);
      setResumeLoadError(false);
      setGradeError(null);
      setMode('landing');
    } catch {
      setGradeError('stale');
    } finally {
      grading.current = false;
      setGradeSaving(false);
    }
  }

  const planStatus = planOpening ? (
    <Text style={{ color: colors.textPrimary }}>{t('common.loading')}</Text>
  ) : planOpenError ? (
    <View style={styles.saveError}>
      <Text accessibilityRole="alert" style={{ color: colors.textPrimary }}>
        {t('plan.openError')}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          nav.setParams({ dailyPlanId: requestedPlanId ?? resumePlanId });
          setPlanOpenAttempt((value) => value + 1);
        }}
      >
        <Text style={{ color: colors.brand }}>{t('mission.retry')}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => nav.navigate('DailyPlan', { planId: requestedPlanId ?? resumePlanId })}
      >
        <Text style={{ color: colors.brand }}>{t('plan.manage')}</Text>
      </Pressable>
    </View>
  ) : null;

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        {planStatus}
        <View style={styles.center}>
          <Text style={styles.loadingEmoji}>📖</Text>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeDeck) {
    return (
      <SafeAreaView style={styles.wrap}>
        {planStatus}
        <View style={styles.center}>
          <Text style={styles.noDeckEmoji}>🇨🇴</Text>
          <Text style={styles.noDeckTitle}>{t('study.noDeck.title')}</Text>
          <Text style={styles.noDeckSub}>{t('study.noDeck.sub')}</Text>
          <Pressable style={styles.goHomeBtn} onPress={() => nav.navigate('Home')}>
            <Text style={styles.goHomeBtnText}>{t('study.goHome')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === 'landing' || topicBrowserOpen) {
    return (
      <SafeAreaView style={styles.wrap}>
        {planStatus}
        <ScrollView
          key={fontScale}
          contentContainerStyle={styles.landingScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.landingHeader}>
            <Text style={styles.landingTitle}>{t('study.topics.title')}</Text>
          </View>

          {hasCurrentSession && (
            <Pressable
              accessibilityRole="button"
              disabled={navigationBlocked}
              style={[styles.resumeCard, largeText && styles.stacked]}
              onPress={() => void continueCurrentSession()}
            >
              <View style={[styles.resumeTextBlock, largeText && styles.noFlex]}>
                <Text style={styles.resumeDeckName}>
                  {t('study.topics.current', { topic: deckTitle })}
                </Text>
              </View>
              <Text style={styles.resumeCta}>{t('study.topics.continue')}</Text>
            </Pressable>
          )}

          {hasCurrentSession && resumeLoadError && (
            <Text accessibilityRole="alert" style={styles.resumeEmptyText}>
              {t('study.resume.loadError')}
            </Text>
          )}

          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <ThemedTextInput
              value={q}
              onChangeText={(text) => {
                setQ(text);
                setSearching(true);
              }}
              onFocus={() => setSearching(true)}
              onBlur={() => {
                if (!q.trim()) setSearching(false);
              }}
              placeholder={t('browse.searchPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {q.length > 0 && (
              <Pressable
                onPress={() => {
                  setQ('');
                  setSearching(false);
                }}
              >
                <Text style={styles.clearBtn}>✕</Text>
              </Pressable>
            )}
          </View>

          {showResults ? (
            <>
              <Text style={styles.sectionTitle}>
                {t('browse.results', {
                  count: searchResults.length,
                  plural: searchResults.length === 1 ? '' : 's',
                })}
              </Text>
              {searchResults.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyEmoji}>🤔</Text>
                  <Text style={styles.emptyText}>{t('browse.emptySearch', { query: q })}</Text>
                </View>
              ) : (
                searchResults.map((item) => (
                  <Pressable
                    key={`${item.deckId}-${item.card.id}`}
                    style={styles.resultRow}
                    onPress={() => startSession(item.deckId, item.card.id)}
                  >
                    <View style={styles.resultLeft}>
                      <Text style={styles.resultFront}>{item.card.front}</Text>
                      <Text style={styles.resultBack}>{item.card.back}</Text>
                      {item.card.example ? (
                        <Text style={styles.resultExample}>"{item.card.example}"</Text>
                      ) : null}
                      <Text style={styles.resultMeta}>
                        {item.deckName}
                        {item.card.tags?.length
                          ? ` • ${item.card.tags.slice(0, 2).join(', ')}`
                          : ''}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.speakBtn,
                        theme.id === 'barrio' && { backgroundColor: colors.audioSurface },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`${t('common.listen')}: ${item.card.front}`}
                      onPress={() => void speakCard(item.card)}
                    >
                      {theme.id === 'classic' ? (
                        <Text style={styles.speakIcon}>🔊</Text>
                      ) : (
                        <ThemeIcon name="audio" size={16} color={colors.audioText} />
                      )}
                    </Pressable>
                  </Pressable>
                ))
              )}
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('browse.categories')}</Text>
              </View>
              <View style={styles.catGrid}>
                {visibleCategories.map((cat) => (
                  <Pressable
                    key={cat.key}
                    accessibilityRole="button"
                    accessibilityLabel={t(cat.labelKey)}
                    accessibilityState={{
                      selected: hasCurrentSession && getCategoryForDeck(activeDeck) === cat.key,
                    }}
                    style={[
                      styles.catCard,
                      largeText && styles.catCardExpanded,
                      {
                        backgroundColor: cat.bg,
                        borderColor: theme.id === 'classic' ? cat.color + '66' : cat.color,
                      },
                    ]}
                    onPress={() => handleCategoryPress(cat.key)}
                  >
                    <Text style={styles.catEmoji} allowFontScaling={false} accessible={false}>
                      {cat.emoji}
                    </Text>
                    <Text
                      style={[
                        styles.catLabel,
                        largeText && styles.catLabelExpanded,
                        { color: cat.color },
                      ]}
                      numberOfLines={largeText ? undefined : 2}
                    >
                      {t(cat.labelKey)}
                    </Text>
                    {hasCurrentSession && getCategoryForDeck(activeDeck) === cat.key && (
                      <Text style={[styles.catLabel, { color: cat.color }]}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>

              {!hasCurrentSession && (
                <View style={styles.resumeBlock}>
                  <Text style={styles.sectionTitle}>{t('study.resume.title')}</Text>
                  {resumeLoadError ? (
                    <View style={styles.resumeEmptyCard}>
                      <Text accessibilityRole="alert" style={styles.resumeEmptyText}>
                        {t('study.resume.loadError')}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setResumeLoadAttempt((value) => value + 1)}
                      >
                        <Text style={styles.resumeCta}>{t('study.resume.retry')}</Text>
                      </Pressable>
                    </View>
                  ) : resumeDeck ? (
                    <Pressable
                      style={[styles.resumeCard, largeText && styles.stacked]}
                      onPress={() =>
                        startSession(
                          resumeDeck.id,
                          resumeSession?.cardId,
                          resumeSession,
                          undefined,
                          resumePlanId,
                        )
                      }
                    >
                      <View style={[styles.resumeTextBlock, largeText && styles.noFlex]}>
                        <Text style={styles.resumeDeckName}>{getDeckDisplayName(resumeDeck)}</Text>
                        <Text style={styles.resumeDeckMeta}>
                          {resumeDeck.cards.length} {t('common.cards')}
                        </Text>
                      </View>
                      <Text style={styles.resumeCta}>{t('study.resume.cta')}</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.resumeEmptyCard}>
                      <Text style={styles.resumeEmptyText}>{t('study.resume.empty')}</Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      {planStatus}
      <ScrollView
        ref={sessionScroll}
        contentContainerStyle={styles.sessionScroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        directionalLockEnabled
      >
        <View
          key={`header-${fontScale}`}
          style={[styles.sessionHeader, largeText && styles.stacked]}
        >
          <Pressable
            accessibilityRole="button"
            style={styles.sessionBackBtn}
            disabled={navigationBlocked}
            onPress={() => {
              if (
                !navigationBlocked &&
                !grading.current &&
                !pendingGrade.current &&
                !checkpointBlocked.current
              )
                nav.navigate('Home');
            }}
          >
            <Text style={styles.sessionBackText}>{t('tabs.home')}</Text>
          </Pressable>
          <Text style={styles.sessionEyebrow}>{t('tabs.study')}</Text>
          <View style={[styles.studyHeaderActions, largeText && styles.wrapped]}>
            {card && (
              <Pressable
                style={styles.favoriteBtn}
                accessibilityLabel={
                  card.favorite ? t('study.favorite.remove') : t('study.favorite.save')
                }
                onPress={() => toggleFavorite(card.id)}
              >
                <Text allowFontScaling={false} accessible={false} style={styles.favoriteBtnText}>
                  {card.favorite ? '★' : '☆'}
                </Text>
              </Pressable>
            )}
            <View style={styles.cardsLeftPill}>
              <Text style={styles.cardsLeftText}>{t('study.cardsLeft', { count: remaining })}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.deckTitleRow, styles.wrapped]}>
          <Text allowFontScaling={false} accessible={false} style={styles.deckPillFlag}>
            🇨🇴
          </Text>
          <Text style={styles.deckTitle}>{deckTitle}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={navigationBlocked}
            style={styles.sessionBackBtn}
            onPress={openTopicBrowser}
          >
            <Text style={styles.sessionBackText}>{t('study.topics.change')}</Text>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <View testID="region-filters" style={styles.regionRow}>
          {REGION_FILTERS.map((region) => (
            <Pressable
              key={region.id}
              accessibilityRole="button"
              accessibilityState={{
                selected: activeRegion === region.id,
                disabled:
                  gradeSaving ||
                  gradeError === 'save' ||
                  gradeError === 'stale' ||
                  checkpointBusy ||
                  checkpointFailed ||
                  planOpening ||
                  planOpenError,
              }}
              disabled={
                gradeSaving ||
                gradeError === 'save' ||
                gradeError === 'stale' ||
                checkpointBusy ||
                checkpointFailed ||
                planOpening ||
                planOpenError
              }
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

        <View key={`hints-${fontScale}`} style={styles.swipeHints}>
          <Text style={styles.swipeTap}>{t('study.hint.flip')}</Text>
          <Text style={styles.swipeHard}>{t('study.hint.hard')}</Text>
          <Text style={styles.swipeEasy}>{t('study.hint.easy')}</Text>
        </View>

        {card ? (
          <View
            testID="study-card-area"
            style={styles.cardArea}
            onLayout={(event) => {
              cardTop.current = event.nativeEvent.layout.y;
            }}
          >
            <Flashcard key={card.id} card={card} onGrade={grade} expandForLargeText />
            {isVerb(card) && <ConjugationPanel infinitive={card.front} />}
          </View>
        ) : (
          <View style={[styles.cardArea, styles.center]}>
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text style={styles.noDeckTitle}>
              {t(sessionComplete ? 'study.sessionComplete.title' : 'study.caughtUp.title')}
            </Text>
            <Text style={styles.noDeckSub}>
              {t(sessionComplete ? 'study.sessionComplete.sub' : 'study.caughtUp.sub')}
            </Text>
            <Pressable
              style={styles.quizCta}
              onPress={() =>
                dailyPlan.current
                  ? nav.navigate('DailyPlan', { planId: dailyPlan.current })
                  : nav.navigate('Quiz')
              }
            >
              <Text style={styles.quizCtaText}>
                {t(dailyPlan.current ? 'plan.continue' : 'study.takeQuiz')}
              </Text>
            </Pressable>
          </View>
        )}

        {checkpointFailed && (
          <View style={styles.saveError}>
            <Text accessibilityRole="alert" style={{ color: colors.textPrimary }}>
              {t('study.checkpointError')}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={checkpointBusy}
              onPress={() => {
                if (pendingCheckpoint.current)
                  void persistQueueCheckpoint(pendingCheckpoint.current);
              }}
            >
              <Text style={{ color: colors.brand }}>{t('practice.retrySave')}</Text>
            </Pressable>
          </View>
        )}
        {gradeError && (
          <View style={styles.saveError}>
            <Text accessibilityRole="alert" style={{ color: colors.textPrimary }}>
              {t(
                gradeError === 'stale'
                  ? 'practice.staleGrade'
                  : gradeError === 'limit'
                    ? 'practice.newLimit'
                    : 'practice.saveError',
              )}
            </Text>
            {gradeError === 'stale' && (
              <Pressable
                accessibilityRole="button"
                disabled={gradeSaving}
                style={{ minHeight: 48, minWidth: 48, justifyContent: 'center' }}
                onPress={reloadStaleStudy}
              >
                <Text style={{ color: colors.brand }}>{t('practice.reloadCards')}</Text>
              </Pressable>
            )}
            {gradeError === 'save' && (
              <Pressable
                accessibilityRole="button"
                onPress={() => grade(pendingGrade.current?.quality ?? 1)}
              >
                <Text style={{ color: colors.brand }}>{t('practice.retrySave')}</Text>
              </Pressable>
            )}
          </View>
        )}
        <View key={`grades-${fontScale}`} style={styles.gradeBar}>
          <Text style={styles.gradeLabel}>{t('study.gradePrompt')}</Text>
          <View style={[styles.gradeButtons, largeText && styles.stacked]}>
            {grades.map((g) => (
              <Pressable
                key={g.labelKey}
                style={[
                  styles.gradeBtn,
                  largeText && styles.noFlex,
                  { backgroundColor: g.bg, borderColor: g.border },
                ]}
                onPress={() => grade(g.q)}
                disabled={
                  !card ||
                  gradeSaving ||
                  !!gradeError ||
                  checkpointBusy ||
                  checkpointFailed ||
                  planOpening ||
                  planOpenError
                }
              >
                <Text style={[styles.gradeBtnLabel, { color: g.color }]}>{t(g.labelKey)}</Text>
                <Text
                  style={[
                    styles.gradeBtnInterval,
                    { color: theme.id === 'classic' ? g.color + 'b3' : g.color },
                  ]}
                >
                  {gradeIntervals[g.q] ?? ''}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    sessionScroll: { flexGrow: 1, paddingBottom: 16 },
    stacked: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
    noFlex: { flex: 0 },
    wrapped: { flexWrap: 'wrap' },
    saveError: { padding: 12, gap: 8 },
    wrap: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 },

    loadingEmoji: { fontSize: 40 },
    loadingText: { color: colors.textSecondary, fontSize: 16 },

    noDeckEmoji: { fontSize: 48 },
    noDeckTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    noDeckSub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
    goHomeBtn: {
      marginTop: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.brand,
    },
    goHomeBtnText: { color: colors.onBrand, fontWeight: '800', fontSize: 14 },

    landingScroll: { padding: 16, paddingBottom: 120 },
    landingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    landingTitle: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    searchIcon: { fontSize: 16 },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '500',
    },
    clearBtn: { color: colors.textSecondary, fontSize: 14, paddingHorizontal: 4 },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    catCard: {
      width: '31%',
      minHeight: 80,
      borderRadius: 16,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: 8,
    },
    catCardExpanded: { width: '100%', padding: 16 },
    catLabelExpanded: { fontSize: 14, lineHeight: 19 },
    catEmoji: { fontSize: 22 },
    catLabel: {
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 13,
    },
    emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
    emptyEmoji: { fontSize: 40 },
    emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
    },
    resultLeft: { flex: 1, gap: 2 },
    resultFront: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
    resultBack: { color: colors.textSecondary, fontSize: 13 },
    resultExample: {
      color: colors.textTertiary,
      fontStyle: 'italic',
      fontSize: 12,
      marginTop: 2,
    },
    resultMeta: { color: colors.textTertiary, fontSize: 11, marginTop: 4 },
    speakBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accentBlue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    speakIcon: { fontSize: 16 },
    resumeBlock: { gap: 10 },
    resumeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
    },
    resumeTextBlock: { flex: 1, minWidth: 0 },
    resumeDeckName: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
    resumeDeckMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
    resumeCta: { color: colors.brand, fontSize: 13, fontWeight: '900' },
    resumeEmptyCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
    },
    resumeEmptyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },

    progressTrack: {
      height: 8,
      backgroundColor: colors.neutralWash,
      borderRadius: 999,
      marginHorizontal: 18,
      marginBottom: 12,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.brand,
      borderRadius: 999,
    },

    sessionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 10,
      gap: 10,
    },
    sessionBackBtn: {
      minHeight: 48,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      paddingHorizontal: 10,
      borderRadius: 17,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.neutralEdge,
    },
    sessionBackText: { color: colors.brand, fontSize: 12, fontWeight: '900' },
    sessionEyebrow: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    deckTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginHorizontal: 18,
      marginBottom: 12,
    },
    studyHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 1,
    },
    favoriteBtn: {
      width: 48,
      height: 48,
      borderRadius: 17,
      backgroundColor: colors.highlightWash,
      borderWidth: 1.5,
      borderColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    favoriteBtnText: {
      color: colors.brand,
      fontSize: 22,
      fontWeight: '800',
      lineHeight: 24,
    },
    deckPillFlag: { fontSize: 20, marginTop: 2 },
    deckTitle: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '900',
      flexShrink: 1,
    },
    cardsLeftPill: {
      flexShrink: 1,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.selectedWash,
      borderWidth: 1.5,
      borderColor: colors.brand,
    },
    cardsLeftText: { color: colors.brand, fontSize: 13, fontWeight: '800' },

    regionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 18,
      marginBottom: 12,
    },
    regionChip: {
      minHeight: 44,
      maxWidth: '100%',
      paddingVertical: 8,
      justifyContent: 'center',
      paddingHorizontal: 13,
      borderRadius: 17,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.neutralEdge,
    },
    regionChipActive: {
      backgroundColor: colors.regionFill,
      borderColor: colors.regionEdge,
    },
    regionChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '800' },
    regionChipTextActive: { color: colors.regionInk, fontWeight: '900' },
    swipeHints: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    swipeHard: { color: colors.swipeHardInk, fontSize: 12, fontWeight: '800', flex: 1 },
    swipeTap: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      width: '100%',
      textAlign: 'center',
    },
    swipeEasy: {
      color: colors.swipeEasyInk,
      fontSize: 12,
      fontWeight: '800',
      flex: 1,
      textAlign: 'right',
    },

    cardArea: {
      flexGrow: 1,
      flexShrink: 0,
      paddingHorizontal: 18,
      gap: 10,
    },
    quizCta: {
      marginTop: 6,
      minHeight: 44,
      borderRadius: 14,
      paddingHorizontal: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.brand,
    },
    quizCtaText: { color: colors.textInverse, fontSize: 14, fontWeight: '900' },

    gradeBar: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.dividerEdge,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      gap: 10,
    },
    gradeLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '800',
      textAlign: 'center',
    },
    gradeButtons: { flexDirection: 'row', gap: 8 },
    gradeBtn: {
      flex: 1,
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingVertical: 9,
      borderRadius: 16,
      borderWidth: 1.5,
    },
    gradeBtnLabel: { fontSize: 14, fontWeight: '800' },
    gradeBtnInterval: { fontSize: 10 },
  });
