import { colors } from './colors';
import { radius } from './spacing';
import { fontFamilies } from './typography';

/** Preset Tailwind v3 (usado pelo NativeWind no mobile). O web usa `tailwind-theme.css` (v4). */
const tailwindPreset = {
  theme: {
    extend: {
      colors: {
        evergreen: colors.evergreenDark,
        'deep-dark': colors.deepDark,
        'card-dark': colors.cardDark,
        'teal-dark': colors.tealDark,
        surface: colors.lightSurface,
        brand: colors.brandGreen,
        'green-medium': colors.greenMedium,
        'green-dark': colors.greenDark,
        link: colors.linkBlue,
        focus: colors.focusBlue,
        accent: colors.purple,
        muted: colors.mutedText,
        'border-active': colors.borderActive,
        'border-subtle': colors.borderSubtle,
        warning: colors.warning,
        danger: colors.danger,
      },
      borderRadius: { sm: `${radius.small}px`, md: `${radius.medium}px`, lg: `${radius.large}px`, pill: `${radius.pill}px` },
      fontFamily: { sans: [fontFamilies.sans], serif: [fontFamilies.serif], mono: [fontFamilies.mono] },
    },
  },
};

export default tailwindPreset;
