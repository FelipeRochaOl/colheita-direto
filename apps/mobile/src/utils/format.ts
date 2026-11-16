const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatMoney(value: number): string {
  return currencyFormatter.format(value);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function toInternationalPhoneNumber(nationalNumber: string): string {
  return `+55${nationalNumber.replace(/\D/g, '')}`;
}
