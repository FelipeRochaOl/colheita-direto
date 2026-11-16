import { AnimatedNumber } from './animated-number';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatMoney(value: number): string {
  return currencyFormatter.format(value);
}

/** Valor em reais, com contagem animada (countup.js). */
export function MoneyText({
  value,
  strong = false,
  className,
}: {
  value: number;
  strong?: boolean;
  className?: string;
}) {
  return (
    <AnimatedNumber
      value={value}
      format={formatMoney}
      decimalPlaces={2}
      className={className}
      style={{ fontWeight: strong ? 600 : undefined }}
    />
  );
}
