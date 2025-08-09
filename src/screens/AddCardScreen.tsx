import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { FlashCard } from '../types';

export default function AddCardScreen() {
  const { addCard, activeDeck } = useDeck();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [tags, setTags] = useState('');

  async function save() {
    if (!front.trim() || !back.trim()) return Alert.alert('Missing', 'Front and back are required');
    const newCard: Omit<FlashCard, 'createdAt'|'due'|'reps'|'interval'|'ease'> = {
      id: String(Date.now()), front, back, example: example || undefined, tags: tags ? tags.split(',').map(t => t.trim()) : []
    } as any;
    await addCard(newCard);
    setFront(''); setBack(''); setExample(''); setTags('');
    Alert.alert('Added', 'Card added to ' + (activeDeck?.name ?? 'deck'));
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Add new card</Text>
      <View style={styles.field}><Text style={styles.label}>Front (🇨🇴 Español)</Text><TextInput value={front} onChangeText={setFront} placeholder="¿Qué más pues?" placeholderTextColor={colors.sub} style={styles.input} /></View>
      <View style={styles.field}><Text style={styles.label}>Back (English)</Text><TextInput value={back} onChangeText={setBack} placeholder="What’s up?" placeholderTextColor={colors.sub} style={styles.input} /></View>
      <View style={styles.field}><Text style={styles.label}>Example sentence (optional)</Text><TextInput value={example} onChangeText={setExample} placeholder="¡Qué chimba de concierto!" placeholderTextColor={colors.sub} style={styles.input} /></View>
      <View style={styles.field}><Text style={styles.label}>Tags (comma-separated)</Text><TextInput value={tags} onChangeText={setTags} placeholder="slang, Medellín" placeholderTextColor={colors.sub} style={styles.input} /></View>
      <Text onPress={save} style={styles.save}>Save card ✓</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing(2) },
  field: { marginBottom: spacing(1.5) },
  label: { color: colors.text, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: '#0b1220', color: colors.text, borderRadius: 12, padding: spacing(1.5) },
  save: { backgroundColor: colors.success, color: '#052e2b', padding: spacing(1.5), textAlign: 'center', borderRadius: 12, fontWeight: '800', marginTop: spacing(1) }
});
