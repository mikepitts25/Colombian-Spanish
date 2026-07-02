import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native/Libraries/Alert/Alert';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { getDailyProgress, saveDecks, loadDecks } from '../storage/storage';
import * as Clipboard from 'expo-clipboard';
import { useLanguage } from '../context/LanguageContext';

function SettingsRow({
  emoji, title, subtitle, onPress, chevron = true,
}: {
  emoji: string; title: string; subtitle?: string; onPress?: () => void; chevron?: boolean;
}) {
  return (
    <Pressable style={styles.settingsRow} onPress={onPress}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {chevron && <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function SettingsScreen() {
  const nav = useNavigation<any>();
  const { t, toggleLanguage } = useLanguage();
  const [target, setTarget] = useState(10);

  useEffect(() => {
    (async () => {
      const dp = await getDailyProgress();
      setTarget(dp.target ?? 10);
    })();
  }, []);

  async function exportBackup() {
    const decks = await loadDecks();
    const payload = { kind: 'colombian-spanish-backup', version: 1, exportedAt: new Date().toISOString(), decks };
    await Clipboard.setStringAsync(JSON.stringify(payload));
    Alert.alert(t('settings.alert.backupCopied.title'), t('settings.alert.backupCopied.message'));
  }

  async function importBackup() {
    const raw = await Clipboard.getStringAsync();
    if (!raw?.trim()) {
      return Alert.alert(
        t('settings.alert.emptyClipboard.title'),
        t('settings.alert.emptyClipboard.message'),
      );
    }
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return Alert.alert(t('settings.alert.invalidJson.title'), t('settings.alert.invalidJson.message'));
    }
    if (!parsed || parsed.kind !== 'colombian-spanish-backup') {
      return Alert.alert(t('settings.alert.notBackup.title'), t('settings.alert.notBackup.message'));
    }
    if (!Array.isArray(parsed.decks)) {
      return Alert.alert(t('settings.alert.invalidBackup.title'), t('settings.alert.invalidBackup.message'));
    }
    Alert.alert(t('settings.alert.importConfirm.title'), t('settings.alert.importConfirm.message'), [
      { text: t('settings.alert.cancel'), style: 'cancel' },
      {
        text: t('settings.alert.import'),
        style: 'destructive',
        onPress: async () => {
          await saveDecks(parsed.decks);
          Alert.alert(t('settings.alert.imported.title'), t('settings.alert.imported.message'));
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>⚙️  {t('settings.title')}</Text>

        {/* Aprendizaje */}
        <Text style={styles.groupLabel}>{t('settings.section.learning')}</Text>
        <View style={styles.groupCard}>
          <SettingsRow
            emoji="🎯"
            title={t('settings.dailyGoal.title')}
            subtitle={t('settings.dailyGoal.subtitle', { count: target })}
            onPress={() => nav.navigate('DailyGoal')}
          />
          <Divider />
          <SettingsRow
            emoji="🃏"
            title={t('settings.newCards.title')}
            subtitle={t('settings.newCards.subtitle')}
            onPress={() => nav.navigate('DailyGoal')}
          />
          <Divider />
          <SettingsRow
            emoji="🔔"
            title={t('settings.reminders.title')}
            subtitle={t('settings.reminders.subtitle')}
            onPress={() => nav.navigate('Notifications')}
          />
          <Divider />
          <SettingsRow
            emoji="📚"
            title={t('settings.manageDecks.title')}
            subtitle={t('settings.manageDecks.subtitle')}
            onPress={() => nav.navigate('ManageDecks')}
          />
        </View>

        {/* App */}
        <Text style={styles.groupLabel}>{t('settings.section.app')}</Text>
        <View style={styles.groupCard}>
          <SettingsRow
            emoji="🌐"
            title={t('settings.language.title')}
            subtitle={t('settings.language.subtitle')}
            onPress={toggleLanguage}
          />
          <Divider />
          <SettingsRow
            emoji="💾"
            title={t('settings.export.title')}
            subtitle={t('settings.export.subtitle')}
            onPress={exportBackup}
          />
          <Divider />
          <SettingsRow
            emoji="📥"
            title={t('settings.import.title')}
            subtitle={t('settings.import.subtitle')}
            onPress={importBackup}
          />
        </View>

        {/* Sobre la App */}
        <Text style={styles.groupLabel}>{t('settings.section.about')}</Text>
        <View style={styles.groupCard}>
          <SettingsRow
            emoji="⭐"
            title={t('settings.rate.title')}
            subtitle="App Store"
            onPress={() => {}}
          />
          <Divider />
          <SettingsRow
            emoji="📋"
            title={t('settings.version.title')}
            subtitle="v2.0.0 (build 42)"
            chevron={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 120 },

  pageTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },

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

  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowEmoji: { fontSize: 18 },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  rowSubtitle: { color: colors.textSecondary, fontSize: 12 },
  chevron: { color: colors.textSecondary, fontSize: 22, fontWeight: '300' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 46 },
});
