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
import { colors, spacing } from '../styles/theme';

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
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.sub,
    fontSize: 16,
    marginTop: spacing(0.5),
  },
  content: {
    padding: spacing(2),
    gap: spacing(1.5),
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing(2.5),
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardPressed: {
    opacity: 0.8,
    backgroundColor: '#1e293b',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing(0.5),
  },
  cardDescription: {
    color: colors.sub,
    fontSize: 14,
  },
});
