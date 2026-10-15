import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { getPrefs, setPrefs } from '../storage/prefs';
import { speakCard, stop, PlaybackResult } from '../services/tts';
import { colors } from '../styles/theme';
export default function AudioPreferencesScreen() {
  const { t } = useLanguage(),
    nav = useNavigation<any>();
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
    setLoading(true);
    setLoadError(false);
    try {
      const prefs = await getPrefs();
      if (mounted.current && request === loadId.current) setRate(prefs.speechRate);
    } catch {
      if (mounted.current && request === loadId.current) setLoadError(true);
    } finally {
      if (mounted.current && request === loadId.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
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
      await setPrefs({ speechRate: rate });
      if (mounted.current) setSaveStatus('saved');
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
  const button = (label: string, action: () => void, disabled = false) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={action}
      style={[styles.button, disabled && styles.disabled]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        {button(
          t('audio.back'),
          () => {
            if (!saveBusy.current) {
              cancel();
              nav.goBack();
            }
          },
          saving,
        )}
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
            {button(t('audio.retry'), () => void load())}
          </>
        ) : (
          <>
            <Text style={styles.body}>{t('audio.selected', { rate })}</Text>
            <View accessibilityRole="radiogroup" style={styles.options}>
              {[0.75, 1, 1.25].map((value) => (
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
            {button(t('audio.save'), () => void save(), saving)}
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
              {button(t('audio.preview'), () => void preview())}
              {button(t('audio.stop'), cancel)}
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
const styles = StyleSheet.create({
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
