import React from 'react';
import { Image, Text } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
const icons = {
  home: { emoji: '🏠', image: require('../../assets/theme-icons/home.png') },
  study: { emoji: '📖', image: require('../../assets/theme-icons/study.png') },
  progress: { emoji: '📊', image: require('../../assets/theme-icons/progress.png') },
  settings: { emoji: '⚙️', image: require('../../assets/theme-icons/settings.png') },
  audio: { emoji: '🔊', image: require('../../assets/theme-icons/audio.png') },
  add: { emoji: '➕', image: require('../../assets/theme-icons/add.png') },
  back: { emoji: '←', image: require('../../assets/theme-icons/back.png') },
};
export type ThemeIconName = keyof typeof icons;
/** Decorative: the containing control supplies the accessible label. */
export default function ThemeIcon({
  name,
  size = 20,
  color,
}: {
  name: ThemeIconName;
  size?: number;
  color?: string;
}) {
  const theme = useAppTheme();
  const icon = icons[name];
  if (theme.iconStyle === 'emoji')
    return (
      <Text allowFontScaling={false} accessible={false} style={{ fontSize: size }}>
        {icon.emoji}
      </Text>
    );
  return (
    <Image
      source={icon.image}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{ width: size, height: size, tintColor: color ?? theme.colors.textPrimary }}
    />
  );
}
