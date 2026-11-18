import { useUpdateMyServiceProviderProfile } from '@colheita/api-client';
import { SERVICE_PRICE_UNITS, SERVICE_TYPES } from '@colheita/contracts';
import type { GeoPoint, ServiceProviderProfile, ServiceType } from '@colheita/contracts';
import { Alert, Button, Card, Checkbox, Form, Input, InputNumber, Switch } from 'antd';
import { serviceTypeLabels, servicePriceUnitLabels } from '../../../utils/labels';
import { useState } from 'react';
import { LocationField } from '../../signup/components/location-field';

interface OfferingFields {
  enabled: boolean;
  price?: number;
  baseFee?: number;
  description?: string;
}

interface ServiceProviderProfileValues {
  name: string;
  document: string;
  baseLocation: GeoPoint;
  serviceRadiusKm: number;
  vehicleCapacityKg?: number | null;
  hasRefrigeration: boolean;
  services: Record<ServiceType, OfferingFields>;
}

function toFormValues(profile: ServiceProviderProfile): ServiceProviderProfileValues {
  const services = Object.fromEntries(
    SERVICE_TYPES.map((serviceType) => {
      const offering = profile.offerings.find((item) => item.serviceType === serviceType);
      return [serviceType, offering ? { enabled: true, ...offering } : { enabled: false }];
    }),
  ) as Record<ServiceType, OfferingFields>;
  return { ...profile, services };
}

/** "Meus serviços": o prestador escolhe o que oferece, quanto cobra e até onde atende. */
export function ServiceProviderProfileForm({
  profile,
  onSaved,
}: {
  profile: ServiceProviderProfile;
  onSaved: () => void;
}) {
  const updateProfile = useUpdateMyServiceProviderProfile();
  const [form] = Form.useForm<ServiceProviderProfileValues>();
  const services = Form.useWatch('services', form);
  const [missingOffering, setMissingOffering] = useState(false);

  const submit = ({ services: fields, document: _document, ...values }: ServiceProviderProfileValues) => {
    const offerings = SERVICE_TYPES.filter((serviceType) => fields?.[serviceType]?.enabled).map((serviceType) => ({
      serviceType,
      price: fields[serviceType].price!,
      baseFee: serviceType === 'TRANSPORT' ? (fields[serviceType].baseFee ?? 0) : 0,
      description: fields[serviceType].description?.trim() || undefined,
    }));
    setMissingOffering(!offerings.length);
    if (!offerings.length) return;
    updateProfile.mutate(
      { ...values, vehicleCapacityKg: values.vehicleCapacityKg ?? null, offerings },
      { onSuccess: onSaved },
    );
  };

  return (
    <Form<ServiceProviderProfileValues>
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={toFormValues(profile)}
      onFinish={submit}
    >
      {updateProfile.error && (
        <Alert type="error" showIcon message={updateProfile.error.message} className="mb-4!" />
      )}

      <h3 className="mt-0 mb-1 text-base font-semibold">Serviços e preços</h3>
      <p className="mt-0 mb-4 text-sm text-border-active">
        Marque o que você oferece. Os produtores da sua região veem esses valores e o preço estimado
        antes de contratar.
      </p>
      <div className="flex flex-col gap-3 mb-6">
        {SERVICE_TYPES.map((serviceType) => {
          const unit = servicePriceUnitLabels[SERVICE_PRICE_UNITS[serviceType]];
          const isEnabled = Boolean(services?.[serviceType]?.enabled);
          return (
            <Card key={serviceType} size="small">
              <Form.Item name={['services', serviceType, 'enabled']} valuePropName="checked" noStyle>
                <Checkbox>
                  <strong>{serviceTypeLabels[serviceType]}</strong>
                </Checkbox>
              </Form.Item>
              {isEnabled && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <Form.Item
                    name={['services', serviceType, 'price']}
                    label={`Preço (R$ ${unit.per})`}
                    rules={[{ required: true, message: 'Informe o preço' }]}
                  >
                    <InputNumber min={0.01} step={0.1} precision={2} prefix="R$" className="w-full!" />
                  </Form.Item>
                  {serviceType === 'TRANSPORT' && (
                    <Form.Item
                      name={['services', serviceType, 'baseFee']}
                      label="Taxa de saída (R$)"
                      tooltip="Valor fixo cobrado por viagem, somado aos km rodados."
                    >
                      <InputNumber min={0} step={1} precision={2} prefix="R$" className="w-full!" />
                    </Form.Item>
                  )}
                  <Form.Item
                    name={['services', serviceType, 'description']}
                    label="Detalhes (opcional)"
                    className="sm:col-span-2"
                  >
                    <Input maxLength={280} placeholder="Ex.: caminhão baú 3 t, atendo sábados" />
                  </Form.Item>
                </div>
              )}
            </Card>
          );
        })}
        {missingOffering && (
          <Alert type="error" showIcon role="alert" message="Marque ao menos um serviço e informe o preço." />
        )}
      </div>

      <h3 className="mt-0 mb-3 text-base font-semibold">Área de atendimento</h3>
      <Form.Item
        name="baseLocation"
        label="Base de operação"
        rules={[{ required: true, message: 'Marque a localização' }]}
      >
        <LocationField label="Usar minha localização" />
      </Form.Item>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Form.Item
          name="serviceRadiusKm"
          label="Raio de cobertura (km)"
          tooltip="Só aparecem para você produtores cuja fazenda está dentro desse raio."
          rules={[{ required: true }]}
        >
          <InputNumber min={5} max={500} className="w-full!" />
        </Form.Item>
        <Form.Item name="vehicleCapacityKg" label="Capacidade do veículo (kg)">
          <InputNumber min={100} className="w-full!" />
        </Form.Item>
      </div>
      <Form.Item name="hasRefrigeration" label="Tem refrigeração" valuePropName="checked">
        <Switch />
      </Form.Item>

      <h3 className="mt-0 mb-3 text-base font-semibold">Dados do prestador</h3>
      <Form.Item name="name" label="Nome ou empresa" rules={[{ required: true, min: 2 }]}>
        <Input size="large" />
      </Form.Item>
      <Form.Item name="document" label="CPF ou CNPJ" extra="Conferido na aprovação; não pode ser alterado aqui.">
        <Input size="large" disabled />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" loading={updateProfile.isPending}>
        Salvar e divulgar
      </Button>
    </Form>
  );
}
