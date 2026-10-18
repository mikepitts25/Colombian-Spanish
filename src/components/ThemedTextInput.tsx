import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
/** A stable native input: focus/state survive live palette changes. */
const ThemedTextInput = forwardRef<TextInput, TextInputProps>(function ThemedTextInput(
  { style, onFocus, onBlur, ...props },
  ref,
) {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      ref={ref}
      keyboardAppearance={theme.appearance}
      selectionColor={theme.id === 'barrio' ? theme.colors.brand : props.selectionColor}
      style={[
        theme.id === 'barrio' && { borderWidth: 1, borderColor: theme.colors.border },
        style,
        focused && theme.id === 'barrio' && { borderColor: theme.colors.focus },
      ]}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
    />
  );
});
export default ThemedTextInput;
