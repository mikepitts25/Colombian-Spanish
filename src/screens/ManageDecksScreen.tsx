import Pressable from '../components/ThemedPressable';
import ThemedTextInput from '../components/ThemedTextInput';
import { controlSurface, controlText } from '../styles/controlStates';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, usePreventRemove } from '@react-navigation/native';

import { useDeck } from '../hooks/useDeck';
import { Deck } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SHOW_REVIEW_TOOLS } from '../config';

type RenameIntent = { id: string; name: string };
function Action({
  label,
  accessibilityLabel,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        danger && styles.danger,
        disabled && styles.disabled,
        controlSurface(theme, pressed, disabled, false),
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, controlText(theme, disabled)]}>{label}</Text>
    </Pressable>
  );
}
export default function ManageDecksScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const { ready, decks, activeDeckId, renameDeck, deleteDeck, resetDeckProgress, setActiveDeckId } =
    useDeck();
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const { fontScale } = useWindowDimensions();
  const [q, setQ] = useState('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDeckId, setRenameDeckId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [pendingRename, setPendingRename] = useState<RenameIntent | null>(null);
  const pending = useRef<RenameIntent | null>(null);
  const writing = useRef(false);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [renameError, setRenameError] = useState(false);
  const [operationError, setOperationError] = useState(false);
  const blocked = busy || pendingRename !== null;
  usePreventRemove(blocked, () => {});
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return query ? decks.filter((deck) => deck.name.toLowerCase().includes(query)) : decks;
  }, [decks, q]);
  function closeRename() {
    if (writing.current) return;
    pending.current = null;
    setPendingRename(null);
    setRenameError(false);
    setRenameOpen(false);
  }
  function openRename(deck: Deck) {
    if (writing.current || pending.current) return;
    setRenameDeckId(deck.id);
    setRenameValue(deck.name);
    setRenameError(false);
    setRenameOpen(true);
  }
  async function persistRename(intent: RenameIntent) {
    if (writing.current) return;
    writing.current = true;
    setBusy(true);
    setRenameError(false);
    try {
      await renameDeck(intent.id, intent.name);
      if (!mounted.current) return;
      pending.current = null;
      setPendingRename(null);
      setRenameOpen(false);
      setRenameDeckId(null);
      setRenameValue('');
    } catch {
      if (mounted.current) setRenameError(true);
    } finally {
      writing.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  function submitRename() {
    if (writing.current || pending.current || !renameDeckId) return;
    const name = renameValue.trim();
    if (!name)
      return Alert.alert(
        t('manage.alert.missingName.title'),
        t('manage.alert.missingName.message'),
      );
    const intent = { id: renameDeckId, name };
    pending.current = intent;
    setPendingRename(intent);
    void persistRename(intent);
  }
  async function mutate(operation: () => Promise<void>) {
    if (writing.current || pending.current) return;
    writing.current = true;
    setBusy(true);
    setOperationError(false);
    try {
      await operation();
    } catch {
      if (mounted.current) setOperationError(true);
    } finally {
      writing.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  function confirm(deck: Deck, kind: 'delete' | 'reset') {
    if (writing.current || pending.current) return;
    Alert.alert(
      t(kind === 'delete' ? 'manage.alert.delete.title' : 'manage.alert.reset.title'),
      t(kind === 'delete' ? 'manage.alert.delete.message' : 'manage.alert.reset.message', {
        deck: deck.name,
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t(kind === 'delete' ? 'manage.delete' : 'manage.reset'),
          style: 'destructive',
          onPress: () => {
            void mutate(() =>
              kind === 'delete' ? deleteDeck(deck.id) : resetDeckProgress(deck.id),
            );
          },
        },
      ],
    );
  }
  const header = (
    <View style={styles.header}>
      <Action
        label={t('manage.home')}
        disabled={blocked}
        onPress={() => {
          if (!writing.current && !pending.current)
            nav.navigate('Root', { screen: 'Home' }, { pop: true });
        }}
      />
      <Text accessibilityRole="header" style={styles.h1}>
        {t('manage.title')}
      </Text>
      <Text style={styles.body}>{t('manage.sub')}</Text>
      {busy && (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          {t('editing.saving')}
        </Text>
      )}
      {operationError && (
        <Text accessibilityRole="alert" style={styles.body}>
          {t('manage.operationError')}
        </Text>
      )}
      {SHOW_REVIEW_TOOLS && (
        <Action
          label={t('manage.reviewTitle')}
          disabled={blocked}
          onPress={() => {
            if (!writing.current && !pending.current) nav.navigate('Review');
          }}
        />
      )}
      <ThemedTextInput
        accessibilityLabel={t('manage.searchPlaceholder')}
        value={q}
        editable={!blocked}
        onChangeText={(value) => {
          if (!writing.current && !pending.current) setQ(value);
        }}
        placeholder={t('manage.searchPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
  return (
    <SafeAreaView key={fontScale} style={styles.wrap}>
      {!ready ? (
        <Text style={styles.h1}>{t('common.loading')}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(deck) => deck.id}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          ListEmptyComponent={<Text style={styles.body}>{t('manage.empty')}</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.name}
                accessibilityState={{ selected: activeDeckId === item.id, disabled: blocked }}
                disabled={blocked}
                style={styles.select}
                onPress={() => {
                  if (!writing.current && !pending.current) setActiveDeckId(item.id);
                }}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.body}>
                  {t('manage.cardCount', {
                    count: item.cards.length,
                    plural: item.cards.length === 1 ? '' : 's',
                  })}
                </Text>
              </Pressable>
              <View style={[styles.actions, fontScale > 1.3 && styles.stacked]}>
                <Action
                  label={t('manage.rename')}
                  accessibilityLabel={`${t('manage.rename')}: ${item.name}`}
                  disabled={blocked}
                  onPress={() => openRename(item)}
                />
                <Action
                  label={t('manage.reset')}
                  accessibilityLabel={`${t('manage.reset')}: ${item.name}`}
                  disabled={blocked}
                  onPress={() => confirm(item, 'reset')}
                  danger
                />
                <Action
                  label={t('manage.delete')}
                  accessibilityLabel={`${t('manage.delete')}: ${item.name}`}
                  disabled={blocked}
                  onPress={() => confirm(item, 'delete')}
                  danger
                />
              </View>
            </View>
          )}
        />
      )}
      <Modal visible={renameOpen} transparent animationType="fade" onRequestClose={closeRename}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBody}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.header}>
              <Text accessibilityRole="header" style={styles.h1}>
                {t('manage.renameDeck')}
              </Text>
              {busy && (
                <Text accessibilityLiveRegion="polite" style={styles.body}>
                  {t('editing.saving')}
                </Text>
              )}
              {renameError && (
                <>
                  <Text accessibilityRole="alert" style={styles.body}>
                    {t('editing.saveError')}
                  </Text>
                  <Action
                    label={t('editing.retry')}
                    disabled={busy}
                    onPress={() => {
                      if (pending.current) void persistRename(pending.current);
                    }}
                  />
                  <Text style={styles.body}>{t('editing.uncertain')}</Text>
                </>
              )}
              <ThemedTextInput
                accessibilityLabel={t('manage.deckNamePlaceholder')}
                editable={!blocked}
                value={renameValue}
                onChangeText={(value) => {
                  if (!writing.current && !pending.current) setRenameValue(value);
                }}
                placeholder={t('manage.deckNamePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                multiline
                autoFocus
              />
              <Action label={t('common.cancel')} disabled={busy} onPress={closeRename} />
              <Action label={t('common.save')} disabled={blocked} onPress={submitRename} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40 },
    header: { gap: 12, marginBottom: 16 },
    h1: { color: colors.textPrimary, fontSize: 24, fontWeight: '900' },
    body: { color: colors.textSecondary, fontSize: 16, lineHeight: 24 },
    input: {
      minHeight: 48,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      color: colors.textPrimary,
      fontSize: 16,
      textAlignVertical: 'top',
    },
    row: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      gap: 12,
    },
    name: { color: colors.textPrimary, fontWeight: '800', fontSize: 18 },
    select: { minHeight: 48, justifyContent: 'center' },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    stacked: { flexDirection: 'column', alignItems: 'stretch' },
    button: {
      minHeight: 48,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
    danger: { borderColor: colors.managementWarning },
    disabled: { opacity: 0.6 },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      padding: 20,
    },
    modalBody: {
      maxHeight: '85%',
      backgroundColor: colors.surfaceElevated,
      borderRadius: 14,
      padding: 16,
    },
  });
