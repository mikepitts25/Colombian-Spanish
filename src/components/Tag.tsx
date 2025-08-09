import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/theme';

export default function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}><Text style={styles.txt}>{label}</Text></View>
  );
}

const styles = StyleSheet.create({
  tag: { backgroundColor: '#0b1220', paddingVertical: 4, paddingHorizontal: spacing(1), borderRadius: 999, marginRight: 6 },
  txt: { color: '#93c5fd', fontSize: 12, fontWeight: '700' }
});
