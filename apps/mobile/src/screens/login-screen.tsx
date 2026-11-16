import { useRequestOtp, useVerifyOtp } from '@colheita/api-client';
import { useState } from 'react';
import { Text } from 'react-native';
import { ErrorText } from '../components/error-text';
import { PrimaryButton } from '../components/primary-button';
import { ScreenContainer } from '../components/screen-container';
import { TextField } from '../components/text-field';
import {
  formatInternationalPhoneNumber,
  isCompleteBrazilianPhoneNumber,
  maskBrazilianPhoneNumber,
  toInternationalPhoneNumber,
} from '@colheita/contracts';

export function LoginScreen() {
  const [phoneInput, setPhoneInput] = useState('');
  const [code, setCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  return (
    <ScreenContainer title="Colheita Direta">
      <Text className="text-base text-border-active">
        Venda sua colheita direto, sem atravessador. Entre com seu celular: o código chega no
        WhatsApp.
      </Text>
      {!phoneNumber ? (
        <>
          <TextField
            label="Celular com DDD"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={15}
            value={phoneInput}
            onChangeText={(text) => setPhoneInput(maskBrazilianPhoneNumber(text))}
            placeholder="(11) 91234-5678"
          />
          <PrimaryButton
            title="Receber código"
            loading={requestOtp.isPending}
            disabled={!isCompleteBrazilianPhoneNumber(phoneInput)}
            onPress={() => {
              const internationalNumber = toInternationalPhoneNumber(phoneInput);
              requestOtp.mutate(internationalNumber, {
                onSuccess: () => setPhoneNumber(internationalNumber),
              });
            }}
          />
        </>
      ) : (
        <>
          <TextField
            label={`Código enviado para ${formatInternationalPhoneNumber(phoneNumber)}`}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
          <PrimaryButton
            title="Entrar"
            loading={verifyOtp.isPending}
            disabled={code.length !== 6}
            onPress={() => verifyOtp.mutate({ phoneNumber, code })}
          />
          <PrimaryButton
            title="Trocar número"
            variant="ghost"
            onPress={() => setPhoneNumber(null)}
          />
        </>
      )}
      <ErrorText error={requestOtp.error ?? verifyOtp.error} />
    </ScreenContainer>
  );
}
