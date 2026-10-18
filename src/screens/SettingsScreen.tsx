import Pressable from '../components/ThemedPressable';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { getDailyProgress, loadDecks } from '../storage/storage';
import { getLearningEvents, validateLearningEvents } from '../storage/learningEvents';
import { MAX_BACKUP_CHARACTERS, validateBackupDecks } from '../storage/backupValidation';
import { restoreBackup } from '../storage/backupRestore';
import {
  captureBackupSnapshot,
  parseBackupText,
  BackupInputError,
  BackupSnapshot,
} from '../storage/backupSnapshot';
import { pickBackupFile, shareBackupFile, BackupFileError } from '../services/backupFiles';
import { getPrefs } from '../storage/prefs';
import * as Clipboard from 'expo-clipboard';
import * as Application from 'expo-application';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useLanguage } from '../context/LanguageContext';

function SettingsRow({
  emoji,
  title,
  subtitle,
  onPress,
  chevron = true,
  disabled = false,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  chevron?: boolean;
  disabled?: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      style={styles.settingsRow}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
    >
      <Text style={styles.rowEmoji} allowFontScaling={false} accessible={false}>
        {emoji}
      </Text>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {chevron && (
        <Text style={styles.chevron} allowFontScaling={false} accessible={false}>
          ›
        </Text>
      )}
    </Pressable>
  );
}

function Divider() {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.divider} />;
}

