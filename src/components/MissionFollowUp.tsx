import { useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashCard } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { splitExampleText } from '../utils/exampleText';

// Optional self-check only. It deliberately has no storage or grading capability.
export default function MissionFollowUp({
  cards,
  onDone,
}: {
  cards: FlashCard[];
  onDone: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const { t } = useLanguage();
  const [index, setIndex] = useState(0),
    [revealed, setRevealed] = useState(false);
  const card = cards[index];
  if (!card) return null;
  const example = splitExampleText(card.example);
  const button = (label: string, action: () => void) => (
    <Pressable key={label} accessibilityRole="button" style={styles.button} onPress={action}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>
        {t('mission.followUp')}
      </Text>
      <Text style={styles.note}>{t('mission.followUpNote')}</Text>
      <Text style={styles.note}>
        {t('mission.phrasePosition', { current: index + 1, total: cards.length })}
      </Text>
      <Text style={styles.cue}>{card.back}</Text>
      {revealed ? (
        <View accessibilityLiveRegion="polite">
          <Text style={styles.cue}>{card.front}</Text>
          {example && (
            <>
              <Text style={styles.note}>{example.spanish}</Text>
              {example.english && <Text style={styles.note}>{example.english}</Text>}
            </>
          )}
        </View>
      ) : (
        button(t('mission.reveal'), () => setRevealed(true))
      )}
      {revealed &&
        index < cards.length - 1 &&
        button(t('mission.nextPhrase'), () => {
          setIndex(index + 1);
          setRevealed(false);
        })}
      {button(t('mission.return'), onDone)}
    </View>
  );
}
const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    card: {
      padding: 20,
      gap: 18,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderBrand,
    },
    title: { color: colors.textPrimary, fontSize: 23, fontWeight: '700' },
    note: { color: colors.textSecondary, fontSize: 16, lineHeight: 24 },
    cue: { color: colors.textPrimary, fontSize: 24, lineHeight: 32 },
    button: {
      minHeight: 48,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.brand,
      justifyContent: 'center',
    },
    buttonText: { color: colors.textInverse, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  });
