import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import Flashcard from '../components/Flashcard';
import ProgressBar from '../components/ProgressBar';
import { getDailyProgress, incrementDailyProgress } from '../storage/storage';
import { getPrefs, setPrefs, Prefs } from '../storage/prefs';
import * as Speech from 'expo-speech';
import ConjugationPanel from '../components/ConjugationPanel';
import { isVerb } from '../utils/verbUtils';

export default function StudyScreen() {
  const { ready, activeDeck, getStudyBatch, recordAnswer } = useDeck();
  const [seed, setSeed] = useState(0);
  const batch = useMemo(() => {
    // seed is used to force a new memoized batch when the user finishes a set
    void seed;
    return ready && activeDeck ? getStudyBatch(15) : [];
  }, [ready, activeDeck, seed, getStudyBatch]);
  const [idx, setIdx] = useState(0);

  const [daily, setDaily] = useState<{ count: number; target: number }>({ count: 0, target: 10 });
  const [prefs, setPrefsState] = useState<Prefs>({ autoSpeak: false, speechRate: 0.98 });

  React.useEffect(() => {
    (async () => {
      const dp = await getDailyProgress();
      setDaily({ count: dp.count, target: dp.target });
      const p = await getPrefs();
      setPrefsState(p);
    })();
  }, []);

  const progress = daily.target > 0 ? Math.min(1, daily.count / daily.target) : 0;
  const percent = Math.round(progress * 100);
  const [congratsShown, setCongratsShown] = useState(false);

  // Compute card for auto-speak effect - must be before early returns
  const cardForSpeak = ready && activeDeck ? batch[idx] : null;

  React.useEffect(() => {
    if (!cardForSpeak) return;
    if (!prefs.autoSpeak) return;
    Speech.stop();
    Speech.speak(cardForSpeak.front, { language: 'es-CO', pitch: 1.03, rate: prefs.speechRate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardForSpeak?.id, prefs.autoSpeak, prefs.speechRate]);

  if (!ready)
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.h1}>Cargando…</Text>
      </SafeAreaView>
    );
  if (!activeDeck) return null;

  const card = batch[idx];

  async function grade(q: 0 | 1 | 2 | 3 | 4 | 5) {
    if (!card) return;
    await recordAnswer(card.id, q);
    const nextDP = await incrementDailyProgress(1);
    setDaily({ count: nextDP.count, target: nextDP.target });
    if (!congratsShown && nextDP.count >= nextDP.target) {
      setCongratsShown(true);
    }
    setIdx((prev) => {
      const next = prev + 1;
      if (next < batch.length) return next;
      // end of batch → reseed and reset index
      setSeed((s) => s + 1);
      return 0;
    });
  }

  async function toggleAutoSpeak() {
    const next = await setPrefs({ autoSpeak: !prefs.autoSpeak });
    setPrefsState(next);
  }

  async function bumpRate(delta: number) {
    const next = await setPrefs({
      speechRate: Math.max(0.6, Math.min(1.3, +(prefs.speechRate + delta).toFixed(2))),
    });
    setPrefsState(next);
  }

  function replay() {
    if (!card) return;
    Speech.stop();
    Speech.speak(card.front, { language: 'es-CO', pitch: 1.03, rate: prefs.speechRate });
  }

  function stop() {
    Speech.stop();
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Study — {activeDeck.name}</Text>

      <View style={styles.audioRow}>
        <Pressable
          style={[styles.audioBtn, prefs.autoSpeak && styles.audioBtnOn]}
          onPress={toggleAutoSpeak}
        >
          <Text style={[styles.audioBtnText, prefs.autoSpeak && styles.audioBtnTextOn]}>
            {prefs.autoSpeak ? 'Auto 🔊 ON' : 'Auto 🔊 OFF'}
          </Text>
        </Pressable>
        <Pressable style={styles.audioBtn} onPress={replay}>
          <Text style={styles.audioBtnText}>Replay</Text>
        </Pressable>
        <Pressable style={styles.audioBtn} onPress={stop}>
          <Text style={styles.audioBtnText}>Stop</Text>
        </Pressable>

        {/* Conjugation panel — shown for verb cards */}
        {isVerb(card) && <ConjugationPanel infinitive={card.front} />}
      </View>

      <View style={styles.rateRow}>
        <Text style={styles.rateLabel}>Rate: {prefs.speechRate.toFixed(2)}</Text>
        <Pressable style={styles.rateBtn} onPress={() => bumpRate(-0.05)}>
          <Text style={styles.rateBtnText}>-</Text>
        </Pressable>
        <Pressable style={styles.rateBtn} onPress={() => bumpRate(+0.05)}>
          <Text style={styles.rateBtnText}>+</Text>
        </Pressable>
      </View>

      <ProgressBar progress={progress} />
      <Text style={styles.progressLabel}>
        Daily Progress: {percent}% ({daily.count}/{daily.target})
      </Text>
      {progress >= 1 && congratsShown && (
        <View style={styles.congratsBox}>
          <Text style={styles.congratsTitle}>¡Bacano! Daily goal complete 🎉</Text>
          <Text style={styles.sub}>Come back tomorrow or keep going if you’re in the zone.</Text>
        </View>
      )}
      {card ? (
        <View style={{ marginTop: spacing(2) }}>
          <Flashcard key={card.id} card={card} onGrade={grade} />
          <Text style={styles.meta}>
            Interval: {card.interval}d • Ease: {card.ease.toFixed(2)} • Reps: {card.reps}
          </Text>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.done}>No due cards. Nice work! 🎉</Text>
          <Text style={styles.sub}>Come back later or add new cards.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: spacing(1) },
  audioRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  audioBtn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  audioBtnOn: { backgroundColor: '#052e2b', borderColor: '#065f46' },
  audioBtnText: { color: '#e2e8f0', fontWeight: '900' },
  audioBtnTextOn: { color: '#a7f3d0' },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing(1) },
  rateLabel: { color: colors.textSecondary, fontWeight: '800' },
  rateBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  rateBtnText: { color: '#e2e8f0', fontWeight: '900', fontSize: 18 },
  sub: { color: colors.textSecondary },
  meta: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing(1) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  done: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: spacing(1) },
  progressLabel: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing(0.5) },
  congratsBox: {
    marginTop: spacing(1),
    backgroundColor: '#052e2b',
    borderColor: '#065f46',
    borderWidth: 1,
    padding: spacing(1.25),
    borderRadius: 12,
  },
  congratsTitle: { color: '#a7f3d0', fontWeight: '900', textAlign: 'center', marginBottom: 2 },
});
