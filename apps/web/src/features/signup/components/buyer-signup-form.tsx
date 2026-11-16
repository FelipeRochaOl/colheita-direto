import { useRegisterBuyer } from '@colheita/api-client';
import type { BuyerType, GeoPoint } from '@colheita/contracts';
import { Alert, Button, Form, Input, Select } from 'antd';
import { LocationField } from './location-field';
import { PRIVACY_POLICY_VERSION, PrivacyConsentField } from './privacy-consent-field';

const BUYER_TYPE_OPTIONS: Array<{ label: string; value: BuyerType }> = [
  { label: 'Consumidor (pessoa física)', value: 'CONSUMER' },
  { label: 'Restaurante', value: 'RESTAURANT' },
  { label: 'Mercado / sacolão', value: 'RETAIL' },
  { label: 'Indústria', value: 'INDUSTRY' },
  { label: 'Prefeitura / escola (PNAE)', value: 'PUBLIC_PROCUREMENT' },
];

interface BuyerSignupValues {
  name: string;
  buyerType: BuyerType;
  document: string;
  deliveryLocation: GeoPoint;
  deliveryAddress: string;
}

export function BuyerSignupForm({ onRegistered }: { onRegistered: () => void }) {
  const registerBuyer = useRegisterBuyer();
  return (
    <Form<BuyerSignupValues>
      layout="vertical"
      requiredMark={false}
      initialValues={{ buyerType: 'CONSUMER' }}
      onFinish={(values) =>
        registerBuyer.mutate({ ...values, acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION }, { onSuccess: onRegistered })
      }
    >
      {registerBuyer.error && <Alert type="error" showIcon message={registerBuyer.error.message} className="mb-4!" />}
      <Form.Item name="buyerType" label="Você compra como"><Select size="large" options={BUYER_TYPE_OPTIONS} /></Form.Item>
      <Form.Item name="name" label="Nome ou razão social" rules={[{ required: true }]}><Input size="large" /></Form.Item>
      <Form.Item name="document" label="CPF ou CNPJ" rules={[{ required: true, min: 11 }]}><Input size="large" inputMode="numeric" /></Form.Item>
      <Form.Item name="deliveryAddress" label="Endereço de entrega" rules={[{ required: true }]}><Input size="large" /></Form.Item>
      <Form.Item name="deliveryLocation" label="Ponto de entrega" rules={[{ required: true, message: 'Marque a localização' }]}>
        <LocationField label="Usar minha localização" />
      </Form.Item>
      <PrivacyConsentField />
      <Button type="primary" htmlType="submit" size="large" loading={registerBuyer.isPending}>Criar perfil de comprador</Button>
    </Form>
  );
}
