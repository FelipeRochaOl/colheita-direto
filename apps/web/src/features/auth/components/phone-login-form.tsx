import { useRequestOtp, useVerifyOtp } from '@colheita/api-client';
import { Alert, Button, Form, Input } from 'antd';
import { useState } from 'react';
import { toInternationalPhoneNumber } from '../../../utils/phone-number';

/** Login sem senha: telefone → código de 6 dígitos (WhatsApp, ou SMS como alternativa). */
export function PhoneLoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  const handleRequestCode = ({ phone }: { phone: string }) => {
    const internationalNumber = toInternationalPhoneNumber(phone);
    requestOtp.mutate(internationalNumber, { onSuccess: () => setPhoneNumber(internationalNumber) });
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
            rules={[{ required: true, pattern: /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, message: 'Informe o celular com DDD' }]}
          >
            <Input size="large" inputMode="tel" placeholder="(11) 91234-5678" autoComplete="tel-national" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={requestOtp.isPending}>
            Receber código no WhatsApp
          </Button>
        </Form>
      ) : (
        <Form layout="vertical" onFinish={handleVerifyCode} requiredMark={false}>
          <p className="mb-4 text-sm">Enviamos um código para {phoneNumber}.</p>
          <Form.Item name="code" label="Código" rules={[{ required: true, len: 6, message: 'O código tem 6 dígitos' }]}>
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
