import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions, useNavigation } from '@react-navigation/native';
import Pressable from '../components/ThemedPressable';
import { useLanguage } from '../context/LanguageContext';
import { useThemedStyles } from '../context/ThemeContext';
import { useDeck } from '../hooks/useDeck';
import type { ReminderTap } from '../services/notifications';
import { speakCard } from '../services/tts';
import { FREE_DECK_IDS, isPaidBundledCard } from '../billing/catalog';
import type { AppTheme } from '../styles/appTheme';
import { localDayKey } from '../utils/calendarDay';

export default function ReminderWordScreen({ route }: { route?: { params?: ReminderTap } }) {
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const { ready, decks } = useDeck();
  const styles = useThemedStyles(makeStyles);
  const intent = route?.params;
  const expired = intent?.kind === 'word' && intent.day !== localDayKey();
  const card =
    ready &&
    intent?.kind === 'word' &&
    !expired &&
    FREE_DECK_IDS.has(intent.deckId) &&
    !isPaidBundledCard(intent.cardId)
      ? decks
          .find((deck) => deck.id === intent.deckId)
          ?.cards.find(
            (candidate) => candidate.id === intent.cardId && candidate.front === intent.front,
          )
      : undefined;

  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {t('notifications.wordTitle')}
        </Text>
        {!ready ? (
          <Text style={styles.body}>{t('common.loading')}</Text>
        ) : card ? (
          <>
            <Text style={styles.title}>{card.front}</Text>
            <Text style={styles.body}>{card.back}</Text>
            <Pressable
              accessibilityRole="button"
              style={styles.secondary}
              onPress={() => void speakCard(card).catch(() => {})}
            >
              <Text style={styles.body}>{t('common.listen')}</Text>
            </Pressable>
          </>
        ) : (
          <Text accessibilityRole="alert" style={styles.body}>
            {t(expired ? 'notifications.wordExpired' : 'notifications.wordUnavailable')}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          style={styles.primary}
          onPress={() => nav.dispatch(StackActions.popTo('Root', { screen: 'Home' }))}
        >
          <Text style={styles.primaryText}>{t('notifications.todayPractice')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, gap: 16 },
    title: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
    body: { color: colors.textSecondary, fontSize: 16, lineHeight: 24 },
    primary: {
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.brand,
    },
    primaryText: { color: colors.onBrand, fontSize: 16, fontWeight: '700', textAlign: 'center' },
    secondary: {
      minHeight: 48,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
  });
