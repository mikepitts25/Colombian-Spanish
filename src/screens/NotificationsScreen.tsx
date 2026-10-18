import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  DEFAULT_NOTIFICATION_PREFS,
  NotificationPreferences,
  NotificationScheduleResult,
  getNotificationPreferences,
  saveAndScheduleNotificationPreferences,
} from '../services/notifications';
import { useLanguage } from '../context/LanguageContext';

function ReminderSwitch({
  title,
  subtitle,
  value,
  disabled,
  onChange,
  testID,
  expanded,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
  testID: string;
  expanded: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, expanded && styles.expandedRow]}>
      <View style={styles.info}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.body}>{subtitle}</Text>
      </View>
      <View style={styles.switchTarget}>
        <Switch
          accessibilityLabel={title}
          accessibilityState={{ checked: value, disabled }}
          hitSlop={10}
          testID={testID}
          value={value}
          disabled={disabled}
          onValueChange={onChange}
          trackColor={{ false: colors.border, true: colors.brand }}
          thumbColor={value ? colors.onBrand : colors.textTertiary}
          ios_backgroundColor={colors.border}
        />
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const styles = useThemedStyles(makeStyles);
  const nav = useNavigation<any>();
  const { fontScale } = useWindowDimensions();
  const { t } = useLanguage();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<NotificationScheduleResult | 'save-error'>();
  const mounted = useRef(false);
  const reading = useRef(false);
  const submitting = useRef(false);

  const load = useCallback(async () => {
    if (reading.current || submitting.current) return;
    reading.current = true;
    try {
      const saved = await getNotificationPreferences();
      if (mounted.current) setPrefs(saved);
    } catch {
      if (mounted.current) setLoadError(true);
    } finally {
      reading.current = false;
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    // Read persisted external state; all state updates follow the async read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  async function save(next: NotificationPreferences) {
    if (reading.current || submitting.current || loading || loadError) return;
    submitting.current = true;
    setSaving(true);
    setStatus(undefined);
    const previous = prefs;
    setPrefs(next);
    try {
      const result = await saveAndScheduleNotificationPreferences(next);
      if (mounted.current) setStatus(result);
    } catch {
      if (mounted.current) {
        setPrefs(previous);
        setStatus('save-error');
      }
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  function update(key: 'masterOn' | 'morningOn' | 'nightOn', value: boolean) {
    if (key !== 'masterOn' && !prefs.masterOn) return;
    void save({ ...prefs, [key]: value });
  }

  const locked = loading || loadError || saving;
  const expanded = fontScale > 1.3;
  const statusText =
    status === 'save-error'
      ? t('notifications.saveError')
      : status === 'scheduled'
        ? t('notifications.scheduled')
        : status === 'off'
          ? t('notifications.off')
          : status === 'denied'
            ? t('notifications.denied')
            : status === 'error'
              ? t('notifications.scheduleError')
              : undefined;

  return (
    <SafeAreaView key={fontScale} style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('notifications.back')}
          accessibilityState={{ disabled: saving }}
          disabled={saving}
          onPress={() => {
            if (!submitting.current) nav.goBack();
          }}
          style={styles.back}
        >
          <Text style={styles.backText}>{t('notifications.back')}</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>
          {t('notifications.title')}
        </Text>
        {loading && (
          <Text accessibilityLiveRegion="polite" style={styles.body}>
            {t('notifications.loading')}
          </Text>
        )}
        {loadError && (
          <Text accessibilityRole="alert" style={styles.body}>
            {t('notifications.loadError')}
          </Text>
        )}
        {saving && (
          <Text accessibilityLiveRegion="polite" style={styles.body}>
            {t('notifications.saving')}
          </Text>
        )}
        {statusText && (
          <Text accessibilityLiveRegion="polite" style={styles.body}>
            {statusText}
          </Text>
        )}
        {(loadError || status === 'error' || status === 'denied') && (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: saving || loading }}
            disabled={saving || loading}
            onPress={() => {
              if (loadError) {
                setLoading(true);
                setLoadError(false);
                void load();
              } else void save(prefs);
            }}
            style={styles.back}
          >
            <Text style={styles.backText}>{t('notifications.retry')}</Text>
          </Pressable>
        )}
        <View style={styles.card}>
          <ReminderSwitch
            title={t('notifications.masterTitle')}
            subtitle={t('notifications.masterSub')}
            value={prefs.masterOn}
            disabled={locked}
            onChange={(value) => update('masterOn', value)}
            testID="notification-master-toggle"
            expanded={expanded}
          />
        </View>
        <Text style={styles.groupTitle}>{t('notifications.reminders')}</Text>
        <View style={styles.card}>
          <ReminderSwitch
            title={t('notifications.morningReminder')}
            subtitle={t('notifications.morningTime')}
            value={prefs.morningOn}
            disabled={locked || !prefs.masterOn}
            onChange={(value) => update('morningOn', value)}
            testID="notification-morning-toggle"
            expanded={expanded}
          />
          <View style={styles.divider} />
          <ReminderSwitch
            title={t('notifications.nightReminder')}
            subtitle={t('notifications.nightTime')}
            value={prefs.nightOn}
            disabled={locked || !prefs.masterOn}
            onChange={(value) => update('nightOn', value)}
            testID="notification-night-toggle"
            expanded={expanded}
          />
        </View>
        <Text style={styles.body}>{t('notifications.note')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40, gap: 16 },
    back: {
      alignSelf: 'flex-start',
      minHeight: 48,
      paddingHorizontal: 16,
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    backText: { color: colors.brand, fontSize: 16, fontWeight: '700' },
    title: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
    groupTitle: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
    expandedRow: { flexDirection: 'column', alignItems: 'stretch' },
    info: { flex: 1, gap: 6 },
    rowTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
    body: { color: colors.textSecondary, fontSize: 16, lineHeight: 24 },
    switchTarget: {
      minHeight: 48,
      minWidth: 48,
      justifyContent: 'center',
      alignSelf: 'flex-start',
    },
    divider: { height: 1, backgroundColor: colors.border },
  });
