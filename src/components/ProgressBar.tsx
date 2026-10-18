import { useAppTheme, useThemedStyles } from '../context/ThemeContext';
import { AppTheme } from '../styles/appTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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

export default function ProgressBar({
  progress,
  size = 'md',
  variant = 'brand',
}: ProgressBarProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const variantColors: Record<ProgressBarVariant, string> = {
    default: colors.accentBlue,
    brand: colors.brand,
    success: colors.progressSuccess,
  };

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

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    wrap: { backgroundColor: colors.progressTrack, borderRadius: 999 },
    bar: { height: '100%', borderRadius: 999 },
  });
