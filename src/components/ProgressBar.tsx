import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../styles/theme';

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, { width: `${Math.max(0, Math.min(100, progress * 100))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 10, backgroundColor: '#1f2937', borderRadius: 999 },
  bar: { height: '100%', backgroundColor: colors.accent, borderRadius: 999 }
});
