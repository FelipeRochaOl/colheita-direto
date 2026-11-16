/**
 * As fontes originais (Euclid Circular A, MongoDB Value Serif) são licenciadas e não podem
 * ser distribuídas. Usamos alternativas abertas (Google Fonts, licença OFL) com o mesmo papel.
 */
export const fontFamilies = {
  // Texto e interface
  sans: `'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
  // Serifa de display com contraste, no papel da MongoDB Value Serif
  serif: `'Fraunces', Georgia, serif`,
  mono: `'Source Code Pro', Menlo, monospace`,
} as const;

export const fontSizes = {
  caption: 12,
  body: 16,
  bodyLarge: 18,
  title: 24,
  headline: 32,
  display: 48,
} as const;
