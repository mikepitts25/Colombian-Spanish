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
  ScrollView,
} from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import { Deck } from '../types';

export default function ManageDecksScreen() {
  const { ready, decks, renameDeck, deleteDeck, resetDeckProgress, resetAllDecksProgress, setActiveDeckId } = useDeck();
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDeckId, setRenameDeckId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return decks;
    return (decks || []).filter((d) => (d.name || '').toLowerCase().includes(query));
  }, [decks, q]);

  // Calculate deck stats
  const deckStats = useMemo(() => {
    if (!decks) return { total: 0, custom: 0, default: 0 };
    const total = decks.length;
    const custom = decks.filter(d => d.id.startsWith('custom-')).length;
    return { total, custom, default: total - custom };
  }, [decks]);

  function openRename(deck: Deck) {
    setRenameDeckId(deck.id);
    setRenameValue(deck.name);
    setRenameOpen(true);
  }

  async function submitRename() {
    const next = renameValue.trim();
    if (!renameDeckId) return;
    if (!next) {
      Alert.alert('Missing name', 'Please enter a deck name.');
      return;
    }
    await renameDeck(renameDeckId, next);
    setRenameOpen(false);
    setRenameDeckId(null);
    setRenameValue('');
  }

  function confirmDelete(deck: Deck) {
    const isCustom = deck.id.startsWith('custom-');
    const cardCount = deck.cards.length;
    
    Alert.alert(
      'Delete Deck?',
      `"${deck.name}" contains ${cardCount} card${cardCount !== 1 ? 's' : ''}.\n\n${isCustom 
        ? 'This is a custom deck you created. This action cannot be undone.' 
        : 'This built-in deck can be restored later by resetting the app.'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteDeck(deck.id) 
        },
      ],
    );
  }

  function confirmReset(deck: Deck) {
    const studiedCount = deck.cards.filter(c => c.reps > 0).length;
    
    Alert.alert(
      'Reset Progress?',
      `All ${deck.cards.length} cards in "${deck.name}" will be reset to "new" status.\n\n${studiedCount > 0 
        ? `⚠️ You will lose progress on ${studiedCount} studied card${studiedCount !== 1 ? 's' : ''}.` 
        : 'No progress will be lost — no cards have been studied yet.'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: () => resetDeckProgress(deck.id) 
        },
      ],
    );
  }

  function confirmResetAll() {
    const totalCards = decks?.reduce((sum, d) => sum + d.cards.length, 0) || 0;
    const totalStudied = decks?.reduce((sum, d) => 
      sum + d.cards.filter(c => c.reps > 0).length, 0
    ) || 0;
    
    Alert.alert(
      '⚠️ Reset ALL Progress?',
      `This will reset ALL ${decks?.length || 0} decks (${totalCards} cards) to "new" status.\n\n${totalStudied > 0 
      ? `🔴 You will lose ALL progress on ${totalStudied} studied cards. This cannot be undone!` 
      : 'No cards have been studied yet.'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Everything', 
          style: 'destructive', 
          onPress: () => resetAllDecksProgress() 
        },
      ],
    );
  }

  function handleStudyDeck(deckId: string) {
    setActiveDeckId(deckId);
    nav.navigate('Study' as never);
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Manage Decks</Text>
        <Text style={styles.subtitle}>
          {deckStats.total} deck{deckStats.total !== 1 ? 's' : ''} • {deckStats.custom} custom
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <Pressable style={styles.infoCard} onPress={() => setInfoOpen(true)}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What you can do here</Text>
            <Text style={styles.infoText}>
              Rename decks, reset study progress, or delete custom decks you no longer need.
            </Text>
          </View>
          <Text style={styles.infoArrow}>›</Text>
        </Pressable>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search decks..."
            placeholderTextColor={colors.textTertiary}
            style={styles.search}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')} style={styles.clearBtn}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Reset All Button */}
        <Pressable style={styles.resetAllBtn} onPress={confirmResetAll}>
          <Text style={styles.resetAllIcon}>🔄</Text>
          <View style={styles.resetAllContent}>
            <Text style={styles.resetAllTitle}>Reset All Progress</Text>
            <Text style={styles.resetAllSub}>Start fresh with all decks</Text>
          </View>
        </Pressable>

        {/* Decks List */}
        <Text style={styles.sectionTitle}>Your Decks</Text>
        
        <FlatList
          data={filtered}
          keyExtractor={(d) => d.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const isCustom = item.id.startsWith('custom-');
            const studiedCount = item.cards.filter(c => c.reps > 0).length;
            const dueCount = item.cards.filter(c => (c.due || 0) <= Date.now()).length;
            const progress = item.cards.length > 0 ? studiedCount / item.cards.length : 0;
            
            return (
              <View style={styles.deckCard}>
                {/* Deck Info */}
                <View style={styles.deckInfo}>
                  <View style={styles.deckHeader}>
                    <Text style={styles.deckName} numberOfLines={1}>
                      {isCustom ? '✏️ ' : '📚 '}{item.name}
                    </Text>
                    {isCustom && <Text style={styles.customBadge}>Custom</Text>}
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {studiedCount}/{item.cards.length} studied
                    </Text>
                  </View>
                  
                  {/* Stats Row */}
                  <View style={styles.statsRow}>
                    {dueCount > 0 && (
                      <View style={styles.dueBadge}>
                        <Text style={styles.dueBadgeText}>{dueCount} due</Text>
                      </View>
                    )}
                    <Pressable 
                      style={styles.studyLink}
                      onPress={() => handleStudyDeck(item.id)}
                    >
                      <Text style={styles.studyLinkText}>Study now ›</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Actions Menu */}
                <View style={styles.actionsMenu}>
                  <Pressable 
                    style={[styles.actionBtn, styles.actionRename]}
                    onPress={() => openRename(item)}
                  >
                    <Text style={styles.actionIcon}>✏️</Text>
                    <Text style={styles.actionLabel}>Rename</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={[styles.actionBtn, styles.actionReset]}
                    onPress={() => confirmReset(item)}
                  >
                    <Text style={styles.actionIcon}>🔄</Text>
                    <Text style={styles.actionLabel}>Reset</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={[styles.actionBtn, styles.actionDelete]}
                    onPress={() => confirmDelete(item)}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                    <Text style={styles.actionLabel}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>No decks found</Text>
              <Text style={styles.emptySub}>
                {q.length > 0 
                  ? 'Try a different search term' 
                  : 'Create custom decks in the Add Card section'}
              </Text>
            </View>
          }
        />

        <View style={{ height: spacing(4) }} />
      </ScrollView>

      {/* Rename Modal */}
      <Modal
        visible={renameOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Rename Deck</Text>
            <Text style={styles.modalSub}>
              Enter a new name for this deck
            </Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Deck name"
              placeholderTextColor={colors.textTertiary}
              style={styles.modalInput}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setRenameOpen(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={submitRename}
              >
                <Text style={styles.modalBtnPrimaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Info Modal */}
      <Modal
        visible={infoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>About Deck Management</Text>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>✏️ Rename</Text>
              <Text style={styles.infoSectionText}>
                Change the name of any deck, including built-in decks. This only affects the display name.
              </Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>🔄 Reset Progress</Text>
              <Text style={styles.infoSectionText}>
                Reset all cards in a deck to "new" status. Your study history will be cleared and cards will become due immediately.
              </Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>🗑️ Delete</Text>
              <Text style={styles.infoSectionText}>
                Remove custom decks permanently. Built-in decks can also be deleted but can be restored by resetting all progress.
              </Text>
            </View>

            <Pressable 
              style={[styles.modalBtn, styles.modalBtnPrimary, { marginTop: spacing(1) }]}
              onPress={() => setInfoOpen(false)}
            >
              <Text style={styles.modalBtnPrimaryText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    textAlign: 'center',
    marginTop: spacing(4),
  },

  // Header
  header: {
    padding: spacing(3),
    paddingBottom: spacing(2),
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    marginTop: spacing(0.5),
  },

  // Content
  content: {
    padding: spacing(2),
    paddingTop: 0,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoMuted,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    marginBottom: spacing(2),
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing(1),
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: colors.info,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    marginTop: 2,
  },
  infoArrow: {
    color: colors.info,
    fontSize: 20,
    fontWeight: typography.weight.bold,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(1.5),
    marginBottom: spacing(2),
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing(0.75),
  },
  search: {
    flex: 1,
    paddingVertical: spacing(1.25),
    color: colors.textPrimary,
    fontSize: typography.size.base,
  },
  clearBtn: {
    padding: spacing(0.5),
  },
  clearIcon: {
    color: colors.textTertiary,
    fontSize: 14,
  },

  // Reset All
  resetAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerMuted,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    marginBottom: spacing(2),
    borderWidth: 1,
    borderColor: colors.dangerMuted,
  },
  resetAllIcon: {
    fontSize: 20,
    marginRight: spacing(1),
  },
  resetAllContent: {
    flex: 1,
  },
  resetAllTitle: {
    color: colors.danger,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  resetAllSub: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    marginTop: 2,
  },

  // Section Title
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing(1),
  },

  // Deck Card
  deckCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing(1.5),
    overflow: 'hidden',
  },
  deckInfo: {
    padding: spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1),
  },
  deckName: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
    flex: 1,
  },
  customBadge: {
    backgroundColor: colors.brandMuted,
    color: colors.brand,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    paddingHorizontal: spacing(0.75),
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressContainer: {
    marginBottom: spacing(1),
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing(0.5),
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  progressText: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueBadge: {
    backgroundColor: colors.warningMuted,
    paddingHorizontal: spacing(0.75),
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  dueBadgeText: {
    color: colors.warning,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  studyLink: {
    paddingVertical: 2,
  },
  studyLinkText: {
    color: colors.brand,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },

  // Actions Menu
  actionsMenu: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(1),
    gap: spacing(0.5),
  },
  actionRename: {
    backgroundColor: colors.surfaceElevated,
  },
  actionReset: {
    backgroundColor: colors.warningMuted,
  },
  actionDelete: {
    backgroundColor: colors.dangerMuted,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(6),
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing(1),
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(0.5),
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing(4),
  },
  modalBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing(3),
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing(0.5),
  },
  modalSub: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    marginBottom: spacing(2),
  },
  modalInput: {
    backgroundColor: colors.surfaceElevated,
    color: colors.textPrimary,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.size.base,
    marginBottom: spacing(2),
  },
  modalRow: {
    flexDirection: 'row',
    gap: spacing(1.5),
  },
  modalBtn: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing(1.25),
    alignItems: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnSecondaryText: {
    color: colors.textSecondary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  modalBtnPrimary: {
    backgroundColor: colors.brand,
  },
  modalBtnPrimaryText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },

  // Info Modal Sections
  infoSection: {
    marginBottom: spacing(2),
  },
  infoSectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing(0.25),
  },
  infoSectionText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
});
