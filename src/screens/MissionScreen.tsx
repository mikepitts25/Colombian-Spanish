import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SHOW_REVIEW_TOOLS } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { useDeck } from '../hooks/useDeck';
import { FIRST_MORNING } from '../missions/firstMorning';
import { LocalizedText, validateMission } from '../missions/schema';
import { MissionCommand, MissionRun } from '../missions/engine';
import { applyMissionCommand, loadMissionRun, startMissionRun } from '../storage/missions';
import { colors } from '../styles/theme';

type Pending =
  | { kind: 'start'; id: string; at: number; expectedRunId?: string }
  | { kind: 'command'; command: MissionCommand };
const identity = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export default function MissionScreen() {
  const { language, t } = useLanguage();
  const nav = useNavigation<any>();
  const { ready, decks } = useDeck();
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
    startedAt = useRef(Date.now());
  const local = (value: LocalizedText) => value[language];
  const available = useMemo(() => {
    if (!SHOW_REVIEW_TOOLS || !ready) return false;
    try {
      validateMission(FIRST_MORNING, {
        cards: new Map(decks.flatMap((d) => d.cards.map((c) => [c.id, d.id] as [string, string]))),
        mediaIds: new Set(),
        missionIds: new Set(),
      });
      return true;
    } catch {
      return false;
    }
  }, [ready, decks]);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setLoadError(false);
    try {
      const result = await loadMissionRun(FIRST_MORNING);
      if (mounted.current && request === generation.current) {
        setRun(result.run);
        setContentChanged(result.contentChanged);
        startedAt.current = Date.now();
      }
    } catch {
      if (mounted.current && request === generation.current) setLoadError(true);
    } finally {
      if (mounted.current && request === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    if (available) void load();
    return () => {
      mounted.current = false;
    };
  }, [available, load]);
  const execute = async (intent: Pending) => {
    if (busy.current) return;
    busy.current = true;
    pending.current = intent;
    setSaving(true);
    setSaveError(false);
    try {
      const next =
        intent.kind === 'start'
          ? await startMissionRun(FIRST_MORNING, intent.id, intent.at, intent.expectedRunId)
          : await applyMissionCommand(FIRST_MORNING, intent.command);
      pending.current = undefined;
      if (mounted.current) {
        setRun(next);
        setContentChanged(false);
        if (intent.kind === 'start' || intent.command.type !== 'hint') {
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
    }
  };
  const start = () => {
    if (busy.current || pending.current) return;
    void execute({ kind: 'start', id: identity(), at: Date.now(), expectedRunId: run?.id });
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
      },
    });
  };
  const disabled = saving || saveError;
  const button = (label: string, onPress: () => void, off = disabled) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: saving }}
      disabled={off}
      onPress={onPress}
      style={[styles.button, off && styles.disabled]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
  const node =
    run && !contentChanged ? FIRST_MORNING.nodes.find((n) => n.id === run.nodeId) : undefined;
  return (
    <SafeAreaView style={styles.wrap}>
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {button(
            t('mission.back'),
            () => {
              if (!busy.current) nav.goBack();
            },
            saving,
          )}
          {!SHOW_REVIEW_TOOLS || (ready && !available) ? (
            <Text style={styles.body}>{t('mission.unavailable')}</Text>
          ) : (
            <>
              <Text style={styles.eyebrow}>{t('mission.draft')}</Text>
              <Text style={styles.title}>{local(FIRST_MORNING.title)}</Text>
              <Text style={styles.body}>{t('mission.notice')}</Text>
              {!ready || loading ? (
                <Text style={styles.body}>{t('mission.loading')}</Text>
              ) : loadError ? (
                <>
                  <Text accessibilityRole="alert" style={styles.body}>
                    {t('mission.loadError')}
                  </Text>
                  {button(t('mission.retry'), () => void load())}
                </>
              ) : contentChanged ? (
                <>
                  <Text style={styles.body}>{t('mission.changed')}</Text>
                  {button(t('mission.startVersion'), start)}
                </>
              ) : !run ? (
                button(t('mission.start'), start)
              ) : node ? (
                <View style={styles.card}>
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
                  {node.kind === 'scene' && button(t('mission.continue'), () => command('advance'))}
                  {(node.kind === 'production' || node.kind === 'choice') && (
                    <>
                      {node.hints.slice(0, run.hintsUsed).map((hint, i) => (
                        <Text key={i} style={styles.hint}>
                          {local(hint)}
                        </Text>
                      ))}
                      {!run.feedback ? (
                        <>
                          {node.kind === 'production' ? (
                            <>
                              <TextInput
                                accessibilityLabel={t('mission.answer')}
                                style={styles.input}
                                value={answer}
                                onChangeText={setAnswer}
                                maxLength={256}
                                autoCorrect={false}
                                autoCapitalize="sentences"
                                editable={!disabled}
                                returnKeyType="done"
                              />
                              {button(
                                t('mission.check'),
                                () =>
                                  command('answer', {
                                    answer,
                                    durationMs: Math.max(0, Date.now() - startedAt.current),
                                  }),
                                disabled || !answer.trim(),
                              )}
                            </>
                          ) : (
                            node.options.map((option) =>
                              button(local(option.text), () =>
                                command('answer', {
                                  choiceId: option.id,
                                  durationMs: Math.max(0, Date.now() - startedAt.current),
                                }),
                              ),
                            )
                          )}
                          {run.hintsUsed < node.hints.length &&
                            button(t('mission.hint'), () => command('hint'))}
                        </>
                      ) : (
                        <View accessibilityLiveRegion="polite">
                          <Text style={styles.feedback}>{t(`mission.${run.feedback.status}`)}</Text>
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
                                node.options.find((o) => o.id === run.feedback!.optionId)!.feedback,
                              )}
                            </Text>
                          )}
                          {button(t('mission.retryAnswer'), () => command('retry'))}
                          {button(
                            t(
                              run.feedback.status === 'correct'
                                ? 'mission.continue'
                                : 'mission.helpContinue',
                            ),
                            () => command('advance'),
                          )}
                        </View>
                      )}
                    </>
                  )}
                  {node.kind === 'complete' && (
                    <>
                      <Text style={styles.feedback}>
                        {t(run.assisted ? 'mission.assisted' : 'mission.unaided')}
                      </Text>
                      {run.reviewCardIds.length > 0 && (
                        <>
                          <Text style={styles.heading}>{t('mission.review')}</Text>
                          {run.reviewCardIds.map((id) => (
                            <Text key={id} style={styles.body}>
                              {decks.flatMap((d) => d.cards).find((c) => c.id === id)?.front ?? id}
                            </Text>
                          ))}
                        </>
                      )}
                      {restart ? (
                        <>
                          <Text style={styles.body}>{t('mission.restartQuestion')}</Text>
                          {button(t('mission.restart'), start)}
                          {button(t('mission.cancel'), () => setRestart(false))}
                        </>
                      ) : (
                        button(t('mission.again'), () => setRestart(true))
                      )}
                    </>
                  )}
                </View>
              ) : null}
              {saveError && (
                <>
                  <Text accessibilityRole="alert" style={styles.body}>
                    {t('mission.saveError')}
                  </Text>
                  {button(
                    t('mission.retrySave'),
                    () => {
                      if (pending.current) void execute(pending.current);
                    },
                    saving,
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
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
