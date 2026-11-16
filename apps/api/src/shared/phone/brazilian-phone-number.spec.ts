import { brazilianPhoneNumberVariants } from './brazilian-phone-number';

describe('brazilianPhoneNumberVariants', () => {
  it('número do WhatsApp sem o 9º dígito também procura a forma completa', () => {
    expect(brazilianPhoneNumberVariants('+551191111001')).toEqual(['+5511991111001', '+551191111001']);
  });

  it('número completo também procura a forma sem o 9', () => {
    expect(brazilianPhoneNumberVariants('+5511991111001')).toEqual(['+5511991111001', '+551191111001']);
  });
});
