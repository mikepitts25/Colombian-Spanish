import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView, StyleSheet, Text, View, ScrollView, Pressable,
} from 'react-native';
import { colors, radius } from '../styles/theme';
import { getDailyProgress, getStudyStreak } from '../storage/storage';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';

function DonutRing({ pct, size = 90 }: { pct: number; size?: number }) {
  const stroke = 12;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: '#1e293b',
        }}
      />
      {/* Filled ring — we approximate with a RN View arc at low fidelity */}
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFDA00', fontSize: 16, fontWeight: '800' }}>
          {Math.round(pct * 100)}%
        </Text>
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { decks, ready } = useDeck();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const [dailyStats, setDailyStats] = useState({ count: 0, target: 10 });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    Promise.all([getDailyProgress(), getStudyStreak()]).then(([dp, s]) => {
      setDailyStats({ count: dp.count, target: dp.target });
      setStreak(s);
    });
  }, []);

  const stats = useMemo(() => {
    if (!ready || !decks) return { total: 0, studied: 0, mastered: 0, due: 0 };
    const now = Date.now();
    let total = 0, studied = 0, mastered = 0, due = 0;
    decks.forEach((d) => d.cards.forEach((c) => {
      total++;
      if (c.reps > 0) studied++;
      if (c.reps >= 3) mastered++;
      if ((c.due || 0) <= now) due++;
    }));
    return { total, studied, mastered, due };
  }, [decks, ready]);

  const deckProgress = useMemo(() => {
    if (!decks) return [];
    return decks
      .map((d) => {
        const total = d.cards.length;
        const studied = d.cards.filter((c) => c.reps > 0).length;
        const due = d.cards.filter((c) => (c.due || 0) <= Date.now()).length;
        return { id: d.id, name: d.name, total, studied, progress: total > 0 ? studied / total : 0, due };
      })
      .filter((d) => d.total > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }, [decks]);

  const dailyPct = dailyStats.target > 0
    ? Math.min(1, dailyStats.count / dailyStats.target)
    : 0;

  const motivation = useMemo(() => {
    if (dailyPct >= 1) return { emoji: '🎉', text: t('progress.motivation.done') };
    if (streak >= 7)   return { emoji: '🔥', text: t('progress.motivation.week', { count: streak }) };
    if (streak >= 3)   return { emoji: '⚡', text: t('progress.motivation.threeDays', { count: streak }) };
    return { emoji: '💪', text: t('progress.motivation.default') };
  }, [dailyPct, streak, t]);

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>📊</Text>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>{t('progress.title')}</Text>
          <Pressable style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>{t('progress.share')}</Text>
          </Pressable>
        </View>

        {/* Streak hero */}
        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <Text style={styles.streakCaptionTop}>{t('progress.currentStreak')}</Text>
            <View style={styles.streakNumRow}>
              <Text style={styles.streakDays}>{streak}</Text>
              <Text style={styles.streakUnit}>{t('progress.days')}</Text>
            </View>
            <Text style={styles.streakCaption}>
              {streak > 0 ? t('progress.streak.keep') : t('progress.streak.start')}
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeEmoji}>🔥</Text>
          </View>
        </View>

        {/* Daily goal card */}
        <View style={styles.dailyCard}>
          <View style={styles.dailyCardRow}>
            <View style={styles.dailyDonut}>
              <DonutRing pct={dailyPct} size={90} />
            </View>
            <View style={styles.dailyRight}>
              <Text style={styles.dailyTitle}>{t('progress.todayGoal')}</Text>
              <Text style={styles.dailySub}>
                {t('progress.dailySub', {
                  count: dailyStats.count,
                  target: dailyStats.target,
                })}
              </Text>
              {/* Mini bar */}
              <View style={styles.dailyBarTrack}>
                <View style={[styles.dailyBarFill, { width: `${dailyPct * 100}%` as any }]} />
              </View>
              <Pressable style={styles.studyMoreBtn} onPress={() => nav.navigate('Study')}>
                <Text style={styles.studyMoreText}>{t('progress.studyMore')}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 2×2 stat grid */}
        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <View style={[styles.statBox, { borderColor: '#FFDA00', backgroundColor: 'rgba(255,218,0,0.08)' }]}>
              <Text style={[styles.statVal, { color: '#FFDA00' }]}>{stats.total.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{t('progress.totalCards')}</Text>
            </View>
            <View style={[styles.statBox, { borderColor: '#003893', backgroundColor: 'rgba(0,56,147,0.15)' }]}>
              <Text style={[styles.statVal, { color: '#60a5fa' }]}>{stats.studied}</Text>
              <Text style={styles.statLabel}>{t('progress.studied')}</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={[styles.statBox, { borderColor: '#CE1126', backgroundColor: 'rgba(206,17,38,0.1)' }]}>
              <Text style={[styles.statVal, { color: '#f87171' }]}>{stats.mastered}</Text>
              <Text style={styles.statLabel}>{t('progress.mastered')}</Text>
            </View>
            <View style={[styles.statBox, { borderColor: 'rgba(255,218,0,0.4)', backgroundColor: 'rgba(255,218,0,0.06)' }]}>
              <Text style={[styles.statVal, { color: '#FFDA00' }]}>{(decks || []).length}</Text>
              <Text style={styles.statLabel}>{t('progress.decks')}</Text>
            </View>
          </View>
        </View>

        {/* Deck progress */}
        {deckProgress.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('progress.byDeck')}</Text>
            {deckProgress.map((deck) => (
              <View key={deck.id} style={styles.deckProgressRow}>
                <View style={styles.deckProgressLeft}>
                  <Text style={styles.deckProgressName} numberOfLines={1}>{deck.name}</Text>
                  <Text style={styles.deckProgressSub}>
                    {t('progress.deckSub', { studied: deck.studied, total: deck.total })}
                  </Text>
                </View>
                <View style={styles.deckProgressBarWrap}>
                  <View style={styles.deckProgressTrack}>
                    <View style={[styles.deckProgressFill, { width: `${deck.progress * 100}%` as any }]} />
                  </View>
                </View>
                {deck.due > 0 && (
                  <View style={styles.deckDuePill}>
                    <Text style={styles.deckDueText}>{deck.due}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Motivation card */}
        <View style={styles.motivCard}>
          <Text style={styles.motivEmoji}>{motivation.emoji}</Text>
          <View style={styles.motivRight}>
            <Text style={styles.motivTitle}>{t('progress.keepGoing')}</Text>
            <Text style={styles.motivText}>{motivation.text}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 120 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: colors.textSecondary, fontSize: 16 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageTitle: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
  shareBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,218,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.4)',
  },
  shareBtnText: { color: colors.brand, fontSize: 12, fontWeight: '700' },

  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,218,0,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,218,0,0.5)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#FFDA00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  streakLeft: { flex: 1, gap: 2 },
  streakCaptionTop: { color: colors.textSecondary, fontSize: 12 },
  streakNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  streakDays: { color: colors.textPrimary, fontSize: 40, fontWeight: '800' },
  streakUnit: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  streakCaption: { color: colors.textTertiary, fontSize: 11 },
  streakBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,218,0,0.12)',
    borderWidth: 2.5,
    borderColor: '#FFDA00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadgeEmoji: { fontSize: 36 },

  dailyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  dailyCardRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  dailyDonut: { alignItems: 'center', justifyContent: 'center' },
  dailyRight: { flex: 1, gap: 6 },
  dailyTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  dailySub: { color: colors.textSecondary, fontSize: 12 },
  dailyBarTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dailyBarFill: { height: 6, backgroundColor: '#FFDA00', borderRadius: 3 },
  studyMoreBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,218,0,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,218,0,0.4)',
  },
  studyMoreText: { color: colors.brand, fontSize: 12, fontWeight: '700' },

  statGrid: { gap: 10, marginBottom: 16 },
  statRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  statVal: { fontSize: 24, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },

  section: { marginBottom: 16 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 10 },

  deckProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  deckProgressLeft: { width: 100 },
  deckProgressName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  deckProgressSub: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  deckProgressBarWrap: { flex: 1 },
  deckProgressTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  deckProgressFill: { height: 6, backgroundColor: '#FFDA00', borderRadius: 3 },
  deckDuePill: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  deckDueText: { color: '#f87171', fontSize: 11, fontWeight: '700' },

  motivCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,218,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,218,0,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  motivEmoji: { fontSize: 28 },
  motivRight: { flex: 1, gap: 3 },
  motivTitle: { color: colors.brand, fontSize: 14, fontWeight: '800' },
  motivText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
