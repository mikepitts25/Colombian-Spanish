import Pressable from './ThemedPressable';
import { controlSurface, controlText } from '../styles/controlStates';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ListeningNode } from '../missions/schema';
import { MissionRun } from '../missions/engine';
import { speakCard, stop } from '../services/tts';
import { useLanguage } from '../context/LanguageContext';

export default function MissionAudio({
  node,
  run,
  disabled,
  onCommand,
}: {
  node: ListeningNode;
  run: MissionRun;
  disabled: boolean;
  onCommand: (type: 'playback' | 'transcript') => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const { t } = useLanguage();
  const [playing, setPlaying] = useState(false),
    [played, setPlayed] = useState(false),
    [error, setError] = useState(false),
    [rate, setRate] = useState<number>(),
    [loop, setLoop] = useState(false);
  const active = useRef(true),
    request = useRef(0),
    latest = useRef({ run, onCommand });
  useLayoutEffect(() => {
    latest.current = { run, onCommand };
  }, [run, onCommand]);
  const cancel = useCallback(() => {
    request.current++;
    stop();
  }, []);
  const reset = useCallback(() => {
    cancel();
    setPlaying(false);
    setPlayed(false);
    setError(false);
  }, [cancel]);
  useFocusEffect(
    useCallback(() => {
      active.current = true;
      setPlaying(false);
      setPlayed(false);
      return () => {
        active.current = false;
        cancel();
      };
    }, [cancel]),
  );
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && active.current) reset();
    });
    return () => sub.remove();
  }, [reset]);
  useEffect(() => {
    // Persisted feedback cancels external playback and clears its UI status.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (run.feedback) reset();
  }, [run.feedback, reset]);
  const play = async () => {
    if (playing || disabled) return;
    const id = ++request.current,
      revision = run.revision;
    setPlaying(true);
    setError(false);
    setPlayed(false);
    try {
      const result = await speakCard(
        { id: node.cardId, front: node.transcript },
        { rate, loop, requireBundled: true },
      );
      if (!active.current || request.current !== id) return;
      if (latest.current.run.revision !== revision) {
        reset();
        return;
      }
      if (result.source !== 'generated') {
        if (result.source !== 'cancelled') setError(true);
        return;
      }
      setPlayed(true);
      if (!latest.current.run.audioPlayed) latest.current.onCommand('playback');
    } catch {
      if (active.current && request.current === id) setError(true);
    } finally {
      if (active.current && request.current === id) setPlaying(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.note}>{t('listening.generated')}</Text>
      <Text style={styles.note}>{t('listening.evidenceNote')}</Text>
      <View style={styles.rates} accessibilityRole="radiogroup">
        {[undefined, 0.75, 1, 1.25].map((value) => (
          <Pressable
            key={value ?? 'saved'}
            accessibilityRole="radio"
            accessibilityState={{ checked: rate === value, disabled: disabled || playing }}
            disabled={disabled || playing}
            style={[styles.rate, rate === value && styles.selected]}
            onPress={() => {
              reset();
              setRate(value);
            }}
          >
            <Text style={styles.rateText}>
              {value === undefined ? t('listening.savedSpeed') : `${value}×`}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: loop, disabled: disabled || playing }}
        disabled={disabled || playing}
        onPress={() => {
          reset();
          setLoop(!loop);
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {t('audio.repeat')} · {t(loop ? 'audio.on' : 'audio.off')}
        </Text>
      </Pressable>
      {
        <ActionButton
          label={t('listening.play')}
          action={() => void play()}
          off={disabled || playing}
        />
      }
      {<ActionButton label={t('audio.stop')} action={reset} off={false} />}
      {played && (
        <Text accessibilityLiveRegion="polite" style={styles.note}>
          {t('audio.generated')}
        </Text>
      )}
      {error && (
        <Text accessibilityRole="alert" style={styles.note}>
          {t('listening.playError')}
        </Text>
      )}
      {run.transcriptRevealed || run.feedback ? (
        <View accessibilityLiveRegion="polite">
          <Text style={styles.note}>{t('listening.transcript')}</Text>
          <Text style={styles.transcript}>{node.transcript}</Text>
        </View>
      ) : (
        <ActionButton
          label={t('listening.showTranscript')}
          action={() => {
            reset();
            onCommand('transcript');
          }}
          off={disabled || playing}
        />
      )}
    </View>
  );
}
const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { gap: 12 },
    note: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
    transcript: { fontSize: 22, lineHeight: 30, color: colors.textPrimary },
    rates: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    rate: {
      minHeight: 48,
      minWidth: 64,
      padding: 12,
      borderWidth: 2,
      borderColor: colors.borderActive,
      borderRadius: 10,
      justifyContent: 'center',
    },
    selected: { borderColor: colors.brand },
    rateText: { fontSize: 16, color: colors.textPrimary },
    button: {
      minHeight: 48,
      padding: 14,
      backgroundColor: colors.brand,
      borderRadius: 12,
      justifyContent: 'center',
    },
    buttonText: { fontSize: 16, color: colors.textInverse, fontWeight: '700', textAlign: 'center' },
    disabled: { opacity: 0.5 },
  });

function ActionButton({ label, action, off }: { label: string; action: () => void; off: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const theme = useAppTheme();
  return (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: off }}
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
