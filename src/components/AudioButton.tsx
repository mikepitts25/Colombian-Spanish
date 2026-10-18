import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import { controlSurface } from '../styles/controlStates';
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { spacing } from '../styles/theme';
import { speak, speakCard } from '../services/tts';
import { useLanguage } from '../context/LanguageContext';
import { FlashCard } from '../types';

type Props = {
  text: string;
  card?: Pick<FlashCard, 'id' | 'front'>;
};

export default function AudioButton({ text, card }: Props) {
  const styles = useThemedStyles(makeStyles);
  const theme = useAppTheme();
  const { t } = useLanguage();

  function handlePress() {
    if (card) {
      void speakCard(card);
      return;
    }

    speak(text);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('common.listen')}
      style={({ pressed }) => [styles.btn, controlSurface(theme, pressed, false, false)]}
      onPress={handlePress}
    >
      <Text style={styles.txt}>🔊 {t('common.listen')}</Text>
    </Pressable>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    btn: {
      backgroundColor: colors.audioSurface,
      padding: spacing(1),
      borderRadius: 10,
      alignSelf: 'flex-start',
    },
    txt: { color: colors.audioText, fontWeight: '600' },
  });
