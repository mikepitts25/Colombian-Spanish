import { cafeColors } from '../styles/cafeTheme';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Pressable from './ThemedPressable';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useThemedStyles } from '../context/ThemeContext';
import { useDeck } from '../hooks/useDeck';
import { SHOW_CAFE_DRAFTS } from '../config';
import { ADVENTURES, resolveAdventure } from '../adventures/content';
import type { AdventureState } from '../adventures/state';
import { dayDistance, localDayKey } from '../utils/calendarDay';
import { AdventureButton, adventureStyles } from './AdventureUI';
export default function AdventureEntry({
  progress,
  lastDay,
  onRetry,
  compact = false,
}: {
  progress?: { state?: AdventureState; error: boolean };
  lastDay?: string;
  onRetry: () => void;
  compact?: boolean;
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
        (SHOW_CAFE_DRAFTS && resolveAdventure(def.pack.id, decks, 'preview')),
    );
  const historical =
    !progress?.error &&
    progress?.state?.outcomes.some((o) => o.mode === 'accepted' || SHOW_CAFE_DRAFTS);
  if (!available && !historical && !progress?.error) return null;
  const returning = lastDay !== undefined && (dayDistance(lastDay, localDayKey()) ?? 0) >= 7;
  if (compact)
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(progress?.error ? 'mission.retry' : 'adventure.open')}
        onPress={progress?.error ? onRetry : () => nav.navigate('Adventures')}
        style={({ pressed }) => [compactStyles.card, pressed && { opacity: 0.7 }]}
      >
        <Image
          accessible={false}
          source={require('../../assets/cafe/evening.jpg')}
          style={compactStyles.thumbnail}
        />
        <View style={compactStyles.copy}>
          <Text
            accessibilityRole={progress?.error ? 'alert' : undefined}
            style={compactStyles.heading}
          >
            {t(progress?.error ? 'adventure.loadError' : 'home.cafe.conversation')}
          </Text>
          <Text style={compactStyles.body}>
            {t(progress?.error ? 'mission.retry' : 'adventure.title')}
          </Text>
        </View>
        <Text accessible={false} style={compactStyles.arrow}>
          ›
        </Text>
      </Pressable>
    );
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
const compactStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cafeColors.border,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: cafeColors.card,
    minHeight: 86,
  },
  thumbnail: {
    width: 78,
    height: 86,
    minHeight: 86,
    alignSelf: 'stretch',
    resizeMode: 'cover',
  },
  copy: { flex: 1, padding: 12, gap: 5 },
  heading: { color: cafeColors.cream, fontSize: 16, fontWeight: '600' },
  body: { color: cafeColors.secondary, fontSize: 12, lineHeight: 18 },
  arrow: { color: cafeColors.cream, fontSize: 28, marginRight: 14 },
});
