import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { speak } from '../services/tts';

export default function AudioButton({ text }: { text: string }) {
  return (
    <Pressable style={styles.btn} onPress={() => speak(text)}>
      <Text style={styles.txt}>🔊 Escuchar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#1f2937', padding: spacing(1), borderRadius: 10, alignSelf: 'flex-start' },
  txt: { color: '#fff', fontWeight: '600' }
});