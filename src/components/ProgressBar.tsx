import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../styles/theme';

interface Props {
  progress: number; // 0 to 1
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'brand' | 'success';
}

export default function ProgressBar({ 
  progress, 
  size = 'md',
  variant = 'brand' 
}: Props) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  const height = size === 'sm' ? 4 : size === 'md' ? 8 : 12;
  
  const barColor = variant === 'success' 
    ? colors.success 
    : variant === 'default' 
    ? colors.info 
    : colors.brand;

  return (
    <View style={[styles.wrap, { height, borderRadius: radius.full }]}>
      <View 
        style={[
          styles.bar, 
          { 
            width: `${clampedProgress * 100}%`,
            backgroundColor: barColor,
            borderRadius: radius.full,
          } 
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    backgroundColor: colors.border, 
    overflow: 'hidden',
  },
  bar: { 
    height: '100%',
  },
});
