/** The illustrated café is a shared Home identity in both app themes.
 * Text stays on these opaque surfaces; artwork never supplies text contrast.
 */
export const cafeColors = {
  cream: '#FFF0D7',
  secondary: '#E9DCC8',
  greeting: '#FFDA70',
  yellow: '#FFCF26',
  yellowPressed: '#EABC15',
  onYellow: '#182B32',
  morning: '#183D4D',
  afternoon: '#253F50',
  evening: '#09263F',
  sunsetWash: '#F9AE55',
  lamplight: '#FFD36B',
  steam: '#FFF7E6',
  card: '#17384F',
  border: '#6D8BA1',
  tabBorder: '#496174',
  clear: 'transparent',
} as const;
export const cafePalette = {
  morning: { background: cafeColors.morning },
  afternoon: { background: cafeColors.afternoon },
  evening: { background: cafeColors.evening },
} as const;
