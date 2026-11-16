/**
 * O WhatsApp às vezes identifica celulares brasileiros sem o 9º dígito (+55 DD 8 dígitos).
 * Devolve as duas formas para achar o cadastro feito com o número completo.
 */
export function brazilianPhoneNumberVariants(phoneNumber: string): string[] {
  const digits = phoneNumber.replace(/\D/g, '');
  if (!digits.startsWith('55')) return [phoneNumber];
  const areaCode = digits.slice(2, 4);
  const localNumber = digits.slice(4);
  if (localNumber.length === 8) return [`+55${areaCode}9${localNumber}`, phoneNumber];
  if (localNumber.length === 9 && localNumber.startsWith('9')) {
    return [phoneNumber, `+55${areaCode}${localNumber.slice(1)}`];
  }
  return [phoneNumber];
}
