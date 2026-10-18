import React, { forwardRef, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
/** No extra native view: preserve control refs/handlers and Classic geometry. */
const ThemedPressable = forwardRef<View, PressableProps>(function ThemedPressable(
  { style, onFocus, onBlur, ...props },
  ref,
) {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      ref={ref}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={(state) => {
        const base = typeof style === 'function' ? style(state) : style;
        if (theme.id === 'classic') return base;
        const metrics = StyleSheet.flatten(base);
        return [
          base,
          {
            minHeight: Math.max(48, typeof metrics?.minHeight === 'number' ? metrics.minHeight : 0),
            minWidth: Math.max(48, typeof metrics?.minWidth === 'number' ? metrics.minWidth : 0),
          },
          focused && {
            outlineWidth: 2,
            outlineStyle: 'solid',
            outlineOffset: 2,
            outlineColor: theme.colors.focus,
          },
        ];
      }}
    />
  );
});
export default ThemedPressable;
