import { useRegisterServiceProvider } from '@colheita/api-client';
import type { GeoPoint, ServiceType } from '@colheita/contracts';
import { Alert, Button, Checkbox, Form, Input, InputNumber, Switch } from 'antd';
import { LocationField } from './location-field';
import { PRIVACY_POLICY_VERSION, PrivacyConsentField } from './privacy-consent-field';

const SERVICE_OPTIONS: Array<{ label: string; value: ServiceType }> = [
  { label: 'Transporte / frete', value: 'TRANSPORT' },
  { label: 'Câmara fria', value: 'COLD_STORAGE' },
  { label: 'Embalagem / beneficiamento', value: 'PACKING' },
  { label: 'Classificação presencial', value: 'GRADING' },
  { label: 'Assistência técnica', value: 'TECHNICAL_ASSISTANCE' },
];

interface ServiceProviderSignupValues {
  name: string;
  document: string;
  serviceTypes: ServiceType[];
  baseLocation: GeoPoint;
  serviceRadiusKm: number;
  vehicleCapacityKg?: number;
  hasRefrigeration: boolean;
}

export function ServiceProviderSignupForm({ onRegistered }: { onRegistered: () => void }) {
  const registerServiceProvider = useRegisterServiceProvider();
  return (
    <Form<ServiceProviderSignupValues>
      layout="vertical"
      requiredMark={false}
      initialValues={{ serviceRadiusKm: 50, hasRefrigeration: false }}
      onFinish={(values) =>
        registerServiceProvider.mutate(
          { ...values, acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION },
          { onSuccess: onRegistered },
        )
      }
    >
      {registerServiceProvider.error && (
        <Alert
          type="error"
          showIcon
          message={registerServiceProvider.error.message}
          className="mb-4!"
        />
      )}
      <Form.Item name="name" label="Nome ou empresa" rules={[{ required: true }]}>
        <Input size="large" />
      </Form.Item>
      <Form.Item name="document" label="CPF ou CNPJ" rules={[{ required: true, min: 11 }]}>
        <Input size="large" />
      </Form.Item>
      <Form.Item name="serviceTypes" label="Serviços que oferece" rules={[{ required: true }]}>
        <Checkbox.Group options={SERVICE_OPTIONS} className="flex! flex-col! gap-1" />
      </Form.Item>
      <Form.Item
        name="baseLocation"
        label="Base de operação"
        rules={[{ required: true, message: 'Marque a localização' }]}
      >
        <LocationField label="Usar minha localização" />
      </Form.Item>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="serviceRadiusKm" label="Raio de atendimento (km)">
          <InputNumber min={5} max={500} className="w-full!" />
        </Form.Item>
        <Form.Item name="vehicleCapacityKg" label="Capacidade do veículo (kg)">
          <InputNumber min={100} className="w-full!" />
        </Form.Item>
      </div>
      <Form.Item name="hasRefrigeration" label="Tem refrigeração" valuePropName="checked">
        <Switch />
      </Form.Item>
      <PrivacyConsentField />
      <Alert
        type="info"
        showIcon
        className="mb-4!"
        message="Depois do cadastro conferimos seus documentos antes de liberar pedidos."
      />
      <Button
        type="primary"
        htmlType="submit"
        size="large"
        loading={registerServiceProvider.isPending}
      >
        Criar perfil de prestador
      </Button>
    </Form>
  );
}
