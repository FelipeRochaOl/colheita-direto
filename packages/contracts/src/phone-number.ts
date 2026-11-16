/** Telefone brasileiro: DDD (2 dígitos) + 8 (fixo) ou 9 (celular) dígitos. */
const MAX_NATIONAL_DIGITS = 11;

/** Só os dígitos nacionais. Remove o código do país (55) quando o número é colado com ele. */
export function extractNationalPhoneDigits(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.length > MAX_NATIONAL_DIGITS && digits.startsWith('55')) digits = digits.slice(2);
  return digits.slice(0, MAX_NATIONAL_DIGITS);
}

/**
 * Máscara enquanto a pessoa digita: "11912345678" → "(11) 91234-5678".
 * Com 10 dígitos usa o formato de fixo "(11) 3456-7890".
 */
export function maskBrazilianPhoneNumber(input: string): string {
  const digits = extractNationalPhoneDigits(input);
  const areaCode = digits.slice(0, 2);
  const subscriber = digits.slice(2);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${areaCode}`;
  if (subscriber.length <= 4) return `(${areaCode}) ${subscriber}`;
  const prefixLength = subscriber.length === 9 ? 5 : 4;
  return `(${areaCode}) ${subscriber.slice(0, prefixLength)}-${subscriber.slice(prefixLength)}`;
}

/** Número completo para digitar no campo (com DDD). */
export function isCompleteBrazilianPhoneNumber(input: string): boolean {
  const length = extractNationalPhoneDigits(input).length;
  return length === 10 || length === 11;
}

/** "(11) 91234-5678" → "+5511912345678" (formato aceito pela API). */
export function toInternationalPhoneNumber(input: string): string {
  return `+55${extractNationalPhoneDigits(input)}`;
}

/** "+5511912345678" → "+55 (11) 91234-5678", para exibir. */
export function formatInternationalPhoneNumber(internationalNumber: string): string {
  return `+55 ${maskBrazilianPhoneNumber(internationalNumber.replace(/^\+55/, ''))}`;
}
