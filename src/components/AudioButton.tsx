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
  const { t } = useLanguage();

  function handlePress() {
    if (card) {
      void speakCard(card);
      return;
    }

    speak(text);
  }

  return (
    <Pressable style={styles.btn} onPress={handlePress}>
      <Text style={styles.txt}>🔊 {t('common.listen')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#1f2937',
    padding: spacing(1),
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  txt: { color: '#fff', fontWeight: '600' },
});
