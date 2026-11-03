import Pressable from '../components/ThemedPressable';
import { controlSurface, controlText } from '../styles/controlStates';
import ThemedTextInput from '../components/ThemedTextInput';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import { useActiveStudyTime } from '../hooks/useActiveStudyTime';
import { isTimedResponse } from '../missions/activeTiming';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SHOW_REVIEW_TOOLS } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { useDeck } from '../hooks/useDeck';
import { FIRST_MORNING } from '../missions/firstMorning';
import MissionAudio from '../components/MissionAudio';
import { pronunciationAudio } from '../data/audioManifest';
import { LocalizedText, MissionPack, validateMission } from '../missions/schema';
import { MissionCommand, MissionRun } from '../missions/engine';
import { applyMissionCommand, loadMissionRun, startMissionRun } from '../storage/missions';
import MissionFollowUp from '../components/MissionFollowUp';
import type { MissionStorageAdapter } from '../missions/storageAdapter';
import type { FlashCard } from '../types';

type Pending = (
  | { kind: 'start'; id: string; at: number; expectedRunId?: string }
  | { kind: 'command'; command: MissionCommand }
  | { kind: 'warmup'; runId: string }
) & { persistence?: MissionStorageAdapter };
const identity = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export default function MissionScreen({
  pack = FIRST_MORNING,
  planId,
  planRunId,
  onCompleted,
  onSavingChange,
  footer,
  blocked = false,
  adapter,
  availability,
  eyebrow,
  notice,
  startLabel,
  warmupCards,
  renderCompletion,
}: {
  pack?: MissionPack;
  planId?: string;
  planRunId?: string;
  onCompleted?: () => void;
  onSavingChange?: (saving: boolean) => void;
  footer?: React.ReactNode;
  blocked?: boolean;
  adapter?: MissionStorageAdapter;
  availability?: boolean;
  eyebrow?: string;
  notice?: string;
  startLabel?: string;
  warmupCards?: FlashCard[];
  renderCompletion?: (run: MissionRun) => React.ReactNode;
} = {}) {
  const styles = useThemedStyles(makeStyles);
  const { fontScale, width } = useWindowDimensions();
  const { language, t } = useLanguage();
  const nav = useNavigation<any>();
  const { ready, decks } = useDeck();
  const [reviewing, setReviewing] = useState(false);
  const [warmupOpen, setWarmupOpen] = useState(false);
  const [run, setRun] = useState<MissionRun>();
  const [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);
  const [answer, setAnswer] = useState(''),
    [saving, setSaving] = useState(false),
    [saveError, setSaveError] = useState(false),
    [restart, setRestart] = useState(false);
  const mounted = useRef(true),
    busy = useRef(false),
    pending = useRef<Pending | undefined>(undefined),
    generation = useRef(0),
    startedAt = useRef(0);
  const expectedRun = useRef<string | undefined>(undefined);
  const timingContinuous = useRef(false);
  const timedResponse = isTimedResponse(pack);
  const content = useRef<ScrollView>(null);
  const focusedResponse = useRef<string | undefined>(undefined);
  const responseIdentity =
    run && !run.feedback && !run.completed ? `${run.id}:${run.nodeId}` : undefined;
  const layoutKey = `${responseIdentity}:${fontScale}:${width}`;
  const responseLayout = useRef<{ key: string; cardY?: number; inputY?: number }>({ key: '' });
  const revealResponse = useCallback(() => {
    const layout = responseLayout.current;
    if (
      !responseIdentity ||
      focusedResponse.current !== responseIdentity ||
      layout.key !== layoutKey ||
      layout.cardY === undefined ||
      layout.inputY === undefined
    )
      return;
    content.current?.scrollTo({
      y: Math.max(0, layout.cardY + layout.inputY - 16),
      animated: false,
    });
  }, [responseIdentity, layoutKey]);
  const recordResponseLayout = (part: 'cardY' | 'inputY', y: number) => {
    const previous = responseLayout.current;
    responseLayout.current = {
      ...(previous.key === layoutKey ? previous : {}),
      key: layoutKey,
      [part]: y,
    };
    revealResponse();
  };
  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', revealResponse);
    return () => shown.remove();
  }, [revealResponse]);
  useEffect(() => {
    if (planId && run?.completed && !contentChanged) onCompleted?.();
  }, [planId, run?.completed, contentChanged, onCompleted]);
  const listening = pack.nodes.some((node) => node.kind === 'listening');
  const local = (value: LocalizedText) => value[language];
  const available = useMemo(() => {
    if (availability !== undefined) return ready && availability;
    if (!SHOW_REVIEW_TOOLS || !ready) return false;
    try {
      validateMission(pack, {
        cards: new Map(decks.flatMap((d) => d.cards.map((c) => [c.id, d.id] as [string, string]))),
        mediaIds: new Set(Object.keys(pronunciationAudio)),
        transcripts: new Map(
          decks.flatMap((d) => d.cards.map((c) => [c.id, c.front] as [string, string])),
        ),
        missionIds: new Set(),
      });
      return true;
    } catch {
      return false;
    }
  }, [ready, decks, pack, availability]);
  const readActiveTime = useActiveStudyTime(
    timedResponse && run ? `${run.id}:${run.nodeId}:${run.revision}` : undefined,
    available &&
      !loading &&
      !loadError &&
      !contentChanged &&
      !saving &&
      !saveError &&
      !blocked &&
      !!run &&
      !run.completed &&
      !run.feedback,
  );
  const persistence = useMemo<MissionStorageAdapter>(
    () =>
      adapter ?? {
        load: () => (planId ? loadMissionRun(pack, planId) : loadMissionRun(pack)),
        start: (id, at, expectedRunId) => startMissionRun(pack, id, at, expectedRunId, planId),
        apply: (command) => applyMissionCommand(pack, command, planId),
      },
    [adapter, pack, planId],
  );
  const load = useCallback(async () => {
    const request = ++generation.current;
    try {
      const result = await persistence.load();
      if (mounted.current && request === generation.current) {
        timingContinuous.current = !result.run || !!result.run.feedback || result.run.completed;
        setLoadError(false);
        setRun(result.run);
        expectedRun.current = result.expectedRunId ?? result.run?.id;
        setContentChanged(result.contentChanged);
        startedAt.current = Date.now();
      }
    } catch {
      if (mounted.current && request === generation.current) setLoadError(true);
    } finally {
      if (mounted.current && request === generation.current) setLoading(false);
    }
  }, [persistence]);
  useEffect(() => {
    mounted.current = true;
    // Mission availability starts an asynchronous persisted-run read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (available) void load();
    return () => {
      mounted.current = false;
    };
  }, [available, load]);
  useEffect(() => {
    if (!adapter) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !busy.current && !pending.current) void load();
    });
    return () => subscription.remove();
  }, [adapter, load]);
  const execute = async (intent: Pending) => {
    if (busy.current || blocked) return;
    busy.current = true;
    generation.current++;
    onSavingChange?.(true);
    const boundPersistence = intent.persistence ?? persistence;
    pending.current = { ...intent, persistence: boundPersistence };
    setSaving(true);
    setSaveError(false);
    try {
      const next =
        intent.kind === 'start'
          ? await boundPersistence.start(intent.id, intent.at, intent.expectedRunId)
          : intent.kind === 'warmup'
            ? await boundPersistence.warmup!(intent.runId)
            : await boundPersistence.apply(intent.command);
      pending.current = undefined;
      if (mounted.current) {
        if (intent.kind === 'start') {
          timingContinuous.current = true;
          setWarmupOpen(false);
          setReviewing(false);
        }
        if (intent.kind === 'warmup') setWarmupOpen(true);
        setRun(next);
        expectedRun.current = next.id;
        setContentChanged(false);
        if (
          intent.kind === 'start' ||
          (intent.kind === 'command' &&
            ['advance', 'retry', 'answer'].includes(intent.command.type))
        ) {
          setAnswer('');
          startedAt.current = Date.now();
        }
        setRestart(false);
      }
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(false);
      onSavingChange?.(false);
    }
  };
  const start = () => {
    if (busy.current || pending.current) return;
    void execute({
      kind: 'start',
      id: planRunId ?? identity(),
      at: Date.now(),
      expectedRunId: expectedRun.current,
    });
  };
  const command = (type: MissionCommand['type'], extra: Partial<MissionCommand> = {}) => {
    if (!run || busy.current || pending.current) return;
    void execute({
      kind: 'command',
      command: {
        id: identity(),
        runId: run.id,
        nodeId: run.nodeId,
        expectedRevision: run.revision,
        at: Date.now(),
        type,
        ...extra,
        ...(timedResponse && ['hint', 'answer'].includes(type)
          ? { activeDurationMs: timingContinuous.current ? readActiveTime() : null }
          : {}),
      },
    });
  };
  const disabled = saving || saveError || blocked;

  const node = run && !contentChanged ? pack.nodes.find((n) => n.id === run.nodeId) : undefined;
  const followUpCards = run?.completed
    ? run.reviewCardIds.flatMap((id) => {
        const card = decks.flatMap((d) => d.cards).find((c) => c.id === id);
        return card ? [card] : [];
      })
    : [];
  return (
    <SafeAreaView style={styles.wrap}>
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={content}
          onLayout={revealResponse}
          key={fontScale}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {
            <ActionButton
              label={t('mission.back')}
              action={() => {
                if (!busy.current && !blocked) nav.goBack();
              }}
              off={saving || blocked}
              busy={saving}
            />
          }
          {(availability === undefined && !SHOW_REVIEW_TOOLS) || (ready && !available) ? (
            <Text style={styles.body}>{t('mission.unavailable')}</Text>
          ) : (
            <>
              <Text style={styles.eyebrow}>
                {eyebrow ?? t(listening ? 'listening.generated' : 'mission.draft')}
              </Text>
              <Text style={styles.title}>{local(pack.title)}</Text>
              <Text style={styles.body}>
                {notice ?? t(listening ? 'listening.notice' : 'mission.notice')}
              </Text>
              {run &&
              !run.completed &&
              !contentChanged &&
              !loadError &&
              !warmupOpen &&
              warmupCards?.length &&
              persistence.warmup ? (
                <View style={styles.card}>
                  <Text style={styles.body}>{t('adventure.warmupNote')}</Text>
                  <ActionButton
                    label={t('adventure.warmup')}
                    action={() => void execute({ kind: 'warmup', runId: run.id })}
                    off={disabled}
                    busy={saving}
                  />
                </View>
              ) : null}
              {!ready || loading ? (
                <Text style={styles.body}>{t('mission.loading')}</Text>
              ) : loadError ? (
                <>
                  <Text accessibilityRole="alert" style={styles.body}>
                    {t('mission.loadError')}
                  </Text>
                  {
                    <ActionButton
                      label={t('mission.retry')}
                      action={() => {
                        setLoading(true);
                        setLoadError(false);
                        void load();
                      }}
                      off={disabled}
                      busy={saving}
                    />
                  }
                </>
              ) : contentChanged ? (
                <>
                  <Text style={styles.body}>{t('mission.changed')}</Text>
                  {
                    <ActionButton
                      label={t('mission.startVersion')}
                      action={() => {
                        if (adapter && run && !run.completed) setRestart(true);
                        else start();
                      }}
                      off={disabled || (adapter !== undefined && restart)}
                      busy={saving}
                    />
                  }
                  {adapter && restart && (
                    <>
                      <Text style={styles.body}>{t('mission.restartQuestion')}</Text>
                      <ActionButton
                        label={t('mission.restart')}
                        action={start}
                        off={disabled}
                        busy={saving}
                      />
                      <ActionButton
                        label={t('mission.cancel')}
                        action={() => setRestart(false)}
                        off={disabled}
                        busy={saving}
                      />
                    </>
                  )}
                </>
              ) : !run ? (
                <ActionButton
                  label={startLabel ?? t(planId ? 'plan.startReply' : 'mission.start')}
                  action={start}
                  off={disabled}
                  busy={saving}
                />
              ) : node ? (
                warmupOpen && warmupCards?.length ? (
                  <MissionFollowUp cards={warmupCards} onDone={() => setWarmupOpen(false)} />
                ) : reviewing && followUpCards.length > 0 ? (
                  <MissionFollowUp
                    key={followUpCards.map((c) => c.id).join(':')}
                    cards={followUpCards}
                    onDone={() => setReviewing(false)}
                  />
                ) : (
                  <View
                    testID="mission-node"
                    style={styles.card}
                    onLayout={(event) => recordResponseLayout('cardY', event.nativeEvent.layout.y)}
                  >
                    <Text accessibilityRole="header" style={styles.heading}>
                      {local(node.title)}
                    </Text>
                    {node.kind === 'scene' || node.kind === 'complete' ? (
                      <Text style={styles.body}>{local(node.text)}</Text>
                    ) : (
                      <Text style={styles.prompt}>
                        {local(node.prompt).replace('{{blank}}', '____')}
                      </Text>
                    )}
                    {node.kind === 'scene' && (
                      <ActionButton
                        label={t('mission.continue')}
                        action={() => command('advance')}
                        off={disabled}
                        busy={saving}
                      />
                    )}
                    {(node.kind === 'production' ||
                      node.kind === 'choice' ||
                      node.kind === 'listening') && (
                      <>
                        {node.kind === 'listening' && (
                          <MissionAudio
                            key={`${run.id}:${node.id}`}
                            node={node}
                            run={run}
                            disabled={disabled}
                            onCommand={(type) => command(type)}
                          />
                        )}
                        {node.hints.slice(0, run.hintsUsed).map((hint, i) => (
                          <Text key={i} style={styles.hint}>
                            {local(hint)}
                          </Text>
                        ))}
                        {!run.feedback ? (
                          <>
                            {node.kind === 'production' ? (
                              <>
                                <ThemedTextInput
                                  accessibilityLabel={t('mission.answer')}
                                  onLayout={(event) =>
                                    recordResponseLayout('inputY', event.nativeEvent.layout.y)
                                  }
                                  onFocus={() => {
                                    focusedResponse.current = responseIdentity;
                                    revealResponse();
                                  }}
                                  onBlur={() => {
                                    if (focusedResponse.current === responseIdentity)
                                      focusedResponse.current = undefined;
                                  }}
                                  style={styles.input}
                                  value={answer}
                                  onChangeText={setAnswer}
                                  maxLength={256}
                                  autoCorrect={false}
                                  autoCapitalize="sentences"
                                  editable={!disabled}
                                  returnKeyType="done"
                                />
                                {
                                  <ActionButton
                                    label={t('mission.check')}
                                    action={() =>
                                      command('answer', {
                                        answer,
                                        durationMs: Math.max(0, Date.now() - startedAt.current),
                                      })
                                    }
                                    off={disabled || !answer.trim()}
                                    busy={saving}
                                  />
                                }
                              </>
                            ) : (
                              node.options.map((option) => (
                                <ActionButton
                                  key={option.id}
                                  label={local(option.text)}
                                  action={() =>
                                    command('answer', {
                                      choiceId: option.id,
                                      durationMs: Math.max(0, Date.now() - startedAt.current),
                                    })
                                  }
                                  off={disabled || (node.kind === 'listening' && !run.audioPlayed)}
                                  busy={saving}
                                />
                              ))
                            )}
                            {run.hintsUsed < node.hints.length && (
                              <ActionButton
                                label={t('mission.hint')}
                                action={() => command('hint')}
                                off={disabled}
                                busy={saving}
                              />
                            )}
                          </>
                        ) : (
                          <View accessibilityLiveRegion="polite">
                            <Text style={styles.feedback}>
                              {t(`mission.${run.feedback.status}`)}
                            </Text>
                            {node.kind === 'production' ? (
                              <>
                                <Text style={styles.prompt}>
                                  {node.exercise.acceptedAnswers[run.feedback.answerIndex!]}
                                </Text>
                                <Text style={styles.body}>{local(node.correction)}</Text>
                              </>
                            ) : (
                              <Text style={styles.body}>
                                {local(
                                  node.options.find((o) => o.id === run.feedback!.optionId)!
                                    .feedback,
                                )}
                              </Text>
                            )}
                            {run.feedback.status !== 'correct' && (
                              <ActionButton
                                label={t('mission.retryAnswer')}
                                action={() => command('retry')}
                                off={disabled}
                                busy={saving}
                              />
                            )}
                            {
                              <ActionButton
                                label={t(
                                  run.feedback.status === 'correct'
                                    ? 'mission.continue'
                                    : 'mission.helpContinue',
                                )}
                                action={() => command('advance')}
                                off={disabled}
                                busy={saving}
                              />
                            }
                          </View>
                        )}
                      </>
                    )}
                    {node.kind === 'complete' && (
                      <>
                        {renderCompletion ? (
                          renderCompletion(run)
                        ) : (
                          <Text style={styles.feedback}>
                            {t(run.assisted ? 'mission.assisted' : 'mission.unaided')}
                          </Text>
                        )}
                        {run.reviewCardIds.length > 0 && (
                          <>
                            <Text style={styles.heading}>{t('mission.review')}</Text>
                            {run.reviewCardIds.map((id) => (
                              <Text key={id} style={styles.body}>
                                {decks.flatMap((d) => d.cards).find((c) => c.id === id)?.front ??
                                  id}
                              </Text>
                            ))}
                          </>
                        )}
                        {followUpCards.length > 0 && (
                          <ActionButton
                            label={t('mission.reviewAction')}
                            action={() => setReviewing(true)}
                            off={disabled}
                            busy={saving}
                          />
                        )}
                        {!planId &&
                          (restart ? (
                            <>
                              <Text style={styles.body}>{t('mission.restartQuestion')}</Text>
                              {
                                <ActionButton
                                  label={t('mission.restart')}
                                  action={start}
                                  off={disabled}
                                  busy={saving}
                                />
                              }
                              {
                                <ActionButton
                                  label={t('mission.cancel')}
                                  action={() => setRestart(false)}
                                  off={disabled}
                                  busy={saving}
                                />
                              }
                            </>
                          ) : (
                            <ActionButton
                              label={t('mission.again')}
                              action={() => setRestart(true)}
                              off={disabled}
                              busy={saving}
                            />
                          ))}
                      </>
                    )}
                  </View>
                )
              ) : null}
              {saveError && (
                <>
                  <Text accessibilityRole="alert" style={styles.body}>
                    {t('mission.saveError')}
                  </Text>
                  {
                    <ActionButton
                      label={t('mission.retrySave')}
                      action={() => {
                        if (pending.current) void execute(pending.current);
                      }}
                      off={saving}
                      busy={saving}
                    />
                  }
                </>
              )}
            </>
          )}
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, gap: 16, paddingBottom: 60 },
    title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
    eyebrow: { color: colors.brand, fontSize: 14, fontWeight: '700' },
    heading: { color: colors.textPrimary, fontSize: 23, fontWeight: '700' },
    body: { color: colors.textSecondary, fontSize: 16, lineHeight: 24 },
    prompt: { color: colors.textPrimary, fontSize: 20, lineHeight: 28 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      gap: 16,
      borderWidth: 1,
      borderColor: colors.borderBrand,
    },
    button: {
      minHeight: 48,
      backgroundColor: colors.brand,
      borderRadius: 12,
      padding: 14,
      justifyContent: 'center',
      marginVertical: 4,
    },
    buttonText: { fontSize: 16, color: colors.textInverse, fontWeight: '700', textAlign: 'center' },
    disabled: { opacity: 0.5 },
    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: colors.borderActive,
      borderRadius: 10,
      padding: 14,
      color: colors.textPrimary,
      fontSize: 20,
    },
    hint: { fontSize: 16, color: colors.brand, lineHeight: 24 },
    feedback: { fontSize: 20, fontWeight: '700', color: colors.brand, marginVertical: 12 },
  });

function ActionButton({
  label,
  action,
  off,
  busy = false,
}: {
  label: string;
  action: () => void;
  off: boolean;
  busy?: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  const theme = useAppTheme();
  return (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy }}
      disabled={off}
      onPress={action}
      style={({ pressed }) => [
        styles.button,
        off && styles.disabled,
        controlSurface(theme, pressed, off),
      ]}
    >
      <Text style={[styles.buttonText, controlText(theme, off)]}>{label}</Text>
    </Pressable>
  );
}
