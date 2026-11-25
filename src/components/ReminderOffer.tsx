import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Pressable from './ThemedPressable';
import { useLanguage } from '../context/LanguageContext';
import { useThemedStyles } from '../context/ThemeContext';
import {
  canOfferReminders,
  dismissReminderOffer,
  enableFirstReminder,
  type NotificationScheduleResult,
} from '../services/notifications';
import type { AppTheme } from '../styles/appTheme';

export default function ReminderOffer() {
  const { t } = useLanguage();
  const nav = useNavigation<any>();
  const styles = useThemedStyles(makeStyles);
  const [state, setState] = useState<NotificationScheduleResult | 'offer' | 'saveError'>();
  const [busy, setBusy] = useState(false);
  const mounted = useRef(false);
  const submitting = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let active = true;
    void canOfferReminders()
      .then((available) => {
        if (active && available) setState('offer');
      })
      .catch(() => {});
    return () => {
      active = false;
      mounted.current = false;
    };
  }, []);

  async function respond(enable: boolean) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    try {
      if (enable) {
        const result = await enableFirstReminder();
        if (mounted.current) setState(result);
      } else {
        await dismissReminderOffer();
        if (mounted.current) setState(undefined);
      }
    } catch {
      if (mounted.current) setState('saveError');
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  if (!state || state === 'off') return null;
  const asking = state === 'offer' || state === 'saveError';
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t('notifications.offerTitle')}
      </Text>
      <Text accessibilityLiveRegion="polite" style={styles.body}>
        {t(
          state === 'scheduled'
            ? 'notifications.scheduled'
            : state === 'saveError'
              ? 'notifications.offerError'
              : asking
                ? 'notifications.offerBody'
                : state === 'denied'
                  ? 'notifications.denied'
                  : 'notifications.scheduleError',
        )}
      </Text>
      {asking ? (
        <>
          <Pressable
            accessibilityRole="button"
            style={styles.action}
            disabled={busy}
            onPress={() => void respond(true)}
          >
            <Text style={styles.actionText}>{t('notifications.offerEnable')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.action}
            disabled={busy}
            onPress={() => void respond(false)}
          >
            <Text style={styles.actionText}>{t('notifications.offerLater')}</Text>
          </Pressable>
        </>
      ) : state === 'scheduled' ? (
        <Pressable
          accessibilityRole="button"
          style={styles.action}
          onPress={() => setState(undefined)}
        >
          <Text style={styles.actionText}>{t('common.close')}</Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          style={styles.action}
          onPress={() => nav.navigate('Notifications')}
        >
          <Text style={styles.actionText}>{t('notifications.offerSettings')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    card: { padding: 16, gap: 8, borderRadius: 16, backgroundColor: colors.surface },
    heading: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
    body: { color: colors.textSecondary, fontSize: 15, lineHeight: 21 },
    action: {
      minHeight: 48,
      justifyContent: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 4,
    },
    actionText: { color: colors.brand, fontSize: 16, fontWeight: '700' },
  });
