import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import {
  DEFAULT_NOTIFICATION_PREFS,
  NotificationPreferences,
  getNotificationPreferences,
  saveAndScheduleNotificationPreferences,
} from '../services/notifications';

function Toggle({
  value,
  onValueChange,
  testID,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  testID?: string;
}) {
  return (
    <Switch
      testID={testID}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.brand }}
      thumbColor={value ? '#020617' : colors.textTertiary}
      ios_backgroundColor={colors.border}
    />
  );
}

function NotifRow({
  emoji, title, subtitle, value, onValueChange, chevron, testID,
}: {
  emoji: string; title: string; subtitle?: string;
  value?: boolean; onValueChange?: (v: boolean) => void; chevron?: boolean; testID?: string;
}) {
  return (
    <View style={styles.notifRow}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {chevron
        ? <Text style={styles.chevron}>›</Text>
        : <Toggle testID={testID} value={value ?? false} onValueChange={onValueChange ?? (() => {})} />
      }
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function NotificationsScreen() {
  const nav = useNavigation<any>();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS);

  useEffect(() => {
    let mounted = true;
    getNotificationPreferences().then((storedPrefs) => {
      if (mounted) setPrefs(storedPrefs);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function updatePreference<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    void saveAndScheduleNotificationPreferences(next);
  }

  return (
    <SafeAreaView style={styles.wrap}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Ajustes</Text>
        </Pressable>
        <Text style={styles.navTitle}>Notificaciones</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Master toggle */}
        <View style={styles.masterCard}>
          <View style={styles.masterInfo}>
            <Text style={styles.masterTitle}>🔔 Notificaciones</Text>
            <Text style={styles.masterSubtitle}>Recibe recordatorios de estudio</Text>
          </View>
          <Toggle
            testID="notification-master-toggle"
            value={prefs.masterOn}
            onValueChange={(value) => updatePreference('masterOn', value)}
          />
        </View>

        {/* Reminder times */}
        <Text style={styles.groupLabel}>RECORDATORIOS</Text>
        <View style={[styles.groupCard, !prefs.masterOn && styles.groupCardDisabled]}>
          <NotifRow
            emoji="🌅"
            title="Recordatorio Mañana"
            subtitle="8:00 AM"
            value={prefs.masterOn && prefs.morningOn}
            onValueChange={(value) => updatePreference('morningOn', value)}
            testID="notification-morning-toggle"
          />
          <Divider />
          <NotifRow
            emoji="🌃"
            title="Recordatorio Noche"
            subtitle="9:00 PM"
            value={prefs.masterOn && prefs.nightOn}
            onValueChange={(value) => updatePreference('nightOn', value)}
            testID="notification-night-toggle"
          />
          <Divider />
          <NotifRow
            emoji="📆"
            title="Días de Estudio"
            subtitle="Lun • Mar • Mié • Jue • Vie"
            chevron
          />
        </View>

        {/* Alerts */}
        <Text style={styles.groupLabel}>ALERTAS</Text>
        <View style={[styles.groupCard, !prefs.masterOn && styles.groupCardDisabled]}>
          <NotifRow
            emoji="🔥"
            title="Alerta de Racha"
            subtitle="Cuando estés a punto de perder tu racha"
            value={prefs.masterOn && prefs.streakOn}
            onValueChange={(value) => updatePreference('streakOn', value)}
            testID="notification-streak-toggle"
          />
          <Divider />
          <NotifRow
            emoji="🏆"
            title="Logros Desbloqueados"
            subtitle="Celebra cada meta alcanzada"
            value={prefs.masterOn && prefs.achieveOn}
            onValueChange={(value) => updatePreference('achieveOn', value)}
            testID="notification-achievements-toggle"
          />
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            💡 Las notificaciones te ayudan a mantener tu racha de estudio. ¡No las desactives!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 20, backgroundColor: colors.surface },
  backArrow: { color: colors.brand, fontSize: 16, fontWeight: '700' },
  backLabel: { color: colors.brand, fontSize: 14, fontWeight: '600' },
  navTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  navSpacer: { width: 80 },

  scroll: { padding: 16, paddingBottom: 40 },

  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,218,0,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,218,0,0.4)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  masterInfo: { flex: 1, gap: 3 },
  masterTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '800' },
  masterSubtitle: { color: colors.textSecondary, fontSize: 12 },

  groupLabel: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  groupCardDisabled: { opacity: 0.4 },

  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowEmoji: { fontSize: 18 },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  rowSubtitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 16 },
  chevron: { color: colors.textSecondary, fontSize: 22, fontWeight: '300' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 46 },

  noteCard: {
    backgroundColor: 'rgba(255,218,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.2)',
    borderRadius: 14,
    padding: 14,
  },
  noteText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
