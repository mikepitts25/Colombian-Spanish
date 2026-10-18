import ThemedTextInput from '../components/ThemedTextInput';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useLanguage } from '../context/LanguageContext';
import { speakCard } from '../services/tts';

export default function PhrasebookScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const { ready, decks, setActiveDeckId, toggleFavorite } = useDeck();
  const { t } = useLanguage();
  const [q, setQ] = useState('');
  const { fontScale } = useWindowDimensions();
  const expanded = fontScale >= 1.4;

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    const all = (decks || []).flatMap((d) =>
      (d.cards || []).map((c) => ({ deckId: d.id, deckName: d.name, card: c })),
    );
    const favs = all.filter((x) => !!x.card.favorite);
    if (!query) return favs;
    return favs.filter((x) => {
      const hay = [x.card.front, x.card.back, x.card.example, (x.card.tags || []).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });
  }, [decks, q]);

  if (!ready)
    return (
      <SafeAreaView key={fontScale} style={styles.wrap}>
        <Text style={styles.h1}>{t('common.loading')}</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView key={fontScale} style={styles.wrap}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Text style={styles.h1}>{t('phrasebook.title')}</Text>
            <Text style={styles.sub}>{t('phrasebook.sub')}</Text>

            <ThemedTextInput
              value={q}
              onChangeText={setQ}
              placeholder={t('phrasebook.searchPlaceholder')}
              accessibilityLabel={t('phrasebook.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              style={styles.search}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        }
        data={items}
        keyExtractor={(x) => x.card.id}
        contentContainerStyle={{ paddingBottom: spacing(3) }}
        renderItem={({ item }) => (
          <View style={[styles.row, expanded && styles.stacked]}>
            <View style={{ flex: expanded ? 0 : 1 }}>
              <Text style={styles.front}>{item.card.front}</Text>
              <Text style={styles.back}>{item.card.back}</Text>
              {item.card.example ? <Text style={styles.example}>“{item.card.example}”</Text> : null}
              <Text style={styles.meta}>
                {item.deckName}
                {item.card.tags?.length ? ` • ${item.card.tags.join(', ')}` : ''}
              </Text>
            </View>

            <View style={[styles.actions, expanded && styles.horizontalActions]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('phrases.playLabel', { phrase: item.card.front })}
                style={styles.actionBtn}
                onPress={() => {
                  setActiveDeckId(item.deckId);
                  void speakCard(item.card);
                }}
              >
                <Text allowFontScaling={false} style={styles.actionText}>
                  🔊
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('phrases.removeLabel', { phrase: item.card.front })}
                accessibilityState={{ selected: true }}
                style={styles.actionBtn}
                onPress={() => toggleFavorite(item.card.id)}
              >
                <Text allowFontScaling={false} style={styles.actionText}>
                  ★
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ marginTop: spacing(2) }}>
            <Text style={styles.empty}>{t('phrasebook.empty')}</Text>
            <Text style={styles.sub}>{t('phrasebook.emptySub')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
    h1: { color: colors.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 4 },
    sub: { color: colors.textSecondary, marginBottom: spacing(1.5) },
    search: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing(1.25),
      color: colors.textPrimary,
      marginBottom: spacing(1.5),
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing(1.25),
      marginBottom: 10,
    },
    front: { color: colors.textPrimary, fontWeight: '900', fontSize: 16 },
    back: { color: colors.textSecondary, marginTop: 2 },
    example: { color: colors.textSecondary, marginTop: 6, fontStyle: 'italic' },
    meta: { color: colors.textSecondary, marginTop: 8, fontSize: 12 },
    stacked: { flexDirection: 'column' },
    horizontalActions: { flexDirection: 'row', flexWrap: 'wrap' },
    actions: { gap: 8, justifyContent: 'flex-start' },
    actionBtn: {
      minWidth: 48,
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionText: { color: colors.textPrimary, fontWeight: '900' },
    empty: { color: colors.textPrimary, fontWeight: '900', fontSize: 16 },
  });
