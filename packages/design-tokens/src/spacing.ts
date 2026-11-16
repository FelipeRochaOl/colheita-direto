/** Escala de espaçamento (px) e grid do design system de referência. */
export const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 112] as const;

export const layout = {
  maxContentWidth: 1416,
  gridColumns: 12,
  gridGap: 20,
  pagePaddingX: 40,
} as const;

export const radius = {
  small: 8,
  medium: 16,
  large: 24,
  pill: 40,
} as const;
