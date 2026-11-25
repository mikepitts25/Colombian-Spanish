import Pressable from '../components/ThemedPressable';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useThemeSelection, useThemedStyles } from '../context/ThemeContext';
import { getPrefs, setPrefs } from '../storage/prefs';
import { normalizeThemeSelection, ThemeSelection } from '../utils/themePreference';
import { AppTheme, resolveAppTheme } from '../styles/appTheme';

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
  const closeAfterRecovery = useRef(false);
  const locked = saving || saveError;
  const previewAppearances =
    draft.themeId === 'barrio' && draft.appearanceMode === 'system'
      ? (['light', 'dark'] as const)
      : ([null] as const);
  usePreventRemove(locked, () => {});
  useEffect(() => {
    if (!locked && closeAfterRecovery.current) {
      closeAfterRecovery.current = false;
      nav.goBack();
    }
  }, [locked, nav]);
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
  const resolveSelection = async (action: 'save' | 'close') => {
    if (busy.current || loading || loadError) return;
    busy.current = true;
    setSaving(true);
    setSaved(false);
    try {
      if (action === 'save') {
        const intent = pending.current ?? { ...draft };
        pending.current = intent;
        await setPrefs(intent);
      }
      // Reads recover an interrupted durable write, without retrying an intent that never landed.
      const authoritative = await getPrefs();
      if (mounted.current) {
        const next = normalizeThemeSelection(authoritative);
        applySelection(next);
        setDraft(next);
        pending.current = undefined;
        closeAfterRecovery.current = action === 'close';
        setSaveError(false);
        setSaved(action === 'save');
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
            <Text accessibilityRole="header" style={styles.heading}>
              {t('theme.preview')}
            </Text>
            <View style={[styles.previewGrid, fontScale >= 1.4 && styles.previewStack]}>
              {previewAppearances.map((appearance) => {
                const preview = resolveAppTheme(draft, appearance).colors;
                return (
                  <View
                    key={appearance ?? 'fixed'}
                    testID={appearance ? `appearance-preview-${appearance}` : 'appearance-preview'}
                    style={[
                      styles.preview,
                      fontScale >= 1.4 && styles.stackPreview,
                      { backgroundColor: preview.bg, borderColor: preview.border },
                    ]}
                  >
                    {appearance && (
                      <Text style={[styles.sampleLabel, { color: preview.textPrimary }]}>
                        {t(`theme.${appearance}`)}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.previewCard,
                        { backgroundColor: preview.surface, borderColor: preview.border },
                      ]}
                    >
                      <Text style={[styles.sampleLabel, { color: preview.textSecondary }]}>
                        {t('theme.previewCard')}
                      </Text>
                      <Text style={[styles.heading, { color: preview.textPrimary }]}>
                        Buenos días
                      </Text>
                      <View style={[styles.sampleControl, { backgroundColor: preview.brand }]}>
                        <Text style={[styles.buttonText, { color: preview.onBrand }]}>
                          {t('theme.previewControl')}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <Text style={styles.body}>{t('theme.applyNote')}</Text>
            {saveError && (
              <Text accessibilityRole="alert" style={styles.body}>
                {t('theme.saveError')}
              </Text>
            )}
            {saved && (
              <Text accessibilityLiveRegion="polite" style={styles.body}>
                {t('theme.saved')}
              </Text>
            )}
            <ThemeAction
              label={t(saveError ? 'theme.retry' : 'theme.save')}
              onPress={() => void resolveSelection('save')}
              disabled={saving}
            />
          </>
        )}
        <ThemeAction
          label={t(saveError ? 'common.close' : 'theme.cancel')}
          onPress={() => {
            if (busy.current) return;
            if (saveError) void resolveSelection('close');
            else nav.goBack();
          }}
          disabled={saving}
          secondary
        />
      </ScrollView>
    </SafeAreaView>
  );
}
function ThemeAction({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
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
        secondary && styles.secondary,
        pressed && !secondary && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && styles.secondaryText,
          disabled && styles.disabledText,
        ]}
      >
        {label}
      </Text>
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
    previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    previewStack: { flexDirection: 'column' },
    preview: { flexGrow: 1, flexBasis: 150, gap: 6, borderWidth: 1, borderRadius: 20, padding: 12 },
    stackPreview: { flexBasis: 'auto' },
    previewCard: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
    sampleLabel: { fontSize: 14, fontWeight: '600' },
    sampleControl: { padding: 12, borderRadius: 12 },
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
    secondary: { backgroundColor: colors.surface },
    secondaryText: { color: colors.textPrimary },
    pressed: { backgroundColor: colors.brandPressed },
    disabled: { backgroundColor: colors.disabledBg },
    disabledText: { color: colors.disabledText },
  });
