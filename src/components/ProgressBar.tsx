import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../styles/theme';

type ProgressBarSize = 'sm' | 'md' | 'lg';
type ProgressBarVariant = 'default' | 'brand' | 'success';

type ProgressBarProps = {
  progress: number;
  size?: ProgressBarSize;
  variant?: ProgressBarVariant;
};

const sizeStyles: Record<ProgressBarSize, { height: number }> = {
  sm: { height: 6 },
  md: { height: 10 },
  lg: { height: 14 },
};

const variantColors: Record<ProgressBarVariant, string> = {
  default: colors.accentBlue,
  brand: colors.brand,
  success: '#22c55e',
};

export default function ProgressBar({
  progress,
  size = 'md',
  variant = 'brand',
}: ProgressBarProps) {
  return (
    <View style={[styles.wrap, sizeStyles[size]]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: variantColors[variant],
            width: `${Math.max(0, Math.min(100, progress * 100))}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#1f2937', borderRadius: 999 },
  bar: { height: '100%', borderRadius: 999 },
});
