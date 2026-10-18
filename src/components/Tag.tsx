import { useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../styles/theme';

export default function Tag({ label }: { label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.tag}>
      <Text style={styles.txt}>{label}</Text>
    </View>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    tag: {
      backgroundColor: colors.tagSurface,
      paddingVertical: 4,
      paddingHorizontal: spacing(1),
      borderRadius: 999,
      marginRight: 6,
    },
    txt: { color: colors.tagText, fontSize: 12, fontWeight: '700' },
  });
