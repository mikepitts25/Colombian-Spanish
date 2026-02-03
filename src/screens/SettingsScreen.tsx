import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { getDailyProgress, setDailyTarget } from '../storage/storage';
import * as Clipboard from 'expo-clipboard';
import { loadDecks } from '../storage/storage';

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
    Alert.alert('Backup copied', 'Your decks/learning data backup JSON was copied to clipboard. Paste it somewhere safe.');
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.h2}>Daily goal</Text>
        <Text style={styles.p}>Cards per day: {loaded ? target : '…'}</Text>
        <View style={styles.row}>
          {[5, 10, 15, 25].map((n) => (
            <Pressable key={n} style={[styles.pill, target === n && styles.pillActive]} onPress={() => setGoal(n)}>
              <Text style={[styles.pillText, target === n && styles.pillTextActive]}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sub}>This controls the daily progress meter on the Study screen.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Backup</Text>
        <Text style={styles.p}>Export your decks and progress as JSON (copied to clipboard).</Text>
        <Pressable style={styles.primary} onPress={exportBackup}>
          <Text style={styles.primaryText}>Copy backup JSON</Text>
        </Pressable>
        <Text style={styles.sub}>Import UI is next. This keeps everything local and private.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Safety</Text>
        <Text style={styles.p}>This app is offline-first and stores data locally on your device.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2), gap: spacing(2) },
  h1: { color: colors.text, fontSize: 22, fontWeight: '900' },
  h2: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 6 },
  p: { color: colors.sub },
  sub: { color: colors.sub, marginTop: 8 },
  card: { backgroundColor: '#0e1526', borderWidth: 1, borderColor: '#111827', borderRadius: 14, padding: spacing(1.5), gap: 8 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937' },
  pillActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  pillText: { color: '#cbd5e1', fontWeight: '900' },
  pillTextActive: { color: 'white' },
  primary: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  primaryText: { color: 'white', fontWeight: '900' },
});
