import Pressable from '../components/ThemedPressable';
import { useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Linking, ScrollView, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAudioRecorder, RecordingPresets } from 'expo-audio';
import { SHOW_REVIEW_TOOLS } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { VoicePractice, VoiceState } from '../speaking/voicePractice';
import { createVoicePorts } from '../services/voicePractice';
import { LISTENING_BASICS } from '../missions/listeningBasics';

export default function VoicePracticeScreen() {
  const { t } = useLanguage();
  return SHOW_REVIEW_TOOLS ? <VoicePracticeDraft /> : <Text>{t('mission.unavailable')}</Text>;
}
function VoicePracticeDraft() {
  const styles = useThemedStyles(makeStyles);
  const { t } = useLanguage(),
    nav = useNavigation<any>();
  const { fontScale } = useWindowDimensions();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const voice = useMemo(() => new VoicePractice(createVoicePorts(recorder)), [recorder]);
  const [state, setState] = useState<VoiceState>(voice.state),
    [text, setText] = useState(false),
    [elapsed, setElapsed] = useState(0),
    [leaving, setLeaving] = useState(false),
    [exitError, setExitError] = useState(false);
  useEffect(() => voice.subscribe(setState), [voice]);
  useFocusEffect(
    useCallback(
      () => () => {
        void voice.close().catch(() => {});
      },
      [voice],
    ),
  );
  useEffect(() => {
    const sub = AppState.addEventListener('change', (value) => {
      if (value !== 'active') void voice.suspend();
    });
    return () => sub.remove();
  }, [voice]);
  useEffect(() => {
    if (state.phase !== 'recording') return;
    const start = Date.now();
    // The recorder phase is external; reset the display when its new timer starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setElapsed(0);
    const timer = setInterval(
      () => setElapsed(Math.min(30, Math.floor((Date.now() - start) / 1000))),
      250,
    );
    return () => clearInterval(timer);
  }, [state.phase]);
  const busy = ['requesting', 'preparing', 'stopping'].includes(state.phase);
  const back = async () => {
    if (leaving) return;
    setLeaving(true);
    setExitError(false);
    try {
      await voice.close();
      nav.goBack();
    } catch {
      setExitError(true);
    } finally {
      setLeaving(false);
    }
  };
  const button = (label: string, action: () => void, disabled = false, expanded?: boolean) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, ...(expanded === undefined ? {} : { expanded }) }}
      disabled={disabled}
      onPress={action}
      style={[styles.button, disabled && styles.disabled]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
  const sample = LISTENING_BASICS.nodes.find((n) => n.kind === 'listening');
  return (
    <SafeAreaView key={fontScale} style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        {button(t('audio.back'), () => void back(), leaving)}
        <Text accessibilityRole="header" style={styles.title}>
          {t('voice.title')}
        </Text>
        <Text style={styles.body}>{t('voice.notice')}</Text>
        <Text style={styles.body}>{t('voice.prompt')}</Text>
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          {t(`voice.${state.phase}`)}
        </Text>
        {state.phase === 'recording' && <Text style={styles.body}>{elapsed} / 30 s</Text>}
        {state.phase === 'ready' && state.clip && (
          <Text style={styles.body}>
            {t('voice.takeSize', {
              seconds: (state.clip.durationMs / 1000).toFixed(1),
              kb: Math.ceil(state.clip.bytes / 1024),
            })}
          </Text>
        )}
        {state.phase === 'denied' &&
          !state.canAskAgain &&
          button(t('voice.settings'), () => {
            void Linking.openSettings().catch(() => setExitError(true));
          })}
        {button(t('voice.record'), () => void voice.start(), leaving || busy || state.hasTake)}
        {button(t('voice.stop'), () => void voice.stop(), leaving)}
        {button(
          t('voice.replay'),
          () => void voice.play(),
          leaving || busy || state.phase !== 'ready',
        )}
        {button(t('voice.delete'), () => void voice.discard(), leaving || busy || !state.hasTake)}
        {button(t('voice.alternative'), () => setText(!text), false, text)}
        {text && (
          <>
            <Text style={styles.body}>{t('voice.selfCheck')}</Text>
            <Text style={styles.sample}>
              {sample?.kind === 'listening' ? sample.transcript : ''}
            </Text>
          </>
        )}
        <Text style={styles.body}>{t('voice.retention')}</Text>
        {exitError && (
          <Text accessibilityRole="alert" style={styles.body}>
            {t('voice.exitError')}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 60, gap: 16 },
    title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
    body: { fontSize: 16, lineHeight: 24, color: colors.textSecondary },
    status: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
    sample: { fontSize: 26, color: colors.textPrimary },
    button: {
      minHeight: 48,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.brand,
      justifyContent: 'center',
    },
    buttonText: { fontSize: 16, fontWeight: '700', textAlign: 'center', color: colors.textInverse },
    disabled: { opacity: 0.5 },
  });