export default function SettingsScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const { fontScale } = useWindowDimensions();
  const appTheme = useAppTheme();
  const nav = useNavigation<any>();
  const { t, toggleLanguage } = useLanguage();
  const buildLabel = t(
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
      ? 'settings.version.host'
      : 'settings.version.native',
    {
      version: Application.nativeApplicationVersion?.trim() || t('settings.version.unknown'),
      build: Application.nativeBuildVersion?.trim() || t('settings.version.unknown'),
    },
  );
  const [target, setTarget] = useState(10);
  const fileAction = useRef(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [filePreview, setFilePreview] = useState<BackupSnapshot | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [newPerDay, setNewPerDay] = useState(10);

  const [summaryError, setSummaryError] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void Promise.all([getDailyProgress(), getPrefs()])
        .then(([daily, prefs]) => {
          if (!active) return;
          setTarget(daily.target ?? 10);
          setNewPerDay(prefs.newCardsPerDay);
          setSummaryError(false);
        })
        .catch(() => {
          if (active) setSummaryError(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  async function exportBackup() {
    try {
      const [decks, learningEvents] = await Promise.all([loadDecks(), getLearningEvents()]);
      const payload = {
        kind: 'colombian-spanish-backup',
        version: 2,
        exportedAt: new Date().toISOString(),
        decks,
        learningEvents,
      };
      await Clipboard.setStringAsync(JSON.stringify(payload));
      Alert.alert(t('settings.alert.backupCopied.title'), t('settings.alert.backupCopied.message'));
    } catch {
      Alert.alert(t('settings.alert.backupError.title'), t('settings.alert.backupError.message'));
    }
  }

  async function importBackup() {
    let raw: string;
    try {
      raw = await Clipboard.getStringAsync();
    } catch {
      return Alert.alert(
        t('settings.alert.backupError.title'),
        t('settings.alert.backupError.message'),
      );
    }
    if (raw.length > MAX_BACKUP_CHARACTERS) {
      return Alert.alert(
        t('settings.alert.backupTooLarge.title'),
        t('settings.alert.backupTooLarge.message'),
      );
    }
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
      return Alert.alert(
        t('settings.alert.invalidJson.title'),
        t('settings.alert.invalidJson.message'),
      );
    }
    if (!parsed || parsed.kind !== 'colombian-spanish-backup') {
      return Alert.alert(
        t('settings.alert.notBackup.title'),
        t('settings.alert.notBackup.message'),
      );
    }
    if (parsed.version === 3) {
      try {
        setFilePreview(parseBackupText(raw));
      } catch {
        setFileError(t('settings.alert.invalidBackup.message'));
      }
      return;
    }
    if (!Array.isArray(parsed.decks) || ![undefined, 1, 2].includes(parsed.version)) {
      return Alert.alert(
        t('settings.alert.invalidBackup.title'),
        t('settings.alert.invalidBackup.message'),
      );
    }
    try {
      validateBackupDecks(parsed.decks);
      if (parsed.version === 2) validateLearningEvents(parsed.learningEvents);
    } catch {
      return Alert.alert(
        t('settings.alert.invalidBackup.title'),
        t('settings.alert.invalidBackup.message'),
      );
    }
    Alert.alert(
      t('settings.alert.importConfirm.title'),
      t('settings.alert.importConfirm.message'),
      [
        { text: t('settings.alert.cancel'), style: 'cancel' },
        {
          text: t('settings.alert.import'),
          style: 'destructive',
          onPress: () =>
            runFileAction(async () => {
              try {
                await restoreBackup(
                  parsed.decks,
                  parsed.version === 2 ? parsed.learningEvents : undefined,
                );
                Alert.alert(
                  t('settings.alert.imported.title'),
                  t('settings.alert.imported.message'),
                );
              } catch {
                Alert.alert(
                  t('settings.alert.backupError.title'),
                  t('settings.alert.restoreError.message'),
                );
              }
            }),
        },
      ],
    );
  }

  async function runFileAction(action: () => Promise<void>) {
    if (fileAction.current) return;
    fileAction.current = true;
    setFileBusy(true);
    setFileError(null);
    try {
      await action();
    } catch (error) {
      if (
        (error instanceof BackupFileError || error instanceof BackupInputError) &&
        error.code === 'tooLarge'
      ) {
        setFileError(
          `${t('settings.alert.fileTooLarge.title')}\n${t('settings.alert.fileTooLarge.message')}`,
        );
      } else if (error instanceof BackupFileError && error.code === 'unavailable') {
        setFileError(
          `${t('settings.alert.sharingUnavailable.title')}\n${t('settings.alert.sharingUnavailable.message')}`,
        );
      } else if (error instanceof BackupInputError) {
        setFileError(
          `${t('settings.alert.invalidBackup.title')}\n${t('settings.alert.invalidBackup.message')}`,
        );
      } else {
        setFileError(
          `${t('settings.alert.backupError.title')}\n${t('settings.alert.backupError.message')}`,
        );
      }
    } finally {
      fileAction.current = false;
      setFileBusy(false);
    }
  }

  async function applyFileBackup(
    backup: BackupSnapshot,
    mode: 'replace' | 'merge-new' | 'replace-state',
  ) {
    try {
      if (mode === 'replace-state')
        await restoreBackup(backup.decks, backup.learningEvents, mode, backup.applicationState);
      else await restoreBackup(backup.decks, backup.learningEvents, mode);
      setFilePreview(null);
      Alert.alert(
        t('settings.alert.imported.title'),
        t(mode === 'replace-state' ? 'settings.file.restart' : 'settings.alert.imported.message'),
      );
    } catch {
      setFileError(t('settings.alert.restoreError.message'));
    }
  }

  async function importFile() {
    const raw = await pickBackupFile();
    if (raw !== null) setFilePreview(parseBackupText(raw));
  }

  return (
    <SafeAreaView style={styles.wrap}>
      {fileError && (
        <Text accessibilityRole="alert" style={styles.fileError}>
          {fileError}
        </Text>
      )}
      {filePreview && (
        <ScrollView
          key={`preview-${fontScale}`}
          style={styles.previewPanel}
          contentContainerStyle={{ gap: 12 }}
        >
          <Text accessibilityRole="header" style={styles.rowTitle}>
            {t('settings.file.previewTitle')}
          </Text>
          <Text style={styles.rowSubtitle}>
            {t('settings.file.preview', {
              date: filePreview.exportedAt ?? t('settings.file.unknownDate'),
              decks: filePreview.decks.length,
              cards: filePreview.decks.reduce((sum, deck) => sum + deck.cards.length, 0),
              events: filePreview.learningEvents?.length ?? 0,
            })}
          </Text>
          <Text style={styles.rowSubtitle}>
            {t(
              filePreview.version === 3
                ? 'settings.file.stateIncluded'
                : 'settings.file.stateOmitted',
            )}
          </Text>
          {filePreview.version === 3 && (
            <Pressable
              accessibilityRole="button"
              style={styles.previewButton}
              disabled={fileBusy}
              onPress={() => runFileAction(() => applyFileBackup(filePreview, 'replace-state'))}
            >
              <Text style={{ color: colors.restoreDanger }}>{t('settings.file.restoreState')}</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            style={styles.previewButton}
            disabled={fileBusy}
            onPress={() => runFileAction(() => applyFileBackup(filePreview, 'merge-new'))}
          >
            <Text style={{ color: colors.brand }}>{t('settings.file.merge')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.previewButton}
            disabled={fileBusy}
            onPress={() => runFileAction(() => applyFileBackup(filePreview, 'replace'))}
          >
            <Text style={{ color: colors.restoreDanger }}>{t('settings.file.replace')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.previewButton}
            disabled={fileBusy}
            onPress={() => {
              setFilePreview(null);
              setFileError(null);
            }}
          >
            <Text style={{ color: colors.textPrimary }}>{t('settings.alert.cancel')}</Text>
          </Pressable>
        </ScrollView>
      )}
      <ScrollView
        key={`settings-${fontScale}`}
        style={filePreview ? { display: 'none' } : undefined}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>⚙️ {t('settings.title')}</Text>

        {/* Aprendizaje */}
        <Text style={styles.groupLabel}>{t('settings.section.learning')}</Text>
        <View style={styles.groupCard}>
          <SettingsRow
            emoji="🧭"
            title={t('profile.title')}
            onPress={() => nav.navigate('LearningPreferences')}
          />
          <Divider />
          <SettingsRow
            emoji="🎯"
            title={t('settings.dailyGoal.title')}
            subtitle={
              summaryError
                ? t('settings.learningSummaryUnavailable')
                : t('settings.dailyGoal.subtitle', { count: target })
            }
            onPress={() => nav.navigate('DailyGoal')}
          />
          <Divider />
          <SettingsRow
            emoji="🃏"
            title={t('settings.newCards.title')}
            subtitle={
              summaryError
                ? t('settings.learningSummaryUnavailable')
                : t('settings.newCards.subtitle', { count: newPerDay })
            }
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
            emoji="🎨"
            title={t('theme.title')}
            subtitle={t('theme.summary', {
              theme: t(`theme.${appTheme.id}`),
              appearance: t(`theme.${appTheme.appearance}`),
            })}
            onPress={() => nav.navigate('ThemeSettings')}
          />
          <Divider />
          <SettingsRow
            emoji="🔊"
            title={t('audio.title')}
            subtitle={t('audio.settingsNote')}
            onPress={() => nav.navigate('AudioPreferences')}
          />
          <Divider />
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
            disabled={fileBusy || filePreview !== null}
            onPress={() => runFileAction(exportBackup)}
          />
          <Divider />
          <SettingsRow
            emoji="📥"
            title={t('settings.import.title')}
            subtitle={t('settings.import.subtitle')}
            disabled={fileBusy || filePreview !== null}
            onPress={() => runFileAction(importBackup)}
          />
          <Divider />
          <SettingsRow
            emoji="📄"
            title={t('settings.file.export')}
            subtitle={t('settings.file.exportSub')}
            disabled={fileBusy || filePreview !== null}
            onPress={() =>
              runFileAction(async () => {
                const snapshot = await captureBackupSnapshot();
                await shareBackupFile(JSON.stringify(snapshot), t('settings.file.export'));
              })
            }
          />
          <Divider />
          <SettingsRow
            emoji="📂"
            title={t('settings.file.import')}
            subtitle={t('settings.file.importSub')}
            disabled={fileBusy || filePreview !== null}
            onPress={() => runFileAction(importFile)}
          />
        </View>

        {/* Sobre la App */}
        <Text style={styles.groupLabel}>{t('settings.section.about')}</Text>
        <View style={styles.groupCard}>
          <SettingsRow
            emoji="📋"
            title={t('settings.version.title')}
            subtitle={buildLabel}
            chevron={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    previewPanel: {
      flex: 1,
      margin: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.brand,
    },
    previewButton: { minHeight: 44, justifyContent: 'center', padding: 8 },
    fileError: { color: colors.textPrimary, padding: 16 },
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
