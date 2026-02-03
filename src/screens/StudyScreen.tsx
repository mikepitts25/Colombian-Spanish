import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import Flashcard from '../components/Flashcard';
import ProgressBar from '../components/ProgressBar';
import { getDailyProgress, incrementDailyProgress } from '../storage/storage';

export default function StudyScreen() {
  const { ready, activeDeck, getStudyBatch, recordAnswer, toggleFavorite } = useDeck();
  const [seed, setSeed] = useState(0);
  const batch = useMemo(() => (ready && activeDeck) ? getStudyBatch(15) : [], [ready, activeDeck, seed]);
  const [idx, setIdx] = useState(0);

  const [daily, setDaily] = useState<{ count: number; target: number }>({ count: 0, target: 10 });

  React.useEffect(() => {
    (async () => {
      const dp = await getDailyProgress();
      setDaily({ count: dp.count, target: dp.target });
    })();
  }, []);

  const progress = daily.target > 0 ? Math.min(1, daily.count / daily.target) : 0;
  const percent = Math.round(progress * 100);
  const [congratsShown, setCongratsShown] = useState(false);

  if (!ready) return <SafeAreaView style={styles.wrap}><Text style={styles.h1}>Cargando…</Text></SafeAreaView>;
  if (!activeDeck) return null;

  const card = batch[idx];

  async function grade(q: 0|1|2|3|4|5) {
    if (!card) return;
    await recordAnswer(card.id, q);
    const nextDP = await incrementDailyProgress(1);
    setDaily({ count: nextDP.count, target: nextDP.target });
    if (!congratsShown && nextDP.count >= nextDP.target) {
      setCongratsShown(true);
    }
    setIdx(prev => {
      const next = prev + 1;
      if (next < batch.length) return next;
      // end of batch → reseed and reset index
      setSeed(s => s + 1);
      return 0;
    });
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.h1}>Study — {activeDeck.name}</Text>
        {card ? (
          <Pressable onPress={() => toggleFavorite(card.id)} style={styles.starBtn}>
            <Text style={styles.starText}>{card.favorite ? '★' : '☆'}</Text>
          </Pressable>
        ) : null}
      </View>
      <ProgressBar progress={progress} />
      <Text style={styles.progressLabel}>Daily Progress: {percent}% ({daily.count}/{daily.target})</Text>
      {progress >= 1 && congratsShown && (
        <View style={styles.congratsBox}>
          <Text style={styles.congratsTitle}>¡Bacano! Daily goal complete 🎉</Text>
          <Text style={styles.sub}>Come back tomorrow or keep going if you’re in the zone.</Text>
        </View>
      )}
      {card ? (
        <View style={{ marginTop: spacing(2) }}>
          <Flashcard key={card.id} card={card} onGrade={grade} />
          <Text style={styles.meta}>Interval: {card.interval}d • Ease: {card.ease.toFixed(2)} • Reps: {card.reps}</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  h1: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing(1), flex: 1 },
  starBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1f2937' },
  starText: { color: '#fde047', fontWeight: '900', fontSize: 22 },
  sub: { color: colors.sub },
  meta: { color: colors.sub, textAlign: 'center', marginTop: spacing(1) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  done: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: spacing(1) },
  progressLabel: { color: colors.sub, textAlign: 'center', marginTop: spacing(0.5) },
  congratsBox: { marginTop: spacing(1), backgroundColor: '#052e2b', borderColor: '#065f46', borderWidth: 1, padding: spacing(1.25), borderRadius: 12 },
  congratsTitle: { color: '#a7f3d0', fontWeight: '900', textAlign: 'center', marginBottom: 2 },
});