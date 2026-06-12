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
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { Deck } from '../types';

export default function ManageDecksScreen() {
  const { ready, decks, renameDeck, deleteDeck, resetDeckProgress, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
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

  function goHome() {
    nav.navigate('Root', { screen: 'Home' });
  }

  if (!ready)
    return (
      <SafeAreaView style={styles.wrap}>
        <View style={styles.content}>
          <Text style={styles.h1}>Cargando…</Text>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.homeBtn} onPress={goHome}>
            <Text style={styles.homeBtnText}>Home</Text>
          </Pressable>
          <Text style={styles.h1} numberOfLines={1} adjustsFontSizeToFit>
            Manage Decks
          </Text>
          <Text style={styles.sub}>Rename, delete, and reset learning progress.</Text>
        </View>

        <Pressable style={styles.reviewBanner} onPress={() => nav.navigate('Review')}>
          <View style={styles.reviewBannerText}>
            <Text style={styles.reviewBannerTitle}>🚩 Review Translations</Text>
            <Text style={styles.reviewBannerSub}>Flag cards with bad translations for fixing</Text>
          </View>
          <Text style={styles.reviewBannerArrow}>→</Text>
        </Pressable>

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search decks…"
          placeholderTextColor={colors.textSecondary}
          style={styles.search}
          autoCapitalize="none"
          autoCorrect={false}
        />

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
      </View>

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
              placeholderTextColor={colors.textSecondary}
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
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing(2) },
  header: { gap: spacing(1), marginBottom: spacing(1.25) },
  h1: { color: colors.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  sub: { color: colors.textSecondary },
  homeBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: { color: '#e2e8f0', fontWeight: '900', fontSize: 13 },
  search: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: spacing(1.25),
    color: colors.textPrimary,
    marginBottom: spacing(1.5),
  },
  row: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: spacing(1.25),
    marginBottom: 10,
    gap: 10,
  },
  name: { color: colors.textPrimary, fontWeight: '900', fontSize: 16 },
  meta: { color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  btn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  btnWarn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  btnDanger: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  btnText: { color: '#e2e8f0', fontWeight: '900' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing(2),
  },
  modalBody: { backgroundColor: colors.surfaceElevated, borderRadius: 14, padding: spacing(2) },
  modalTitle: { color: colors.textPrimary, fontWeight: '900', marginBottom: spacing(1) },
  input: {
    backgroundColor: '#0b1220',
    color: colors.textPrimary,
    borderRadius: 12,
    padding: spacing(1.25),
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: spacing(1.25) },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalBtnGhost: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1f2937' },
  modalBtnPrimary: { backgroundColor: '#2563eb' },
  modalBtnText: { color: 'white', fontWeight: '900' },

  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 12,
    padding: spacing(1.5),
    marginBottom: spacing(1.5),
  },
  reviewBannerText: { flex: 1 },
  reviewBannerTitle: { color: '#fca5a5', fontWeight: '900', fontSize: 15, marginBottom: 2 },
  reviewBannerSub: { color: '#64748b', fontSize: 13 },
  reviewBannerArrow: { color: '#fca5a5', fontWeight: '900', fontSize: 20 },
});
