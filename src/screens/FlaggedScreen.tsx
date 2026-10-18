import Pressable from '../components/ThemedPressable';
import { useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreventRemove } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useLanguage } from '../context/LanguageContext';
import type { FlashCard } from '../types';

type FlaggedRow = { deckName: string; card: FlashCard };

export default function FlaggedScreen() {
  const styles = useThemedStyles(makeStyles);
  const { ready, decks, clearAllFlags } = useDeck();
  const { t } = useLanguage();
  const { fontScale } = useWindowDimensions();
  const [operation, setOperation] = useState<'copy' | 'clear' | null>(null);
  const [error, setError] = useState<'copy' | 'clear' | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  usePreventRemove(operation !== null, () => {});
  const flagged = useMemo<FlaggedRow[]>(
    () =>
      (decks || []).flatMap((deck) =>
        (deck.cards || [])
          .filter((card) => card.flagged)
          .map((card) => ({ deckName: deck.name, card })),
      ),
    [decks],
  );

  async function run(kind: 'copy' | 'clear') {
    if (busy.current || !ready || flagged.length === 0) return;
    busy.current = true;
    setOperation(kind);
    setError(null);
    try {
      if (kind === 'copy') {
        const escape = (value?: string) => `"${(value ?? '').replace(/"/g, '""')}"`;
        const snapshot = flagged.map(({ deckName, card }) =>
          [deckName, card.id, card.front, card.back, card.example].map(escape).join(','),
        );
        await Clipboard.setStringAsync(
          ['Deck,Card ID,Spanish,English,Example', ...snapshot].join('\n'),
        );
        if (mounted.current)
          Alert.alert(
            t('flagged.copied.title'),
            t('flagged.copied.message', {
              count: snapshot.length,
              plural: snapshot.length === 1 ? '' : 's',
            }),
          );
      } else {
        await clearAllFlags();
      }
    } catch {
      if (mounted.current) setError(kind);
    } finally {
      busy.current = false;
      if (mounted.current) setOperation(null);
    }
  }

  function confirmClear() {
    if (busy.current || !ready || flagged.length === 0) return;
    Alert.alert(
      t('flagged.clear.title'),
      t('flagged.clear.message', {
        count: flagged.length,
        plural: flagged.length === 1 ? '' : 's',
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('flagged.clearAll'), style: 'destructive', onPress: () => run('clear') },
      ],
    );
  }

  if (!ready)
    return (
      <SafeAreaView key={fontScale} style={styles.wrap}>
        <Text style={styles.h1}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  return (
    <SafeAreaView key={fontScale} style={styles.wrap}>
      <FlatList
        data={flagged}
        keyExtractor={(item) => item.card.id}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
        ListHeaderComponent={
          <>
            <Text accessibilityRole="header" style={styles.h1}>
              {t('flagged.title')}
            </Text>
            <Text style={styles.sub}>
              {flagged.length === 0
                ? t('flagged.emptySub')
                : t('flagged.countSub', {
                    count: flagged.length,
                    plural: flagged.length === 1 ? '' : 's',
                    verbPlural: flagged.length === 1 ? '' : 'n',
                  })}
            </Text>
            {operation && (
              <Text accessibilityRole="alert" style={styles.sub}>
                {t(operation === 'copy' ? 'flagged.copying' : 'flagged.clearing')}
              </Text>
            )}
            {error && (
              <Text accessibilityRole="alert" style={styles.sub}>
                {t(error === 'copy' ? 'flagged.copyError' : 'flagged.clearError')}
              </Text>
            )}
            {flagged.length > 0 && (
              <View style={[styles.actions, fontScale >= 1.4 && styles.stacked]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('flagged.copyCsv')}
                  accessibilityState={{ disabled: operation !== null }}
                  disabled={operation !== null}
                  style={[styles.exportBtn, operation && styles.disabled]}
                  onPress={() => run('copy')}
                >
                  <Text style={styles.exportBtnText}>{t('flagged.copyCsv')}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('flagged.clearAll')}
                  accessibilityState={{ disabled: operation !== null }}
                  disabled={operation !== null}
                  style={[styles.clearBtn, operation && styles.disabled]}
                  onPress={confirmClear}
                >
                  <Text style={styles.clearBtnText}>{t('flagged.clearAll')}</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.hint}>
              <Text style={styles.hintText}>{t('flagged.hint')}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text allowFontScaling={false} style={styles.emptyEmoji}>
              ✅
            </Text>
            <Text style={styles.emptyText}>{t('flagged.empty')}</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <View style={styles.rowNum}>
              <Text style={styles.rowNumText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View testID={`flagged-deck-badge-${item.card.id}`} style={styles.deckBadge}>
                <Text style={styles.deckBadgeText}>{item.deckName}</Text>
              </View>
              <Text style={styles.spanish}>{item.card.front}</Text>
              <Text style={styles.english}>{item.card.back}</Text>
              {item.card.example ? <Text style={styles.example}>“{item.card.example}”</Text> : null}
              <Text style={styles.cardId}>ID: {item.card.id}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, id }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
    h1: { color: colors.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 4 },
    sub: { color: colors.textSecondary, marginBottom: spacing(1.5) },

    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing(1.5) },
    stacked: { flexDirection: 'column' },
    disabled: { opacity: 0.6 },
    exportBtn: {
      paddingHorizontal: 16,
      justifyContent: 'center',
      backgroundColor: colors.surfacePressed,
      borderRadius: 12,
      minHeight: 48,
      paddingVertical: 12,
      alignItems: 'center',
    },
    exportBtnText: { color: colors.audioText, fontWeight: '900' },
    clearBtn: {
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.alertInk,
      borderRadius: 12,
      minHeight: 48,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    clearBtnText: { color: colors.alertInk, fontWeight: '900' },

    hint: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: spacing(1.25),
      marginBottom: spacing(1.5),
    },
    hintText: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },

    row: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.alertInk,
      borderRadius: 12,
      padding: spacing(1.5),
      marginBottom: 10,
    },
    rowNum: {
      alignSelf: 'flex-start',
      minWidth: 28,
      minHeight: 28,
      padding: 4,
      borderRadius: 14,
      backgroundColor: colors.alertWash,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowNumText: { color: colors.restoreDanger, fontWeight: '900', fontSize: 13 },

    deckBadge: {
      backgroundColor: id === 'classic' ? colors.border : colors.tagSurface,
      borderRadius: 6,
      paddingVertical: 3,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      marginBottom: 6,
    },
    deckBadgeText: {
      color: id === 'classic' ? colors.textTertiary : colors.tagText,
      fontSize: 11,
      fontWeight: '700',
    },

    spanish: { color: colors.textPrimary, fontSize: 18, fontWeight: '900', marginBottom: 2 },
    english: { color: colors.tagText, fontSize: 15, fontWeight: '700', marginBottom: 4 },
    example: { color: colors.textSecondary, fontStyle: 'italic', fontSize: 13, marginBottom: 6 },
    cardId: { color: colors.textTertiary, fontSize: 11, fontFamily: 'monospace' },

    emptyWrap: { alignItems: 'center', paddingTop: spacing(6) },
    emptyEmoji: { fontSize: 48, marginBottom: spacing(1) },
    emptyText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  });
