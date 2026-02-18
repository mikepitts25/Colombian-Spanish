import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, radius, typography } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { useNavigation } from '@react-navigation/native';
import { Deck, FlashCard } from '../types';

export default function AddCardScreen() {
  const { decks, activeDeckId, addCardToDeck, createDeck } = useDeck();
  const nav = useNavigation<any>();
  
  // Form state
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [tags, setTags] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>(activeDeckId);
  
  // UI state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newDeckOpen, setNewDeckOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{front?: string; back?: string; deck?: string}>({});

  const selectedDeck = useMemo<Deck | undefined>(
    () => decks.find((d: Deck) => d.id === selectedDeckId),
    [decks, selectedDeckId],
  );

  function validate(): boolean {
    const newErrors: {front?: string; back?: string; deck?: string} = {};
    
    if (!front.trim()) {
      newErrors.front = 'Spanish phrase is required';
    }
    if (!back.trim()) {
      newErrors.back = 'English translation is required';
    }
    if (!selectedDeckId) {
      newErrors.deck = 'Please select a deck';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function save() {
    if (!validate()) return;
    
    const newCard: Omit<FlashCard, 'createdAt' | 'due' | 'reps' | 'interval' | 'ease'> = {
      id: String(Date.now()),
      front: front.trim(),
      back: back.trim(),
      example: example.trim() || undefined,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    } as any;
    
    await addCardToDeck(selectedDeckId!, newCard);
    setShowSuccess(true);
  }

  function handleAddAnother() {
    setFront('');
    setBack('');
    setExample('');
    setTags('');
    setErrors({});
    setShowSuccess(false);
  }

  function handleGoToStudy() {
    setShowSuccess(false);
    nav.navigate('Study' as never);
  }

  async function createNewDeck() {
    const name = newDeckName.trim();
    if (!name) {
      Alert.alert('Missing name', 'Please enter a deck name');
      return;
    }
    const d = await createDeck(name);
    if (d) {
      setSelectedDeckId(d.id);
      setNewDeckName('');
      setNewDeckOpen(false);
      setErrors(prev => ({ ...prev, deck: undefined }));
    }
  }

  // Success overlay
  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Card added!</Text>
          <Text style={styles.successSub}>
            "{front}" added to {selectedDeck?.name}
          </Text>
          
          <View style={styles.successActions}>
            <Pressable style={styles.successBtnPrimary} onPress={handleAddAnother}>
              <Text style={styles.successBtnPrimaryText}>➕ Add another card</Text>
            </Pressable>
            <Pressable style={styles.successBtnSecondary} onPress={handleGoToStudy}>
              <Text style={styles.successBtnSecondaryText}>📚 Study this deck</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add New Card</Text>
            <Text style={styles.subtitle}>Create your own flashcard</Text>
          </View>

          {/* Progress Steps */}
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={[styles.stepNumber, styles.stepActive]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Spanish</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={[styles.stepNumber, back ? styles.stepActive : styles.stepInactive]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepLabel}>English</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={[styles.stepNumber, selectedDeckId ? styles.stepActive : styles.stepInactive]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepLabel}>Deck</Text>
            </View>
          </View>

          {/* Step 1: Spanish (Front) */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Spanish Phrase 🇨🇴</Text>
              <Text style={styles.required}>Required</Text>
            </View>
            <TextInput
              value={front}
              onChangeText={(text) => {
                setFront(text);
                if (errors.front) setErrors(prev => ({ ...prev, front: undefined }));
              }}
              placeholder="¿Qué más pues?"
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, errors.front ? styles.inputError : undefined]}
              multiline
              numberOfLines={2}
            />
            {errors.front ? (
              <Text style={styles.errorText}>{errors.front}</Text>
            ) : (
              <Text style={styles.hint}>The Spanish word or phrase you want to learn</Text>
            )}
          </View>

          {/* Step 2: English (Back) */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>English Translation</Text>
              <Text style={styles.required}>Required</Text>
            </View>
            <TextInput
              value={back}
              onChangeText={(text) => {
                setBack(text);
                if (errors.back) setErrors(prev => ({ ...prev, back: undefined }));
              }}
              placeholder="What's up?"
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, errors.back ? styles.inputError : undefined]}
              multiline
              numberOfLines={2}
            />
            {errors.back ? (
              <Text style={styles.errorText}>{errors.back}</Text>
            ) : (
              <Text style={styles.hint}>What it means in English</Text>
            )}
          </View>

          {/* Step 3: Deck Selection */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Save to Deck</Text>
              <Text style={styles.required}>Required</Text>
            </View>
            <Pressable 
              style={[styles.deckSelect, errors.deck ? styles.inputError : undefined]} 
              onPress={() => setPickerOpen(true)}
            >
              <View style={styles.deckSelectContent}>
                <Text style={styles.deckSelectIcon}>📚</Text>
                <View style={styles.deckSelectText}>
                  <Text style={styles.deckSelectName}>
                    {selectedDeck?.name ?? 'Choose a deck'}
                  </Text>
                  {selectedDeck && (
                    <Text style={styles.deckSelectCount}>
                      {selectedDeck.cards.length} cards
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.deckSelectArrow}>▼</Text>
            </Pressable>
            {errors.deck && <Text style={styles.errorText}>{errors.deck}</Text>}
          </View>

          {/* Optional: Example */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Example Sentence</Text>
              <Text style={styles.optional}>Optional</Text>
            </View>
            <TextInput
              value={example}
              onChangeText={setExample}
              placeholder="¡Qué chimba de concierto! | What an awesome concert!"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              multiline
              numberOfLines={3}
            />
            <Text style={styles.hint}>Use | to separate Spanish and English</Text>
          </View>

          {/* Optional: Tags */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Tags</Text>
              <Text style={styles.optional}>Optional</Text>
            </View>
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="slang, Medellín, colloquial"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
            />
            <Text style={styles.hint}>Comma-separated tags to organize cards</Text>
          </View>

          {/* Save Button */}
          <Pressable 
            style={styles.saveButton}
            onPress={save}
          >
            <Text style={styles.saveButtonText}>💾 Save Card</Text>
          </Pressable>

          {/* Bottom padding */}
          <View style={{ height: spacing(4) }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Deck picker modal */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Deck</Text>
              <Pressable onPress={() => setPickerOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            
            <FlatList
              data={decks}
              keyExtractor={(d: Deck) => d.id}
              renderItem={({ item }: { item: Deck }) => (
                <Pressable
                  style={[
                    styles.modalRow,
                    selectedDeckId === item.id && styles.modalRowActive,
                  ]}
                  onPress={() => {
                    setSelectedDeckId(item.id);
                    setErrors(prev => ({ ...prev, deck: undefined }));
                    setPickerOpen(false);
                  }}
                >
                  <View style={styles.modalRowContent}>
                    <Text style={styles.modalRowIcon}>📚</Text>
                    <View>
                      <Text style={[
                        styles.modalRowTitle,
                        selectedDeckId === item.id && styles.modalRowTitleActive,
                      ]}>
                        {item.name}
                      </Text>
                      <Text style={styles.modalRowSub}>{item.cards.length} cards</Text>
                    </View>
                  </View>
                  {selectedDeckId === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              )}
              ListFooterComponent={
                <Pressable
                  style={styles.newDeckRow}
                  onPress={() => {
                    setPickerOpen(false);
                    setNewDeckOpen(true);
                  }}
                >
                  <Text style={styles.newDeckRowText}>➕ Create New Deck</Text>
                </Pressable>
              }
            />
          </View>
        </View>
      </Modal>

      {/* New deck modal */}
      <Modal
        visible={newDeckOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNewDeckOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Create New Deck</Text>
            <Text style={styles.modalSub}>
              Give your new deck a name
            </Text>
            <TextInput
              placeholder="e.g., Colombian Slang"
              placeholderTextColor={colors.textTertiary}
              value={newDeckName}
              onChangeText={setNewDeckName}
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setNewDeckOpen(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={createNewDeck}
              >
                <Text style={styles.modalBtnPrimaryText}>Create</Text>
              </Pressable>
            </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing(2),
  },
  
  // Header
  header: {
    marginBottom: spacing(2),
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    marginTop: spacing(0.25),
  },
  
  // Steps indicator
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(3),
    paddingVertical: spacing(1),
  },
  step: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(0.5),
  },
  stepActive: {
    backgroundColor: colors.brand,
  },
  stepInactive: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepNumberText: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  stepLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing(0.5),
    marginBottom: spacing(1),
  },
  
  // Form sections
  section: {
    marginBottom: spacing(2),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(0.75),
  },
  label: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  required: {
    color: colors.danger,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  optional: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.size.base,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.size.sm,
    marginTop: spacing(0.5),
  },
  hint: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
    marginTop: spacing(0.5),
  },
  
  // Deck select
  deckSelect: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deckSelectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deckSelectIcon: {
    fontSize: 20,
    marginRight: spacing(1),
  },
  deckSelectText: {
    flex: 1,
  },
  deckSelectName: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  deckSelectCount: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  deckSelectArrow: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  
  // Save button
  saveButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    alignItems: 'center',
    marginTop: spacing(1),
  },
  saveButtonText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.lg,
  },
  
  // Success screen
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(4),
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: spacing(1),
  },
  successTitle: {
    color: colors.success,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
    marginBottom: spacing(0.5),
  },
  successSub: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textAlign: 'center',
    marginBottom: spacing(3),
  },
  successActions: {
    width: '100%',
    gap: spacing(1),
  },
  successBtnPrimary: {
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    alignItems: 'center',
  },
  successBtnPrimaryText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  successBtnSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  successBtnSecondaryText: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    maxHeight: '70%',
    padding: spacing(2),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
    paddingBottom: spacing(1),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  modalClose: {
    color: colors.textSecondary,
    fontSize: 20,
    padding: spacing(1),
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing(1.5),
    borderRadius: radius.md,
    marginBottom: spacing(0.5),
  },
  modalRowActive: {
    backgroundColor: colors.brandMuted,
  },
  modalRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRowIcon: {
    fontSize: 20,
    marginRight: spacing(1),
  },
  modalRowTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  modalRowTitleActive: {
    color: colors.brand,
  },
  modalRowSub: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  checkmark: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: typography.weight.bold,
  },
  newDeckRow: {
    padding: spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing(0.5),
  },
  newDeckRowText: {
    color: colors.brand,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  
  // New deck modal
  modalBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing(2),
    margin: spacing(4),
  },
  modalSub: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    marginBottom: spacing(1.5),
  },
  modalInput: {
    backgroundColor: colors.bg,
    color: colors.textPrimary,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.size.base,
    marginBottom: spacing(1.5),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  modalBtn: {
    flex: 1,
    padding: spacing(1.25),
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: colors.surfaceElevated,
  },
  modalBtnSecondaryText: {
    color: colors.textSecondary,
    fontWeight: typography.weight.bold,
  },
  modalBtnPrimary: {
    backgroundColor: colors.brand,
  },
  modalBtnPrimaryText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
  },
});
