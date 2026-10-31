import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useThemedStyles } from '../context/ThemeContext';
import { useDeck } from '../hooks/useDeck';
import { SHOW_REVIEW_TOOLS } from '../config';
import { ADVENTURES, resolveAdventure } from '../adventures/content';
import type { AdventureState } from '../adventures/state';
import { dayDistance, localDayKey } from '../utils/calendarDay';
import { AdventureButton, adventureStyles } from './AdventureUI';
export default function AdventureEntry({
  progress,
  lastDay,
  onRetry,
}: {
  progress?: { state?: AdventureState; error: boolean };
  lastDay?: string;
  onRetry: () => void;
}) {
  const { decks, ready } = useDeck(),
    nav = useNavigation<any>();
  const { t } = useLanguage(),
    styles = useThemedStyles(adventureStyles);
  const available =
    ready &&
    ADVENTURES.some(
      (def) =>
        resolveAdventure(def.pack.id, decks, 'accepted') ||
        (SHOW_REVIEW_TOOLS && resolveAdventure(def.pack.id, decks, 'preview')),
    );
  const historical =
    !progress?.error &&
    progress?.state?.outcomes.some((o) => o.mode === 'accepted' || SHOW_REVIEW_TOOLS);
  if (!available && !historical && !progress?.error) return null;
  const returning = lastDay !== undefined && (dayDistance(lastDay, localDayKey()) ?? 0) >= 7;
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t('adventure.title')}
      </Text>
      <Text accessibilityRole={progress?.error ? 'alert' : undefined} style={styles.body}>
        {t(
          progress?.error
            ? 'adventure.loadError'
            : returning
              ? 'adventure.welcomeBack'
              : 'adventure.invitation',
        )}
      </Text>
      <AdventureButton
        label={t(progress?.error ? 'mission.retry' : 'adventure.open')}
        onPress={progress?.error ? onRetry : () => nav.navigate('Adventures')}
      />
    </View>
  );
}
