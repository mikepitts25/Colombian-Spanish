import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useLanguage } from '../context/LanguageContext';

type FlaggedRow = { deckName: string; card: any };

export default function FlaggedScreen() {
  const { ready, decks, clearAllFlags } = useDeck();
  const { t } = useLanguage();

  const flagged = useMemo<FlaggedRow[]>(() => {
    return (decks || []).flatMap((d) =>
      (d.cards || [])
        .filter((c: any) => c.flagged)
        .map((c: any) => ({ deckName: d.name, card: c })),
    );
  }, [decks]);

  async function copyCSV() {
    if (flagged.length === 0) return;
    const header = 'Deck,Card ID,Spanish,English,Example';
    const rows = flagged.map(({ deckName, card }) => {
      const escape = (s: string) => `"${(s ?? '').replace(/"/g, '""')}"`;
      return [
        escape(deckName),
        escape(card.id),
        escape(card.front),
        escape(card.back),
        escape(card.example ?? ''),
      ].join(',');
    });
    await Clipboard.setStringAsync([header, ...rows].join('\n'));
    Alert.alert(
      t('flagged.copied.title'),
      t('flagged.copied.message', {
        count: flagged.length,
        plural: flagged.length === 1 ? '' : 's',
      }),
    );
  }

  function confirmClear() {
    Alert.alert(
      t('flagged.clear.title'),
      t('flagged.clear.message', {
        count: flagged.length,
        plural: flagged.length === 1 ? '' : 's',
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('flagged.clearAll'),
          style: 'destructive',
          onPress: () => clearAllFlags(),
        },
      ],
    );
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.h1}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>{t('flagged.title')}</Text>
      <Text style={styles.sub}>
        {flagged.length === 0
          ? t('flagged.emptySub')
          : t('flagged.countSub', {
            count: flagged.length,
            plural: flagged.length === 1 ? '' : 's',
            verbPlural: flagged.length === 1 ? '' : 'n',
          })}
      </Text>

      {flagged.length > 0 && (
        <View style={styles.actions}>
          <Pressable style={styles.exportBtn} onPress={copyCSV}>
            <Text style={styles.exportBtnText}>{t('flagged.copyCsv')}</Text>
          </Pressable>
          <Pressable style={styles.clearBtn} onPress={confirmClear}>
            <Text style={styles.clearBtnText}>{t('flagged.clearAll')}</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.hint}>
        <Text style={styles.hintText}>{t('flagged.hint')}</Text>
      </View>

      <FlatList
        data={flagged}
        keyExtractor={(x) => x.card.id}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>{t('flagged.empty')}</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <View style={styles.rowNum}>
              <Text style={styles.rowNumText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.deckBadge}>
                <Text style={styles.deckBadgeText}>{item.deckName}</Text>
              </View>
              <Text style={styles.spanish}>{item.card.front}</Text>
              <Text style={styles.english}>{item.card.back}</Text>
              {item.card.example ? (
                <Text style={styles.example}>"{item.card.example}"</Text>
              ) : null}
              <Text style={styles.cardId}>ID: {item.card.id}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  sub: { color: colors.textSecondary, marginBottom: spacing(1.5) },

  actions: { flexDirection: 'row', gap: 10, marginBottom: spacing(1.5) },
  exportBtn: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exportBtnText: { color: 'white', fontWeight: '900' },
  clearBtn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  clearBtnText: { color: '#ef4444', fontWeight: '900' },

  hint: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 10,
    padding: spacing(1.25),
    marginBottom: spacing(1.5),
  },
  hintText: { color: '#475569', fontSize: 12, lineHeight: 18 },

  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: spacing(1.5),
    marginBottom: 10,
  },
  rowNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowNumText: { color: '#f87171', fontWeight: '900', fontSize: 13 },

  deckBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  deckBadgeText: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },

  spanish: { color: '#f8fafc', fontSize: 18, fontWeight: '900', marginBottom: 2 },
  english: { color: '#93c5fd', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  example: { color: '#64748b', fontStyle: 'italic', fontSize: 13, marginBottom: 6 },
  cardId: { color: '#334155', fontSize: 11, fontFamily: 'monospace' },

  emptyWrap: { alignItems: 'center', paddingTop: spacing(6) },
  emptyEmoji: { fontSize: 48, marginBottom: spacing(1) },
  emptyText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
