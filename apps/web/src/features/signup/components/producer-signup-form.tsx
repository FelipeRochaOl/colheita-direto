import { useRegisterProducer } from '@colheita/api-client';
import type { GeoPoint } from '@colheita/contracts';
import { Alert, Button, Form, Input, Select } from 'antd';
import { LocationField } from './location-field';
import { PRIVACY_POLICY_VERSION, PrivacyConsentField } from './privacy-consent-field';

interface ProducerSignupValues {
  name: string;
  farmName: string;
  farmLocation: GeoPoint;
  city: string;
  state: string;
  crops: string[];
  familyFarmRegistration?: string;
}

export function ProducerSignupForm({ onRegistered }: { onRegistered: () => void }) {
  const registerProducer = useRegisterProducer();
  return (
    <Form<ProducerSignupValues>
      layout="vertical"
      requiredMark={false}
      onFinish={(values) =>
        registerProducer.mutate(
          { ...values, acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION },
          { onSuccess: onRegistered },
        )
      }
    >
      {registerProducer.error && (
        <Alert type="error" showIcon message={registerProducer.error.message} className="mb-4!" />
      )}
      <Form.Item name="name" label="Seu nome" rules={[{ required: true }]}>
        <Input size="large" />
      </Form.Item>
      <Form.Item name="farmName" label="Nome do sítio ou fazenda" rules={[{ required: true }]}>
        <Input size="large" />
      </Form.Item>
      <div className="grid grid-cols-3 gap-4">
        <Form.Item name="city" label="Cidade" className="col-span-2" rules={[{ required: true }]}>
          <Input size="large" />
        </Form.Item>
        <Form.Item name="state" label="UF" rules={[{ required: true, len: 2 }]}>
          <Input size="large" maxLength={2} />
        </Form.Item>
      </div>
      <Form.Item
        name="farmLocation"
        label="Localização da propriedade"
        rules={[{ required: true, message: 'Use o botão para marcar a localização' }]}
      >
        <LocationField label="Estou na propriedade" />
      </Form.Item>
      <Form.Item name="crops" label="O que você planta" rules={[{ required: true }]}>
        <Select mode="tags" size="large" placeholder="tomate, alface, banana…" />
      </Form.Item>
      <Form.Item
        name="familyFarmRegistration"
        label="CAF (opcional, para vender à merenda escolar)"
      >
        <Input size="large" />
      </Form.Item>
      <PrivacyConsentField />
      <Button type="primary" htmlType="submit" size="large" loading={registerProducer.isPending}>
        Criar perfil de produtor
      </Button>
    </Form>
  );
}
