import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useThemeSelection, useThemedStyles } from '../context/ThemeContext';
import { getPrefs, setPrefs } from '../storage/prefs';
import { normalizeThemeSelection, ThemeSelection } from '../utils/themePreference';
import { AppTheme } from '../styles/appTheme';

export default function ThemeSettingsScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<any>();
  const { fontScale } = useWindowDimensions();
  const { selection, applySelection } = useThemeSelection();
  const styles = useThemedStyles(makeStyles);
  const [draft, setDraft] = useState<ThemeSelection>(selection);
  const [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false),
    [saveError, setSaveError] = useState(false),
    [saved, setSaved] = useState(false);
  const mounted = useRef(true),
    busy = useRef(false),
    request = useRef(0);
  const pending = useRef<ThemeSelection | undefined>(undefined);
  const locked = saving || saveError;
  usePreventRemove(locked, () => {});
  const load = useCallback(async () => {
    const id = ++request.current;
    try {
      const prefs = await getPrefs();
      if (mounted.current && id === request.current) {
        setDraft(normalizeThemeSelection(prefs));
        setLoadError(false);
      }
    } catch {
      if (mounted.current && id === request.current) setLoadError(true);
    } finally {
      if (mounted.current && id === request.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void Promise.resolve().then(load);
    return () => {
      mounted.current = false;
    };
  }, [load]);
  const choose = (patch: Partial<ThemeSelection>) => {
    if (busy.current || pending.current || loading || loadError) return;
    setDraft((current) => ({ ...current, ...patch }));
    setSaved(false);
  };
  const save = async () => {
    if (busy.current || loading || loadError) return;
    const intent = pending.current ?? { ...draft };
    pending.current = intent;
    busy.current = true;
    setSaving(true);
    setSaveError(false);
    setSaved(false);
    try {
      await setPrefs(intent);
      const authoritative = await getPrefs();
      if (mounted.current) {
        const next = normalizeThemeSelection(authoritative);
        applySelection(next);
        setDraft(next);
        pending.current = undefined;
        setSaved(true);
      }
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(false);
    }
  };
  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView key={fontScale} contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {t('theme.title')}
        </Text>
        {loading ? (
          <Text style={styles.body}>{t('theme.loading')}</Text>
        ) : loadError ? (
          <>
            <Text accessibilityRole="alert" style={styles.body}>
              {t('theme.loadError')}
            </Text>
            <ThemeAction
              label={t('theme.retry')}
              onPress={() => {
                setLoading(true);
                setLoadError(false);
                void load();
              }}
            />
          </>
        ) : (
          <>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel={t('theme.title')}
              style={styles.options}
            >
              {(['classic', 'barrio'] as const).map((themeId) => (
                <Pressable
                  key={themeId}
                  accessibilityRole="radio"
                  accessibilityLabel={t(
                    themeId === 'classic' ? 'theme.classicChoice' : 'theme.barrio',
                  )}
                  accessibilityState={{ checked: draft.themeId === themeId, disabled: locked }}
                  disabled={locked}
                  onPress={() => choose({ themeId })}
                  style={[styles.option, draft.themeId === themeId && styles.selected]}
                >
                  <Text style={styles.body}>
                    {t(themeId === 'classic' ? 'theme.classicChoice' : 'theme.barrio')}
                  </Text>
                </Pressable>
              ))}
            </View>
            {draft.themeId === 'classic' ? (
              <Text style={styles.body}>{t('theme.classicNote')}</Text>
            ) : (
              <>
                <Text accessibilityRole="header" style={styles.heading}>
                  {t('theme.appearance')}
                </Text>
                <View
                  accessibilityRole="radiogroup"
                  accessibilityLabel={t('theme.appearance')}
                  style={styles.options}
                >
                  {(['system', 'light', 'dark'] as const).map((appearanceMode) => (
                    <Pressable
                      key={appearanceMode}
                      accessibilityRole="radio"
                      accessibilityLabel={t(`theme.${appearanceMode}`)}
                      accessibilityState={{
                        checked: draft.appearanceMode === appearanceMode,
                        disabled: locked,
                      }}
                      disabled={locked}
                      onPress={() => choose({ appearanceMode })}
                      style={[
                        styles.option,
                        draft.appearanceMode === appearanceMode && styles.selected,
                      ]}
                    >
                      <Text style={styles.body}>{t(`theme.${appearanceMode}`)}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            <Text style={styles.body}>{t('theme.applyNote')}</Text>
            {saveError && (
              <>
                <Text accessibilityRole="alert" style={styles.body}>
                  {t('theme.saveError')}
                </Text>
                <ThemeAction
                  label={t('theme.retry')}
                  onPress={() => void save()}
                  disabled={saving}
                />
              </>
            )}
            {saved && (
              <Text accessibilityLiveRegion="polite" style={styles.body}>
                {t('theme.saved')}
              </Text>
            )}
            <ThemeAction label={t('theme.save')} onPress={() => void save()} disabled={locked} />
          </>
        )}
        <ThemeAction
          label={t('theme.cancel')}
          onPress={() => {
            if (!busy.current && !pending.current) nav.goBack();
          }}
          disabled={locked}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
function ThemeAction({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.buttonText, disabled && styles.disabledText]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, gap: 20 },
    title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800' },
    heading: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
    body: { color: colors.textPrimary, fontSize: 17 },
    options: { gap: 12 },
    option: {
      minHeight: 48,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
    },
    selected: { borderColor: colors.brand, borderWidth: 2, backgroundColor: colors.brandMuted },
    button: {
      minHeight: 48,
      padding: 16,
      backgroundColor: colors.brand,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: { color: colors.onBrand, fontSize: 17, fontWeight: '700', textAlign: 'center' },
    pressed: { backgroundColor: colors.brandPressed },
    disabled: { backgroundColor: colors.disabledBg },
    disabledText: { color: colors.disabledText },
  });
