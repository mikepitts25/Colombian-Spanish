import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import Tag from '../components/Tag';
import AudioButton from '../components/AudioButton';

export default function HomeScreen() {
  const { ready, decks, activeDeck, setActiveDeckId } = useDeck();
  if (!ready) return <SafeAreaView style={styles.wrap}><Text style={styles.h1}>Cargando…</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Colombian Spanish 🇨🇴</Text>
      <Text style={styles.sub}>Spaced repetition • active recall • interleaving • dual coding</Text>

      <FlatList
        data={decks}
        keyExtractor={d => d.id}
        renderItem={({ item }) => (
          <View style={[styles.card, item.id === activeDeck?.id && { borderColor: colors.accent, borderWidth: 2 }]}> 
            <Text style={styles.deckTitle}>{item.name}</Text>
            <Text style={styles.deckDesc}>{item.description}</Text>
            <View style={{ flexDirection: 'row', marginTop: spacing(1) }}>
              <Tag label={`Cards: ${item.cards.length}`} />
              <Tag label={'Dialect: CO'} />
            </View>
            <View style={{ marginTop: spacing(1) }}>
              <AudioButton text={item.cards[0]?.front ?? 'Hola'} />
            </View>
            <Text onPress={() => setActiveDeckId(item.id)} style={styles.select}>Use this deck →</Text>
          </View>
        )}
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
