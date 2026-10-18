import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreventRemove } from '@react-navigation/native';
import { HeaderHeightContext } from '@react-navigation/elements';
import { colors, spacing } from '../styles/theme';
import { useDeck } from '../hooks/useDeck';
import { FlashCard } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { createLocalId } from '../utils/localId';

type NewCard = Omit<FlashCard, 'createdAt' | 'due' | 'reps' | 'interval' | 'ease'>;
type CreateIntent =
  | { kind: 'card'; deckId: string; deckName: string; card: NewCard }
  | { kind: 'deck'; name: string; id: string };
function Action({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.action, disabled && styles.disabled]}
    >
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

export default function AddCardScreen() {
  const { ready, decks, activeDeckId, addCardToDeck, createDeck } = useDeck();
  const { t } = useLanguage();
  const { fontScale } = useWindowDimensions();
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [tags, setTags] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newDeckOpen, setNewDeckOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>(activeDeckId);
  const [pendingSave, setPendingSave] = useState<CreateIntent | null>(null);
  const pending = useRef<CreateIntent | null>(null);
  const writing = useRef(false);
  const mounted = useRef(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const content = useRef<ScrollView>(null);
  const viewportHeight = useRef(0);
  const focusedField = useRef<{ index: number; fontScale: number } | null>(null);
  const fieldLayouts = useRef<
    Record<number, { fontScale: number; fieldY?: number; inputY?: number }>
  >({});
  const revealFocusedInput = useCallback(() => {
    const focus = focusedField.current;
    if (!focus || focus.fontScale !== fontScale) return;
    const layout = fieldLayouts.current[focus.index];
    if (
      layout?.fontScale !== fontScale ||
      layout.fieldY === undefined ||
      layout.inputY === undefined
    )
      return;
    content.current?.scrollTo({
      y: Math.max(0, layout.fieldY + layout.inputY - 16),
      animated: false,
    });
  }, [fontScale]);
  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', revealFocusedInput);
    return () => shown.remove();
  }, [revealFocusedInput]);
  function recordFieldLayout(index: number, part: 'fieldY' | 'inputY', y: number) {
    const previous = fieldLayouts.current[index];
    fieldLayouts.current[index] = {
      ...(previous?.fontScale === fontScale ? previous : {}),
      fontScale,
      [part]: y,
    };
    if (focusedField.current?.index === index) revealFocusedInput();
  }
  const selectedDeck = decks.find((deck) => deck.id === (selectedDeckId ?? activeDeckId));
  const blocked = pendingSave !== null;
  usePreventRemove(blocked, () => {});
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function persist(intent: CreateIntent) {
    if (writing.current) return;
    writing.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      if (intent.kind === 'card') {
        await addCardToDeck(intent.deckId, intent.card);
        if (!mounted.current) return;
        setFront('');
        setBack('');
        setExample('');
        setTags('');
        Alert.alert(
          t('addCard.alert.added.title'),
          t('addCard.alert.added.message', { deck: intent.deckName }),
        );
      } else {
        const deck = await createDeck(intent.name, undefined, intent.id);
        if (!deck) throw new Error('Deck was not confirmed');
        if (!mounted.current) return;
        setSelectedDeckId(deck.id);
        setNewDeckName('');
        setNewDeckOpen(false);
      }
      pending.current = null;
      setPendingSave(null);
    } catch {
      if (mounted.current) {
        setSaveError(true);
        content.current?.scrollTo({ y: 0, animated: false });
      }
    } finally {
      writing.current = false;
      if (mounted.current) setSaving(false);
    }
  }
  function begin(intent: CreateIntent) {
    if (pending.current || !ready) return;
    pending.current = intent;
    setPendingSave(intent);
    void persist(intent);
  }
  function save() {
    if (pending.current || !ready) return;
    if (!front.trim() || !back.trim())
      return Alert.alert(t('addCard.alert.missing.title'), t('addCard.alert.missing.message'));
    if (!selectedDeck)
      return Alert.alert(t('addCard.alert.pickDeck.title'), t('addCard.alert.pickDeck.message'));
    begin({
      kind: 'card',
      deckId: selectedDeck.id,
      deckName: selectedDeck.name,
      card: {
        id: createLocalId('card'),
        front: front.trim(),
        back: back.trim(),
        example: example.trim() || undefined,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
    });
  }
  const status = (
    <>
      {saving && (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          {t('editing.saving')}
        </Text>
      )}
      {saveError && (
        <View>
          <Text accessibilityRole="alert" style={styles.body}>
            {t('editing.saveError')}
          </Text>
          <Action
            label={t('editing.retry')}
            disabled={saving}
            onPress={() => {
              if (pending.current) void persist(pending.current);
            }}
          />

          <Text style={styles.body}>{t('editing.uncertain')}</Text>
          <Action
            label={t('editing.editDraft')}
            disabled={saving}
            onPress={() => {
              if (writing.current) return;
              pending.current = null;
              setPendingSave(null);
              setSaveError(false);
            }}
          />
        </View>
      )}
    </>
  );
  const fields = [
    {
      label: t('addCard.front'),
      placeholder: t('addCard.frontPlaceholder'),
      value: front,
      setter: setFront,
    },
    {
      label: t('addCard.back'),
      placeholder: t('addCard.backPlaceholder'),
      value: back,
      setter: setBack,
    },
    {
      label: t('addCard.example'),
      placeholder: t('addCard.examplePlaceholder'),
      value: example,
      setter: setExample,
    },
    {
      label: t('addCard.tags'),
      placeholder: t('addCard.tagsPlaceholder'),
      value: tags,
      setter: setTags,
    },
  ];
  return (
    <SafeAreaView key={fontScale} style={styles.wrap}>
      <KeyboardAvoidingView
        style={styles.flex}
        keyboardVerticalOffset={headerHeight}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={content}
          onLayout={(event) => {
            const height = event.nativeEvent.layout.height;
            const previous = viewportHeight.current;
            viewportHeight.current = height;
            if (height < previous) revealFocusedInput();
          }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="interactive"
        >
          <Text accessibilityRole="header" style={styles.h1}>
            {t('addCard.title')}
          </Text>
          {!ready && <Text style={styles.body}>{t('common.loading')}</Text>}
          {!newDeckOpen && status}
          <Text style={styles.label}>{t('addCard.deck')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('addCard.chooseDeck')}
            accessibilityValue={{ text: selectedDeck?.name ?? t('addCard.selectDeck') }}
            accessibilityState={{ disabled: blocked || !ready }}
            disabled={blocked || !ready}
            style={styles.select}
            onPress={() => {
              if (!pending.current) setPickerOpen(true);
            }}
          >
            <Text style={styles.body}>{selectedDeck?.name ?? t('addCard.selectDeck')}</Text>
          </Pressable>
          {fields.map((field, index) => (
            <View
              key={field.label}
              style={styles.field}
              onLayout={(event) => recordFieldLayout(index, 'fieldY', event.nativeEvent.layout.y)}
            >
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                accessibilityLabel={field.label}
                onLayout={(event) => recordFieldLayout(index, 'inputY', event.nativeEvent.layout.y)}
                onFocus={() => {
                  focusedField.current = { index, fontScale };
                  revealFocusedInput();
                }}
                onBlur={() => {
                  if (
                    focusedField.current?.index === index &&
                    focusedField.current.fontScale === fontScale
                  )
                    focusedField.current = null;
                }}
                value={field.value}
                editable={!blocked && ready}
                onChangeText={(value) => {
                  if (!pending.current) field.setter(value);
                }}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                multiline
              />
            </View>
          ))}
          <Action label={t('addCard.save')} onPress={save} disabled={blocked || !ready} />
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!pending.current) setPickerOpen(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBody}>
            <FlatList
              data={decks}
              keyExtractor={(deck) => deck.id}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <>
                  <Text accessibilityRole="header" style={styles.modalTitle}>
                    {t('addCard.chooseDeck')}
                  </Text>
                  <Action
                    label={t('addCard.newDeck')}
                    disabled={blocked}
                    onPress={() => {
                      if (pending.current) return;
                      setPickerOpen(false);
                      setNewDeckOpen(true);
                    }}
                  />
                  <Text style={styles.body}>{t('addCard.newDeckSub')}</Text>
                  <Action
                    label={t('common.close')}
                    disabled={blocked}
                    onPress={() => {
                      if (!pending.current) setPickerOpen(false);
                    }}
                  />
                </>
              }
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityLabel={item.name}
                  accessibilityState={{ checked: item.id === selectedDeck?.id, disabled: blocked }}
                  disabled={blocked}
                  style={styles.modalRow}
                  onPress={() => {
                    if (pending.current) return;
                    setSelectedDeckId(item.id);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.label}>{item.name}</Text>
                  <Text style={styles.body}>
                    {t('addCard.cardCount', {
                      count: item.cards.length,
                      plural: item.cards.length === 1 ? '' : 's',
                    })}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={newDeckOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!pending.current) setNewDeckOpen(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalBody}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalContent}
            >
              <Text accessibilityRole="header" style={styles.modalTitle}>
                {t('addCard.newDeckTitle')}
              </Text>
              {newDeckOpen && status}
              <TextInput
                accessibilityLabel={t('addCard.newDeckPlaceholder')}
                placeholder={t('addCard.newDeckPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={newDeckName}
                editable={!blocked}
                onChangeText={(value) => {
                  if (!pending.current) setNewDeckName(value);
                }}
                style={styles.input}
                multiline
              />
              <Action
                label={t('common.cancel')}
                disabled={blocked}
                onPress={() => {
                  if (!pending.current) setNewDeckOpen(false);
                }}
              />
              <Action
                label={t('common.create')}
                disabled={blocked || !newDeckName.trim()}
                onPress={() => {
                  if (newDeckName.trim())
                    begin({ kind: 'deck', name: newDeckName.trim(), id: createLocalId('deck') });
                }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing(2), paddingBottom: 40, gap: 12 },
  h1: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
  field: { gap: 6 },
  label: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  body: { color: colors.textSecondary, fontSize: 16, lineHeight: 24 },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  action: {
    minHeight: 48,
    backgroundColor: colors.brand,
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  actionText: { color: colors.bg, fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  select: {
    minHeight: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBody: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    maxHeight: '85%',
  },
  modalContent: { gap: 12 },
  modalTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  modalRow: {
    minHeight: 48,
    paddingVertical: 14,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
});
