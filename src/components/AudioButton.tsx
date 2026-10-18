import Pressable from './ThemedPressable';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import { controlSurface } from '../styles/controlStates';
import React from 'react';
import ThemeIcon from './ThemeIcon';
import { Text, StyleSheet } from 'react-native';
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
      {theme.iconStyle === 'emoji' ? (
        <Text style={styles.txt}>🔊 {t('common.listen')}</Text>
      ) : (
        <>
          <ThemeIcon name="audio" size={18} color={theme.colors.audioText} />
          <Text style={styles.txt}>{t('common.listen')}</Text>
        </>
      )}
    </Pressable>
  );
}

const makeStyles = ({ id, colors }: AppTheme) =>
  StyleSheet.create({
    btn: {
      ...(id === 'barrio'
        ? { minHeight: 48, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }
        : {}),
      backgroundColor: colors.audioSurface,
      padding: spacing(1),
      borderRadius: 10,
      alignSelf: 'flex-start',
    },
    txt: { color: colors.audioText, fontWeight: '600' },
  });
