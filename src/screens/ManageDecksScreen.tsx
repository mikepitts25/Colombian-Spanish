import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Pressable,
} from 'react-native';
import { colors, spacing, radius } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { Deck } from '../types';

export default function ManageDecksScreen() {
  const { ready, decks, renameDeck, deleteDeck, resetDeckProgress, resetAllDecksProgress, setActiveDeckId } = useDeck();
  const [q, setQ] = useState('');

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDeckId, setRenameDeckId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return decks;
    return (decks || []).filter((d) => (d.name || '').toLowerCase().includes(query));
  }, [decks, q]);

  function openRename(deck: Deck) {
    setRenameDeckId(deck.id);
    setRenameValue(deck.name);
    setRenameOpen(true);
  }

  async function submitRename() {
    const next = renameValue.trim();
    if (!renameDeckId) return;
    if (!next) return Alert.alert('Missing name', 'Please enter a deck name.');
    await renameDeck(renameDeckId, next);
    setRenameOpen(false);
    setRenameDeckId(null);
    setRenameValue('');
  }

  function confirmDelete(deck: Deck) {
    Alert.alert(
      'Delete deck?',
      `This will permanently remove "${deck.name}" and its cards from this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteDeck(deck.id) },
      ],
    );
  }

  function confirmReset(deck: Deck) {
    Alert.alert(
      'Reset progress?',
      `This resets SRS stats (reps/interval/ease) for all cards in "${deck.name}". Cards will become due now.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetDeckProgress(deck.id) },
      ],
    );
  }

  function confirmResetAll() {
    const totalCards = decks?.reduce((sum, d) => sum + d.cards.length, 0) || 0;
    Alert.alert(
      'Reset ALL progress?',
      `This will reset SRS stats for ALL ${decks?.length || 0} decks (${totalCards} cards). This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset All', style: 'destructive', onPress: () => resetAllDecksProgress() },
      ],
    );
  }

  if (!ready)
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.h1}>Cargando…</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.wrap}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search decks…"
        placeholderTextColor={colors.sub}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable style={styles.resetAllBtn} onPress={confirmResetAll}>
        <Text style={styles.resetAllText}>🔄 Reset All Progress</Text>
      </Pressable>

      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ paddingBottom: spacing(3) }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable style={{ flex: 1 }} onPress={() => setActiveDeckId(item.id)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.cards.length} cards</Text>
            </Pressable>

            <View style={styles.actions}>
              <Pressable style={styles.btn} onPress={() => openRename(item)}>
                <Text style={styles.btnText}>Rename</Text>
              </Pressable>
              <Pressable style={styles.btnWarn} onPress={() => confirmReset(item)}>
                <Text style={styles.btnText}>Reset</Text>
              </Pressable>
              <Pressable style={styles.btnDanger} onPress={() => confirmDelete(item)}>
                <Text style={styles.btnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.sub}>No decks.</Text>}
      />

      <Modal
        visible={renameOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Rename deck</Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Deck name"
              placeholderTextColor={colors.sub}
              style={styles.input}
              autoFocus
            />
            <View style={styles.modalRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => setRenameOpen(false)}
              >
                <Text style={[styles.modalBtnText, { color: '#cbd5e1' }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={submitRename}>
                <Text style={styles.modalBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(1.25),
    color: colors.textPrimary,
    marginBottom: spacing(1.5),
  },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(1.25),
    marginBottom: 10,
    gap: 10,
  },
  name: { color: colors.textPrimary, fontWeight: '900', fontSize: 16 },
  meta: { color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  btn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  btnWarn: {
    backgroundColor: colors.warningMuted,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  btnDanger: {
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  btnText: { color: colors.textPrimary, fontWeight: '900' },
  resetAllBtn: {
    backgroundColor: colors.dangerMuted,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    alignItems: 'center',
    marginBottom: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.danger,
  },
  resetAllText: { color: colors.danger, fontWeight: '800', fontSize: 14 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing(2),
  },
  modalBody: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing(2) },
  modalTitle: { color: colors.textPrimary, fontWeight: '900', marginBottom: spacing(1) },
  input: {
    backgroundColor: colors.surfaceElevated,
    color: colors.textPrimary,
    borderRadius: radius.lg,
    padding: spacing(1.25),
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: spacing(1.25) },
  modalBtn: { flex: 1, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center' },
  modalBtnGhost: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  modalBtnPrimary: { backgroundColor: colors.info },
  modalBtnText: { color: 'white', fontWeight: '900' },
});
