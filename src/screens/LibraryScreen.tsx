import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Pressable from '../components/ThemedPressable';
import { useThemedStyles } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePurchases } from '../context/PurchaseContext';
import { useDeck } from '../hooks/useDeck';
import { ALL_DECKS } from '../data/decks';
import { FREE_DECK_IDS } from '../billing/catalog';
import { AppTheme } from '../styles/appTheme';
import { getDeckDisplayName } from '../utils/deckCategories';

export default function LibraryScreen() {
  const styles = useThemedStyles(makeStyles);
  const nav = useNavigation<any>();
  const { t } = useLanguage();
  const { fontScale } = useWindowDimensions();
  const billing = usePurchases();
  const { ready, hasFullLibrary, legacyLibrary } = useDeck();
  const [sampleId, setSampleId] = useState<string | null>(null);
  const free = ALL_DECKS.filter((deck) => FREE_DECK_IDS.has(deck.id));
  const paid = ALL_DECKS.filter((deck) => !FREE_DECK_IDS.has(deck.id));
  const sample = paid.find((deck) => deck.id === sampleId)?.cards[0];
  const blocked = billing.busy || !ready;
  function button(label: string, action: () => void, disabled = false, primary = false) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled, busy: billing.busy }}
        disabled={disabled}
        onPress={action}
        style={[styles.button, primary && styles.primary, disabled && styles.disabled]}
      >
        <Text style={primary ? styles.primaryText : styles.buttonText}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <SafeAreaView style={styles.wrap}>
      <ScrollView key={fontScale} contentContainerStyle={styles.content}>
        {button(t(hasFullLibrary ? 'library.continue' : 'library.continueFree'), () =>
          nav.goBack(),
        )}
        <Text accessibilityRole="header" style={styles.title}>
          {t('library.title')}
        </Text>
        <Text style={styles.body}>{t('library.intro')}</Text>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.heading}>
            {t('library.freeTitle')}
          </Text>
          <Text style={styles.body}>
            {t('library.freeCount', {
              decks: free.length,
              cards: free.reduce((n, deck) => n + deck.cards.length, 0),
            })}
          </Text>
          <Text style={styles.body}>{t('library.freeTools')}</Text>
          {free.map((deck) => (
            <Text key={deck.id} style={styles.body}>
              {getDeckDisplayName(deck)}
            </Text>
          ))}
        </View>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.heading}>
            {t('library.fullTitle')}
          </Text>
          <Text style={styles.body}>
            {t('library.paidCount', {
              decks: paid.length,
              cards: paid.reduce((n, deck) => n + deck.cards.length, 0),
            })}
          </Text>
          <Text style={styles.body}>{t('library.scope')}</Text>
          {hasFullLibrary ? (
            <>
              <Text accessibilityRole="alert" style={styles.heading}>
                {t('library.unlocked')}
              </Text>
              {legacyLibrary && <Text style={styles.body}>{t('library.legacy')}</Text>}
            </>
          ) : (
            <>
              <Text style={styles.heading}>{t('library.oneTime')}</Text>
              {billing.ready && billing.product ? (
                button(
                  t('library.buy', { price: billing.product.priceString }),
                  () => {
                    void billing.purchase();
                  },
                  blocked || billing.refreshing,
                  true,
                )
              ) : (
                <Text style={styles.body}>
                  {t(billing.ready ? 'library.unavailable' : 'common.loading')}
                </Text>
              )}
            </>
          )}
          {billing.message && (
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.body}>
              {t(`library.status.${billing.message}`)}
            </Text>
          )}
          {billing.busy && (
            <Text accessibilityLiveRegion="polite" style={styles.body}>
              {t('library.working')}
            </Text>
          )}
          {button(
            t('library.restore'),
            () => {
              void billing.restore();
            },
            blocked || !billing.available,
          )}
          {button(
            t('library.retry'),
            () => {
              void billing.refresh();
            },
            blocked || billing.refreshing || !billing.available,
          )}
          <Text style={styles.note}>{t('library.restoreNote')}</Text>
        </View>
        <Text accessibilityRole="header" style={styles.heading}>
          {t('library.collections')}
        </Text>
        {paid.map((deck) => (
          <View style={styles.card} key={deck.id}>
            <Text style={styles.heading}>{getDeckDisplayName(deck)}</Text>
            <Text style={styles.body}>{t('library.cardCount', { count: deck.cards.length })}</Text>
            {button(t('library.preview', { name: getDeckDisplayName(deck) }), () =>
              setSampleId(sampleId === deck.id ? null : deck.id),
            )}
            {sampleId === deck.id && sample && (
              <View style={styles.sample}>
                <Text style={styles.heading}>{t('library.sample')}</Text>
                <Text style={styles.body}>{sample.front}</Text>
                <Text style={styles.body}>{sample.back}</Text>
                {!!sample.example && <Text style={styles.body}>{sample.example}</Text>}
              </View>
            )}
          </View>
        ))}
        <Text style={styles.note}>{t('library.audio')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: {
      padding: 20,
      gap: 16,
      paddingBottom: 40,
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
    },
    title: { fontSize: 30, fontWeight: '800', color: colors.textPrimary },
    heading: { fontSize: 19, fontWeight: '700', color: colors.textPrimary },
    body: { fontSize: 16, lineHeight: 25, color: colors.textPrimary },
    note: { fontSize: 14, lineHeight: 22, color: colors.textSecondary },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 18,
      padding: 18,
      gap: 12,
    },
    button: {
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
    },
    buttonText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
    primary: { backgroundColor: colors.brand, borderColor: colors.brand },
    primaryText: { fontSize: 17, fontWeight: '700', color: colors.onBrand, textAlign: 'center' },
    disabled: { opacity: 0.5 },
    sample: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, gap: 8 },
  });
