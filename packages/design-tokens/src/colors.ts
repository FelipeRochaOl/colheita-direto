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

  // Superfícies claras em verde (LeafyGreen green.light3 / light2)
  mint: '#E3FCF7',
  mintStrong: '#C0FAE6',

  // Ilustrações de produto (caixa de tomate da página inicial)
  produceRed: '#E5484D',
  produceRedLight: '#FF8B7E',
  produceRedDark: '#A8222A',
  crateWood: '#C98A4E',
  crateWoodDark: '#8F5A2B',
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
  heroGlow: `radial-gradient(60% 50% at 75% 20%, rgba(0, 237, 100, 0.16) 0%, rgba(0, 237, 100, 0) 70%), radial-gradient(40% 40% at 10% 90%, rgba(0, 212, 235, 0.10) 0%, rgba(0, 212, 235, 0) 70%)`,
  ctaBand: `radial-gradient(80% 120% at 100% 0%, rgba(0, 237, 100, 0.35) 0%, rgba(0, 237, 100, 0) 60%), linear-gradient(135deg, ${colors.tealDark} 0%, ${colors.evergreenDark} 100%)`,
} as const;

export type ColorToken = keyof typeof colors;
