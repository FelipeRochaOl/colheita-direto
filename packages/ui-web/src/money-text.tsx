const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatMoney(value: number): string {
  return currencyFormatter.format(value);
}

export function MoneyText({ value, strong = false }: { value: number; strong?: boolean }) {
  return <span style={{ fontWeight: strong ? 600 : undefined, whiteSpace: 'nowrap' }}>{formatMoney(value)}</span>;
}
