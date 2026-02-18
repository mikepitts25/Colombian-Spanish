import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { getDailyProgress, setDailyTarget, saveDecks, loadDecks } from '../storage/storage';
import * as Clipboard from 'expo-clipboard';

export default function SettingsScreen() {
  const [target, setTarget] = useState(10);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const dp = await getDailyProgress();
      setTarget(dp.target ?? 10);
      setLoaded(true);
    })();
  }, []);

  async function setGoal(next: number) {
    const dp = await setDailyTarget(next);
    setTarget(dp.target);
  }

  async function exportBackup() {
    const decks = await loadDecks();
    const payload = {
      kind: 'colombian-spanish-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      decks,
    };
    const json = JSON.stringify(payload);
    await Clipboard.setStringAsync(json);
    Alert.alert(
      'Backup copied',
      'Your decks/learning data backup JSON was copied to clipboard. Paste it somewhere safe.',
    );
  }

  async function importBackup() {
    const raw = await Clipboard.getStringAsync();
    if (!raw || !raw.trim())
      return Alert.alert('Nothing to import', 'Clipboard is empty. Copy a backup JSON first.');

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return Alert.alert('Invalid JSON', 'Clipboard does not contain valid JSON.');
    }

    if (!parsed || parsed.kind !== 'colombian-spanish-backup') {
      return Alert.alert(
        'Not a backup',
        'Clipboard JSON is not a Colombian Spanish backup export.',
      );
    }
    if (!Array.isArray(parsed.decks)) {
      return Alert.alert('Invalid backup', 'Backup is missing decks.');
    }

    Alert.alert(
      'Import backup?',
      'This will replace your current decks + progress on this device. Make sure you exported first if you want to keep what you have.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace & Import',
          style: 'destructive',
          onPress: async () => {
            await saveDecks(parsed.decks);
            Alert.alert(
              'Imported',
              'Backup imported. Restart the app if anything looks out of date.',
            );
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your learning experience</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Daily goal</Text>
        <Text style={styles.p}>Cards per day: {loaded ? target : '…'}</Text>
        <View style={styles.row}>
          {[5, 10, 15, 25].map((n) => (
            <Pressable
              key={n}
              style={[styles.pill, target === n && styles.pillActive]}
              onPress={() => setGoal(n)}
            >
              <Text style={[styles.pillText, target === n && styles.pillTextActive]}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sub}>This controls the daily progress meter on the Study screen.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Backup</Text>
        <Text style={styles.p}>
          Export/import your decks + SRS progress as JSON (via clipboard).
        </Text>
        <Pressable style={styles.primary} onPress={exportBackup}>
          <Text style={styles.primaryText}>Copy backup JSON</Text>
        </Pressable>
        <Pressable
          style={[styles.primary, { backgroundColor: '#0ea5e9', marginTop: 8 }]}
          onPress={importBackup}
        >
          <Text style={styles.primaryText}>Import from clipboard</Text>
        </Pressable>
        <Text style={styles.sub}>
          Tip: export first, then import on another device. Everything stays local.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Safety</Text>
        <Text style={styles.p}>
          This app is offline-first and stores data locally on your device.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2), gap: spacing(2) },
  header: {
    paddingBottom: spacing(0.5),
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.sub,
    fontSize: 16,
    marginTop: spacing(0.5),
  },
  h2: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 6 },
  p: { color: colors.sub },
  sub: { color: colors.sub, marginTop: 8 },
  card: {
    backgroundColor: '#0e1526',
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 14,
    padding: spacing(1.5),
    gap: 8,
  },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  pillActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  pillText: { color: '#cbd5e1', fontWeight: '900' },
  pillTextActive: { color: 'white' },
  primary: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  primaryText: { color: 'white', fontWeight: '900' },
});
