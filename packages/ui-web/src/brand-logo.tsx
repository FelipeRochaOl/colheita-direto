import { colors, fontFamilies } from '@colheita/design-tokens';
import { useId } from 'react';

/** Símbolo da marca: broto com duas folhas nascendo do campo, num quadrado verde com gradiente. */
export function BrandMark({ size = 32 }: { size?: number }) {
  const gradientId = `brand-mark-gradient-${useId()}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={colors.brandGreen} />
          <stop offset="1" stopColor={colors.greenMedium} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      {/* Caule */}
      <path
        d="M16 24.6C16 21 16 18.4 16.4 15.6"
        stroke={colors.evergreenDark}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Folhas */}
      <path
        d="M16.2 19.4C10.6 19.6 7.4 16.2 7.2 10.8C12.6 10.6 16 13.8 16.2 19.4Z"
        fill={colors.evergreenDark}
      />
      <path
        d="M16.4 16.2C16.2 10.4 19.4 6.8 25 6.6C25.2 12.2 22 15.8 16.4 16.2Z"
        fill={colors.evergreenDark}
      />
      {/* Nervuras */}
      <path
        d="M15.2 18.4L10.2 13.2"
        stroke={colors.brandGreen}
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M17.4 15.2L22.6 9.2"
        stroke={colors.brandGreen}
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Campo */}
      <path
        d="M8.4 25.4Q16 22.4 23.6 25.4"
        stroke={colors.evergreenDark}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Logo completo (símbolo + nome). `tone="light"` para fundos escuros. */
export function BrandLogo({
  tone = 'light',
  size = 32,
}: {
  tone?: 'light' | 'dark';
  size?: number;
}) {
  const nameColor = tone === 'light' ? colors.white : colors.evergreenDark;
  const accentColor = tone === 'light' ? colors.brandGreen : colors.greenDark;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.34 }}>
      <BrandMark size={size} />
      <span
        style={{
          fontFamily: fontFamilies.sans,
          fontSize: size * 0.62,
          lineHeight: 1,
          letterSpacing: '-0.035em',
          whiteSpace: 'nowrap',
          color: nameColor,
        }}
      >
        <span style={{ fontWeight: 700 }}>colheita</span>
        <span style={{ fontWeight: 300, color: accentColor }}>direta</span>
      </span>
    </span>
  );
}
