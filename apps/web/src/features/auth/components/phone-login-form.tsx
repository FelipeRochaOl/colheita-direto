import { useRequestOtp, useVerifyOtp } from '@colheita/api-client';
import { Alert, Button, Form, Input } from 'antd';
import { useState } from 'react';
import type { AuthSession } from '@colheita/contracts';
import {
  formatInternationalPhoneNumber,
  isCompleteBrazilianPhoneNumber,
  maskBrazilianPhoneNumber,
  toInternationalPhoneNumber,
} from '@colheita/contracts';

/** Login sem senha: telefone → código de 6 dígitos (WhatsApp, ou SMS como alternativa). */
export function PhoneLoginForm({ onLoggedIn }: { onLoggedIn: (session: AuthSession) => void }) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  const handleRequestCode = ({ phone }: { phone: string }) => {
    const internationalNumber = toInternationalPhoneNumber(phone);
    requestOtp.mutate(internationalNumber, {
      onSuccess: () => setPhoneNumber(internationalNumber),
    });
  };

  const handleVerifyCode = ({ code }: { code: string }) => {
    verifyOtp.mutate({ phoneNumber: phoneNumber!, code }, { onSuccess: onLoggedIn });
  };

  const error = requestOtp.error ?? verifyOtp.error;

  return (
    <div className="max-w-sm">
      {error && <Alert type="error" showIcon message={error.message} className="mb-4!" />}
      {!phoneNumber ? (
        <Form layout="vertical" onFinish={handleRequestCode} requiredMark={false}>
          <Form.Item
            name="phone"
            label="Celular com DDD"
            normalize={maskBrazilianPhoneNumber}
            rules={[
              { required: true, message: 'Informe o celular com DDD' },
              {
                validator: (_, value: string | undefined) =>
                  !value || isCompleteBrazilianPhoneNumber(value)
                    ? Promise.resolve()
                    : Promise.reject(new Error('Número incompleto: DDD + 8 ou 9 dígitos')),
              },
            ]}
          >
            <Input
              size="large"
              inputMode="tel"
              placeholder="(11) 91234-5678"
              autoComplete="tel-national"
              maxLength={15}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={requestOtp.isPending}
          >
            Receber código no WhatsApp
          </Button>
        </Form>
      ) : (
        <Form layout="vertical" onFinish={handleVerifyCode} requiredMark={false}>
          <p className="mb-4 text-sm">
            Enviamos um código para {formatInternationalPhoneNumber(phoneNumber)}.
          </p>
          <Form.Item
            name="code"
            label="Código"
            rules={[{ required: true, len: 6, message: 'O código tem 6 dígitos' }]}
          >
            <Input.OTP size="large" length={6} />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={verifyOtp.isPending}>
            Entrar
          </Button>
          <Button type="link" block onClick={() => setPhoneNumber(null)}>
            Trocar número
          </Button>
        </Form>
      )}
    </div>
  );
}
