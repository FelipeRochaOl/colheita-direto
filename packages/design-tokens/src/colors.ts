/**
 * Cores extraídas do design system de referência (design/mongodb.com/design-system.html).
 * Única fonte de cor do projeto: nenhum app deve declarar hexadecimal fora deste arquivo.
 */
export const colors = {
  evergreenDark: '#001E2B',
  deepDark: '#061621',
  cardDark: '#21313C',
  tealDark: '#023430',
  lightSurface: '#FAFBFC',
  white: '#FFFFFF',

  brandGreen: '#00ED64',
  greenMedium: '#00AA57',
  greenDark: '#00684A',
  linkBlue: '#006CFA',
  focusBlue: '#0498EC',
  purple: '#B45AF2',
  lightPurple: '#F9EBFF',

  offWhite: '#E8EDEB',
  mutedText: '#B8C4C2',
  borderActive: '#5D6C74',
  borderSubtle: '#3D4F58',

  warning: '#FFA500',
  danger: '#DB3030',
} as const;

/** Cores das classes de qualidade da colheita (A–D). */
export const qualityGradeColors = {
  A: colors.greenDark,
  B: colors.greenMedium,
  C: colors.warning,
  D: colors.danger,
} as const;

export const gradients = {
  heroTitle: `linear-gradient(90deg, #00E97A 0%, #00D4EB 25%, #E9FF99 50%, #00E97A 75%, #00D4EB 100%)`,
  bannerTitle: `linear-gradient(90deg, #B1FF05, ${colors.brandGreen})`,
  darkSection: `linear-gradient(180deg, ${colors.evergreenDark}, ${colors.cardDark})`,
} as const;

export type ColorToken = keyof typeof colors;
