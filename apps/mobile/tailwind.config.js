const designTokensPresetModule = require('@colheita/design-tokens/tailwind-preset');

/** Mesmo design system do web: cores e raios vêm de @colheita/design-tokens. */
module.exports = {
  content: ['./index.ts', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset'), designTokensPresetModule.default ?? designTokensPresetModule],
};
