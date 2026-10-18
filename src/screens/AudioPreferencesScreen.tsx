import { controlSurface, controlText } from '../styles/controlStates';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { getPrefs, setPrefs } from '../storage/prefs';
import { speakCard, stop, PlaybackResult } from '../services/tts';

export default function AudioPreferencesScreen() {
  const styles = useThemedStyles(makeStyles);
  const { t } = useLanguage(),
    nav = useNavigation<any>();
  const { fontScale } = useWindowDimensions();
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [loadedRate, setLoadedRate] = useState(0.98);
  const [rate, setRate] = useState(0.98),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(false),
    [saving, setSaving] = useState(false),
    [saveStatus, setSaveStatus] = useState<'saved' | 'error'>(),
    [loop, setLoop] = useState(false),
    [source, setSource] = useState<PlaybackResult['source']>(),
    [previewError, setPreviewError] = useState(false);
  const mounted = useRef(true),
    saveBusy = useRef(false),
    previewId = useRef(0),
    loadId = useRef(0);
  const cancel = () => {
    previewId.current++;
    stop();
    setSource(undefined);
    setPreviewError(false);
  };
  const load = useCallback(async () => {
    const request = ++loadId.current;
    try {
      const prefs = await getPrefs();
      if (mounted.current && request === loadId.current) {
        setRate(prefs.speechRate);
        setLoadedRate(prefs.speechRate);
        setAutoSpeak(prefs.autoSpeak);
      }
    } catch {
      if (mounted.current && request === loadId.current) setLoadError(true);
    } finally {
      if (mounted.current && request === loadId.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Load persisted external state; setters run after the asynchronous storage read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  useFocusEffect(
    useCallback(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        previewId.current++;
        stop();
      };
    }, []),
  );
  const save = async () => {
    if (saveBusy.current) return;
    saveBusy.current = true;
    setSaving(true);
    setSaveStatus(undefined);
    try {
      await setPrefs({ speechRate: rate, autoSpeak });
      if (mounted.current) {
        setLoadedRate(rate);
        setSaveStatus('saved');
      }
    } catch {
      if (mounted.current) setSaveStatus('error');
    } finally {
      saveBusy.current = false;
      if (mounted.current) setSaving(false);
    }
  };
  const preview = async () => {
    const request = ++previewId.current;
    setSource(undefined);
    setPreviewError(false);
    try {
      const result = await speakCard({ id: '0010', front: 'buenos días' }, { rate, loop });
      if (mounted.current && request === previewId.current && result.source !== 'cancelled')
        setSource(result.source);
    } catch {
      if (mounted.current && request === previewId.current) setPreviewError(true);
    }
  };

  return (
    <SafeAreaView key={fontScale} style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        {
          <ActionButton
            label={t('audio.back')}
            action={() => {
              if (!saveBusy.current) {
                cancel();
                nav.goBack();
              }
            }}
            off={saving}
          />
        }
        <Text accessibilityRole="header" style={styles.title}>
          {t('audio.title')}
        </Text>
        <Text style={styles.body}>{t('audio.note')}</Text>
        {loading ? (
          <Text style={styles.body}>{t('audio.loading')}</Text>
        ) : loadError ? (
          <>
            <Text accessibilityRole="alert" style={styles.body}>
              {t('audio.loadError')}
            </Text>
            {
              <ActionButton
                label={t('audio.retry')}
                action={() => {
                  setLoading(true);
                  setLoadError(false);
                  void load();
                }}
                off={false}
              />
            }
          </>
        ) : (
          <>
            <Text style={styles.body}>{t('audio.selected', { rate })}</Text>
            <View accessibilityRole="radiogroup" style={styles.options}>
              {[...new Set([0.75, 0.98, 1, 1.25, loadedRate])]
                .sort((a, b) => a - b)
                .map((value) => (
                  <Pressable
                    key={value}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: rate === value, disabled: saving }}
                    disabled={saving}
                    onPress={() => {
                      cancel();
                      setRate(value);
                      setSaveStatus(undefined);
                    }}
                    style={[styles.option, rate === value && styles.selected]}
                  >
                    <Text style={styles.optionText}>{value}×</Text>
                  </Pressable>
                ))}
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityLabel={t('audio.autoSpeak')}
              accessibilityState={{ checked: autoSpeak, disabled: saving }}
              disabled={saving}
              style={styles.button}
              onPress={() => {
                cancel();
                setAutoSpeak(!autoSpeak);
                setSaveStatus(undefined);
              }}
            >
              <Text style={styles.buttonText}>
                {t('audio.autoSpeak')} · {t(autoSpeak ? 'audio.on' : 'audio.off')}
              </Text>
            </Pressable>
            <Text style={styles.body}>{t('audio.autoSpeakNote')}</Text>
            {<ActionButton label={t('audio.save')} action={() => void save()} off={saving} />}
            {saveStatus && (
              <Text accessibilityLiveRegion="polite" style={styles.body}>
                {t(saveStatus === 'saved' ? 'audio.saved' : 'audio.saveError')}
              </Text>
            )}
            <View style={styles.card}>
              <Text style={styles.heading}>{t('audio.previewTitle')}</Text>
              <Text style={styles.body}>{t('audio.previewNote')}</Text>
              <Pressable
                accessibilityRole="switch"
                accessibilityLabel={t('audio.repeat')}
                accessibilityState={{ checked: loop }}
                onPress={() => {
                  cancel();
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
                  label={t('audio.preview')}
                  action={() => void preview()}
                  off={false}
                />
              }
              {<ActionButton label={t('audio.stop')} action={cancel} off={false} />}
              {source && (
                <Text accessibilityLiveRegion="polite" style={styles.body}>
                  {t(source === 'generated' ? 'audio.generated' : 'audio.device')}
                </Text>
              )}
              {previewError && (
                <Text accessibilityRole="alert" style={styles.body}>
                  {t('audio.previewError')}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, gap: 18, paddingBottom: 60 },
    title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
    heading: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
    body: { fontSize: 16, lineHeight: 24, color: colors.textSecondary },
    button: {
      minHeight: 48,
      padding: 14,
      backgroundColor: colors.brand,
      borderRadius: 12,
      justifyContent: 'center',
    },
    buttonText: { fontSize: 16, fontWeight: '700', color: colors.textInverse, textAlign: 'center' },
    disabled: { opacity: 0.5 },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    option: {
      minHeight: 48,
      minWidth: 80,
      padding: 14,
      borderWidth: 2,
      borderColor: colors.borderActive,
      borderRadius: 12,
    },
    selected: { borderColor: colors.brand, backgroundColor: colors.brandMuted },
    optionText: { fontSize: 18, color: colors.textPrimary },
    card: { padding: 20, gap: 16, backgroundColor: colors.surface, borderRadius: 20 },
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
