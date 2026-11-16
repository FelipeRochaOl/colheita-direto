import { colors, radius } from '@colheita/design-tokens';
import { ReactNode } from 'react';

/** Cartão de indicador (KPI), no estilo "Stat Card" do design system: fundo teal escuro. */
export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div
      style={{
        backgroundColor: colors.tealDark,
        borderRadius: radius.medium,
        padding: 24,
        color: colors.white,
        border: `1px solid ${colors.greenDark}`,
      }}
    >
      <div style={{ color: colors.mutedText, fontSize: 14 }}>{label}</div>
      <div style={{ color: colors.brandGreen, fontSize: 32, fontWeight: 600, marginTop: 8 }}>{value}</div>
      {hint && <div style={{ color: colors.mutedText, fontSize: 12, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
