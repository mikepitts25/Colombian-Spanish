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

export default function ExploreScreen() {
  const nav = useNavigation<any>();

  const options = [
    {
      id: 'browse',
      title: '📚 Browse All Decks',
      description: 'Explore 30+ Colombian Spanish decks by category',
      onPress: () => nav.navigate('Browse'),
    },
    {
      id: 'phrasebook',
      title: '⭐ My Phrasebook',
      description: 'Your saved favorite cards for quick review',
      onPress: () => nav.navigate('Phrasebook'),
    },
    {
      id: 'add',
      title: '➕ Add Custom Card',
      description: 'Create your own flashcards',
      onPress: () => nav.navigate('AddCard'),
    },
    {
      id: 'manage',
      title: '🗂️ Manage Decks',
      description: 'Organize, rename, or reset deck progress',
      onPress: () => nav.navigate('ManageDecks'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover and manage your learning</Text>
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
