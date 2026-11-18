import {
  useAvailableServiceProviders,
  useCreateServiceRequest,
  useServiceRequests,
} from '@colheita/api-client';
import { SERVICE_PRICE_UNITS, SERVICE_TYPES } from '@colheita/contracts';
import type { AvailableServiceProvider, ServiceType } from '@colheita/contracts';
import { MoneyText } from '@colheita/ui-web';
import { Alert, Button, Card, Empty, Form, Input, InputNumber, Modal, Select, Skeleton, Tag } from 'antd';
import { useState } from 'react';
import { serviceTypeLabels, servicePriceUnitLabels } from '../../../utils/labels';
import { ServiceRequestList } from './service-request-list';

const DEFAULT_QUANTITY = { KM: 20, BOX_DAY: 20, BOX: 20, VISIT: 1 } as const;

interface RequestFormValues {
  scheduledFor?: string;
  notes?: string;
}

/** Produtor: escolhe o serviço, vê quem atende a fazenda com preço estimado e envia a solicitação. */
export function HireServicePanel() {
  const [serviceType, setServiceType] = useState<ServiceType>('TRANSPORT');
  const [quantity, setQuantity] = useState<number>(20);
  const [selected, setSelected] = useState<AvailableServiceProvider | null>(null);
  const [form] = Form.useForm<RequestFormValues>();
  const unit = servicePriceUnitLabels[SERVICE_PRICE_UNITS[serviceType]];

  const available = useAvailableServiceProviders(quantity > 0 ? { serviceType, quantity } : null);
  const serviceRequests = useServiceRequests();
  const createRequest = useCreateServiceRequest();

  const closeModal = () => {
    setSelected(null);
    form.resetFields();
    createRequest.reset();
  };

  const sendRequest = ({ scheduledFor, notes }: RequestFormValues) =>
    selected &&
    createRequest.mutate(
      {
        serviceProviderId: selected.serviceProviderId,
        serviceType,
        quantity,
        scheduledFor: scheduledFor || undefined,
        notes: notes?.trim() || undefined,
      },
      { onSuccess: closeModal },
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <section aria-labelledby="hire-title" className="lg:col-span-3 flex flex-col gap-4">
        <h2 id="hire-title" className="m-0 text-lg font-semibold">
          Contratar serviço
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Serviço
            <Select<ServiceType>
              aria-label="Serviço"
              size="large"
              value={serviceType}
              onChange={(type) => {
                setServiceType(type);
                // Quantidade típica de cada unidade: km da viagem, caixas ou uma visita
                setQuantity(DEFAULT_QUANTITY[SERVICE_PRICE_UNITS[type]]);
              }}
              options={SERVICE_TYPES.map((type) => ({ value: type, label: serviceTypeLabels[type] }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {unit.quantity}
            <InputNumber
              aria-label={unit.quantity}
              size="large"
              min={1}
              max={100000}
              value={quantity}
              onChange={(value) => setQuantity(value ?? 0)}
              className="w-full!"
            />
          </label>
        </div>
        {available.isLoading && <Skeleton active />}
        {available.error && <Alert type="error" showIcon message={available.error.message} />}
        {available.data && !available.data.length && (
          <Empty description="Ainda não há prestador aprovado atendendo sua fazenda para este serviço." />
        )}
        {available.data?.map((provider) => (
          <Card key={provider.serviceProviderId} size="small">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <strong>{provider.name}</strong>
                <span className="text-sm text-border-active">
                  {provider.distanceKm} km de você · atende até {provider.serviceRadiusKm} km
                  {provider.vehicleCapacityKg ? ` · ${provider.vehicleCapacityKg} kg` : ''}
                </span>
                <span className="text-sm">
                  <MoneyText value={provider.price} /> {unit.per}
                  {provider.baseFee > 0 && (
                    <>
                      {' '}+ <MoneyText value={provider.baseFee} /> de saída
                    </>
                  )}
                </span>
                {provider.description && <span className="text-sm">{provider.description}</span>}
                {provider.hasRefrigeration && <Tag color="blue">Refrigerado</Tag>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm">
                  Estimativa: <MoneyText value={provider.estimatedTotal} strong />
                </span>
                <Button type="primary" onClick={() => setSelected(provider)}>
                  Solicitar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section aria-labelledby="my-requests-title" className="lg:col-span-2 flex flex-col gap-4">
        <h2 id="my-requests-title" className="m-0 text-lg font-semibold">
          Minhas solicitações
        </h2>
        {serviceRequests.isLoading ? (
          <Skeleton active />
        ) : (
          <ServiceRequestList serviceRequests={serviceRequests.data?.sent ?? []} perspective="producer" />
        )}
      </section>

      <Modal
        open={Boolean(selected)}
        title={selected ? `Solicitar ${serviceTypeLabels[serviceType].toLowerCase()} · ${selected.name}` : ''}
        okText="Enviar solicitação"
        cancelText="Cancelar"
        confirmLoading={createRequest.isPending}
        onOk={() => form.submit()}
        onCancel={closeModal}
        destroyOnHidden
      >
        {selected && (
          <Form<RequestFormValues> form={form} layout="vertical" onFinish={sendRequest}>
            {createRequest.error && (
              <Alert type="error" showIcon message={createRequest.error.message} className="mb-4!" />
            )}
            <p>
              {unit.quantity}: <strong>{quantity}</strong> · Estimativa:{' '}
              <MoneyText value={selected.estimatedTotal} strong />
            </p>
            <Form.Item name="scheduledFor" label="Para quando (opcional)">
              <Input type="date" min={new Date().toISOString().slice(0, 10)} />
            </Form.Item>
            <Form.Item name="notes" label="Detalhes (opcional)">
              <Input.TextArea maxLength={500} rows={3} placeholder="Ex.: 40 caixas de tomate até o CEASA" />
            </Form.Item>
            <p className="text-sm text-border-active mb-0">
              O prestador aceita ou recusa. Depois do aceite, vocês combinam o pagamento pelo celular.
            </p>
          </Form>
        )}
      </Modal>
    </div>
  );
}
