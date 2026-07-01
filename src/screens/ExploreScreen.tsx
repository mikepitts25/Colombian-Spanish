import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';

export default function ExploreScreen() {
  const nav = useNavigation<any>();
  const { t } = useLanguage();

  const options = [
    {
      id: 'browse',
      title: t('explore.browseDecks'),
      description: t('explore.browseDecksSub'),
      onPress: () => nav.navigate('Browse'),
    },
    {
      id: 'phrasebook',
      title: t('explore.phrasebook'),
      description: t('explore.phrasebookSub'),
      onPress: () => nav.navigate('Phrasebook'),
    },
    {
      id: 'add',
      title: t('explore.addCard'),
      description: t('explore.addCardSub'),
      onPress: () => nav.navigate('AddCard'),
    },
    {
      id: 'manage',
      title: t('explore.manageDecks'),
      description: t('explore.manageDecksSub'),
      onPress: () => nav.navigate('ManageDecks'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('explore.title')}</Text>
        <Text style={styles.subtitle}>{t('explore.sub')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={option.onPress}
          >
            <Text style={styles.cardTitle}>{option.title}</Text>
            <Text style={styles.cardDescription}>{option.description}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    padding: spacing(3),
    paddingBottom: spacing(2),
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing(0.5),
  },
  content: {
    padding: spacing(2),
    gap: spacing(1.5),
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(2.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    backgroundColor: colors.surfacePressed,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing(0.5),
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
