import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import Tag from '../components/Tag';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { ready, decks, activeDeck, activeDeckId, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
  if (!ready) return <SafeAreaView style={styles.wrap}><Text style={styles.h1}>Cargando…</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Colombian Spanish 🇨🇴</Text>
      <Text style={styles.sub}>Choose a deck to study. Your current deck is highlighted.</Text>

      <FlatList
        data={decks}
        keyExtractor={d => d.id}
        renderItem={({ item }) => {
          const isActive = item.id === activeDeckId;
          return (
            <View style={[styles.card, isActive && { borderColor: colors.accent, borderWidth: 2 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.deckTitle}>{item.name}</Text>
                {isActive ? <Tag label="Active" /> : null}
              </View>
              <Text style={styles.deckDesc}>{item.description}</Text>
              <View style={{ flexDirection: 'row', marginTop: spacing(1) }}>
                <Tag label={`Cards: ${item.cards.length}`} />
                <Tag label={'Dialect: CO'} />
              </View>
              <Text
                onPress={() => { setActiveDeckId(item.id); nav.navigate('Study'); }}
                style={styles.select}
              >
                Use this deck →
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing(1) },
  sub: { color: colors.sub, marginBottom: spacing(2) },
  card: { backgroundColor: colors.card, padding: spacing(2), borderRadius: 16, marginBottom: spacing(2) },
  deckTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  deckDesc: { color: colors.sub, marginTop: 6 },
  select: { color: colors.accent, fontWeight: '800', marginTop: spacing(1.5) }
});
