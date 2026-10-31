import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pressable from './ThemedPressable';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import type { AppTheme } from '../styles/appTheme';
import { controlSurface, controlText } from '../styles/controlStates';
export function AdventureButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useAppTheme(),
    styles = useThemedStyles(adventureStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && { opacity: 0.5 },
        controlSurface(theme, pressed, disabled),
      ]}
    >
      <Text style={[styles.buttonText, controlText(theme, disabled)]}>{label}</Text>
    </Pressable>
  );
}
export function CafeStamp({ title, description }: { title: string; description: string }) {
  const styles = useThemedStyles(adventureStyles);
  return (
    <View accessible accessibilityLabel={`${title}. ${description}`} style={styles.stamp}>
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.stampIcon}
      >
        <Text style={styles.stampGlyph}>☕</Text>
      </View>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.body}>{description}</Text>
    </View>
  );
}
export const adventureStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 60, gap: 20 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      gap: 14,
      borderWidth: 1,
      borderColor: colors.borderBrand,
    },
    title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
    heading: { fontSize: 21, fontWeight: '700', color: colors.textPrimary },
    body: { fontSize: 16, lineHeight: 24, color: colors.textSecondary },
    eyebrow: { fontSize: 14, fontWeight: '700', color: colors.brand },
    button: {
      minHeight: 48,
      borderRadius: 14,
      padding: 14,
      justifyContent: 'center',
      backgroundColor: colors.brand,
    },
    buttonText: { fontSize: 16, fontWeight: '700', textAlign: 'center', color: colors.onBrand },
    stamp: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.brand,
      borderRadius: 20,
      padding: 18,
      gap: 10,
    },
    stampIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stampGlyph: { fontSize: 32, color: colors.brand },
  });
