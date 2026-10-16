// 따뜻하고 말랑한 색과 모양을 한곳에서 관리해요.
export const Colors = {
  background: '#FFF8F0', // 크림색 바탕
  card: '#FFFFFF',
  text: '#4A3B34',
  textSoft: '#9A8478',
  border: '#F3E4D7',
  primary: '#FF8A65', // 코랄
  primarySoft: '#FFE3D8',
  yellow: '#FFD166',
  yellowSoft: '#FFF3CF',
  green: '#7BC67E',
  greenSoft: '#E3F4E2',
  danger: '#E5736B',
  white: '#FFFFFF',
} as const;

export const Radius = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FontSize = {
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 40,
} as const;
