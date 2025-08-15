import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { Deck, FlashCard } from '../types';

export default function AddCardScreen() {
  const { decks, activeDeckId, addCardToDeck, createDeck } = useDeck();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [tags, setTags] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newDeckOpen, setNewDeckOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>(activeDeckId);

  // 🔧 FIX: annotate types so TS doesn't complain about implicit any for "d"
  const selectedDeck = useMemo<Deck | undefined>(
    () => decks.find((d: Deck) => d.id === selectedDeckId),
    [decks, selectedDeckId]
  );

  async function save() {
    if (!front.trim() || !back.trim()) return Alert.alert('Missing', 'Front and back are required');
    if (!selectedDeckId) return Alert.alert('Pick a deck', 'Please choose a deck to add this card to.');
    const newCard: Omit<FlashCard, 'createdAt'|'due'|'reps'|'interval'|'ease'> = {
      id: String(Date.now()), front, back, example: example || undefined, tags: tags ? tags.split(',').map(t => t.trim()) : []
    } as any;
    await addCardToDeck(selectedDeckId, newCard);
    setFront(''); setBack(''); setExample(''); setTags('');
    Alert.alert('Added', 'Card added to ' + (selectedDeck?.name ?? 'deck'));
  }

  async function createNewDeck() {
    const name = newDeckName.trim();
    if (!name) return;
    const d = await createDeck(name);
    if (d) {
      setSelectedDeckId(d.id);
      setNewDeckName('');
      setNewDeckOpen(false);
    }
  }

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.h1}>Add new card</Text>
      <Text style={styles.label}>Deck</Text>
      <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
        <Text style={styles.selectText}>{selectedDeck?.name ?? 'Select a deck'}</Text>
      </Pressable>

      <View style={styles.field}><Text style={styles.label}>Front (🇨🇴 Español)</Text><TextInput value={front} onChangeText={setFront} placeholder="¿Qué más pues?" placeholderTextColor={colors.sub} style={styles.input} /></View>
      <View style={styles.field}><Text style={styles.label}>Back (English)</Text><TextInput value={back} onChangeText={setBack} placeholder="What’s up?" placeholderTextColor={colors.sub} style={styles.input} /></View>
      <View style={styles.field}><Text style={styles.label}>Example sentence (optional)</Text><TextInput value={example} onChangeText={setExample} placeholder="¡Qué chimba de concierto!" placeholderTextColor={colors.sub} style={styles.input} /></View>
      <View style={styles.field}><Text style={styles.label}>Tags (comma-separated)</Text><TextInput value={tags} onChangeText={setTags} placeholder="slang, Medellín" placeholderTextColor={colors.sub} style={styles.input} /></View>

      <Text onPress={save} style={styles.save}>Save card ✓</Text>

      {/* Deck picker modal */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Choose a deck</Text>
            <FlatList
              data={decks}
              keyExtractor={(d: Deck) => d.id}
              renderItem={({ item }: { item: Deck }) => (
                <Pressable style={styles.modalRow} onPress={() => { setSelectedDeckId(item.id); setPickerOpen(false); }}>
                  <Text style={styles.modalRowTitle}>{item.name}</Text>
                  <Text style={styles.modalRowSub}>{item.cards.length} cards</Text>
                </Pressable>
              )}
              ListFooterComponent={
                <Pressable style={[styles.modalRow, { borderTopColor: '#1f2937', borderTopWidth: 1 }]} onPress={() => { setPickerOpen(false); setNewDeckOpen(true); }}>
                  <Text style={[styles.modalRowTitle, { color: '#a7f3d0' }]}>➕ New deck</Text>
                  <Text style={[styles.modalRowSub, { color: '#6ee7b7' }]}>Create & use immediately</Text>
                </Pressable>
              }
            />
            <Text onPress={() => setPickerOpen(false)} style={styles.modalClose}>Close</Text>
          </View>
        </View>
      </Modal>

      {/* New deck modal */}
      <Modal visible={newDeckOpen} transparent animationType="fade" onRequestClose={() => setNewDeckOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>New deck</Text>
            <TextInput
              placeholder="Name (e.g., Colombianisms)"
              placeholderTextColor={colors.sub}
              value={newDeckName}
              onChangeText={setNewDeckName}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing(1) }}>
              <Text onPress={() => setNewDeckOpen(false)} style={[styles.modalClose, { flex: 1, textAlign: 'center' }]}>Cancel</Text>
              <Text onPress={createNewDeck} style={[styles.save, { flex: 1 }]}>Create</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  h1: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing(2) },
  field: { marginBottom: spacing(1.5) },
  label: { color: colors.text, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: '#0b1220', color: colors.text, borderRadius: 12, padding: spacing(1.5) },
  save: { backgroundColor: '#10b981', color: '#052e2b', padding: spacing(1.5), textAlign: 'center', borderRadius: 12, fontWeight: '800', marginTop: spacing(1) },
  select: { backgroundColor: '#0b1220', borderRadius: 12, padding: spacing(1.5), marginBottom: spacing(1.5), borderWidth: 1, borderColor: '#1f2937' },
  selectText: { color: colors.text, fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing(2) },
  modalBody: { backgroundColor: colors.card, borderRadius: 14, padding: spacing(2), maxHeight: '80%' },
  modalTitle: { color: colors.text, fontWeight: '800', marginBottom: spacing(1) },
  modalRow: { paddingVertical: spacing(1), borderBottomColor: '#1f2937', borderBottomWidth: 1 },
  modalRowTitle: { color: colors.text, fontWeight: '700' },
  modalRowSub: { color: colors.sub },
  modalClose: { color: colors.sub, textAlign: 'center', marginTop: spacing(1.5) }
});