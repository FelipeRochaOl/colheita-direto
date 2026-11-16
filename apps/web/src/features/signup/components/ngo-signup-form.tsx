import { useRegisterNgo } from '@colheita/api-client';
import type { GeoPoint } from '@colheita/contracts';
import { Alert, Button, Form, Input, InputNumber } from 'antd';
import { LocationField } from './location-field';
import { PRIVACY_POLICY_VERSION, PrivacyConsentField } from './privacy-consent-field';

interface NgoSignupValues {
  name: string;
  document: string;
  address: string;
  location: GeoPoint;
  pickupRadiusKm: number;
}

export function NgoSignupForm({ onRegistered }: { onRegistered: () => void }) {
  const registerNgo = useRegisterNgo();
  return (
    <Form<NgoSignupValues>
      layout="vertical"
      requiredMark={false}
      initialValues={{ pickupRadiusKm: 50 }}
      onFinish={(values) =>
        registerNgo.mutate({ ...values, acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION }, { onSuccess: onRegistered })
      }
    >
      {registerNgo.error && <Alert type="error" showIcon message={registerNgo.error.message} className="mb-4!" />}
      <Form.Item name="name" label="Nome da organização" rules={[{ required: true }]}><Input size="large" /></Form.Item>
      <Form.Item name="document" label="CNPJ" rules={[{ required: true, min: 14 }]}><Input size="large" /></Form.Item>
      <Form.Item name="address" label="Endereço" rules={[{ required: true }]}><Input size="large" /></Form.Item>
      <Form.Item name="location" label="Localização" rules={[{ required: true, message: 'Marque a localização' }]}>
        <LocationField label="Usar minha localização" />
      </Form.Item>
      <Form.Item name="pickupRadiusKm" label="Até quantos km vocês retiram"><InputNumber min={5} max={200} /></Form.Item>
      <PrivacyConsentField />
      <Button type="primary" htmlType="submit" size="large" loading={registerNgo.isPending}>Cadastrar organização</Button>
    </Form>
  );
}
