import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pressable from './ThemedPressable';
import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import type { AppTheme } from '../styles/appTheme';
import { controlSurface, controlText } from '../styles/controlStates';
import type { ResolvedAdventure } from '../adventures/content';
import type { AdventureState } from '../adventures/state';

export function visitStatus(def: ResolvedAdventure, state: AdventureState) {
  const finished = (id: string) =>
    state.milestones.some((milestone) => milestone.mode === def.mode && milestone.missionId === id);
  const prerequisite = def.pack.prerequisites.find((id) => !finished(id));
  if (prerequisite) return { kind: 'locked' as const, prerequisite };
  const unfinished = state.runs.some(
    (run) =>
      run.mode === def.mode &&
      run.fingerprint === def.fingerprint &&
      run.mission.missionId === def.pack.id &&
      !run.mission.completed,
  );
  if (unfinished) return { kind: 'resume' as const };
  return { kind: finished(def.pack.id) ? ('revisit' as const) : ('start' as const) };
}

export function AdventureButton({
  label,
  onPress,
  disabled = false,
  secondary = false,
  buttonRef,
  expanded,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  buttonRef?: React.Ref<View>;
  expanded?: boolean;
}) {
  const theme = useAppTheme(),
    styles = useThemedStyles(adventureStyles);
  return (
    <Pressable
      ref={buttonRef}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, expanded }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        disabled && { opacity: 0.5 },
        controlSurface(theme, pressed, disabled, !secondary),
      ]}
    >
      <Text
        style={[styles.buttonText, secondary && styles.secondaryText, controlText(theme, disabled)]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function CafeStamp({
  title,
  description,
  stampRef,
}: {
  title: string;
  description: string;
  stampRef?: React.Ref<View>;
}) {
  const styles = useThemedStyles(adventureStyles);
  return (
    <View
      ref={stampRef}
      accessible
      accessibilityLabel={`${title}. ${description}`}
      style={styles.stamp}
    >
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
    secondaryButton: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryText: { color: colors.textPrimary },
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
