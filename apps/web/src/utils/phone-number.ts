/** "(11) 91234-5678" → "+5511912345678" */
export function toInternationalPhoneNumber(nationalNumber: string): string {
  return `+55${nationalNumber.replace(/\D/g, '')}`;
}
