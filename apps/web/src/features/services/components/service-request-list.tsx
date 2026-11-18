import { SERVICE_PRICE_UNITS, formatInternationalPhoneNumber } from '@colheita/contracts';
import type { ServiceRequest } from '@colheita/contracts';
import { MoneyText } from '@colheita/ui-web';
import { Button, Card, Empty, Tag } from 'antd';
import { serviceRequestStatusLabels, servicePriceUnitLabels, serviceTypeLabels } from '../../../utils/labels';

const STATUS_COLORS = { REQUESTED: 'orange', ACCEPTED: 'green', DECLINED: 'default' } as const;

interface ServiceRequestListProps {
  serviceRequests: ServiceRequest[];
  perspective: 'producer' | 'service_provider';
  onRespond?: (serviceRequestId: string, accept: boolean) => void;
  pendingServiceRequestId?: string | null;
}

/** Solicitações de serviço vistas pelo produtor (enviadas) ou pelo prestador (recebidas). */
export function ServiceRequestList({
  serviceRequests,
  perspective,
  onRespond,
  pendingServiceRequestId,
}: ServiceRequestListProps) {
  if (!serviceRequests.length) return <Empty description="Nenhuma solicitação ainda" />;
  return (
    <div className="flex flex-col gap-4">
      {serviceRequests.map((request) => {
        const unit = servicePriceUnitLabels[SERVICE_PRICE_UNITS[request.serviceType]];
        const counterpart = perspective === 'producer' ? request.serviceProviderName : request.producerName;
        return (
          <Card
            key={request.id}
            title={`${serviceTypeLabels[request.serviceType]} · ${counterpart}`}
            extra={<Tag color={STATUS_COLORS[request.status]}>{serviceRequestStatusLabels[request.status]}</Tag>}
          >
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-2">
              <span>
                {unit.quantity}: <strong>{request.quantity}</strong>
              </span>
              <span>
                Estimativa: <MoneyText value={request.estimatedTotal} strong />
              </span>
              {request.scheduledFor && (
                <span>Para: {new Date(`${request.scheduledFor}T12:00:00`).toLocaleDateString('pt-BR')}</span>
              )}
              <span>Enviada em {new Date(request.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            {request.notes && <p className="text-sm mb-2">“{request.notes}”</p>}
            {perspective === 'service_provider' && (
              <a
                className="text-sm"
                href={`https://www.google.com/maps?q=${request.pickupLocation.latitude},${request.pickupLocation.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                Ver local da fazenda no mapa
              </a>
            )}
            {request.counterpartPhoneNumber && (
              <p className="text-sm mt-2 mb-0">
                Combine os detalhes e o pagamento pelo celular{' '}
                <a href={`https://wa.me/${request.counterpartPhoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                  {formatInternationalPhoneNumber(request.counterpartPhoneNumber)}
                </a>
              </p>
            )}
            {perspective === 'service_provider' && request.status === 'REQUESTED' && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  type="primary"
                  loading={pendingServiceRequestId === request.id}
                  onClick={() => onRespond?.(request.id, true)}
                >
                  Aceitar
                </Button>
                <Button
                  disabled={pendingServiceRequestId === request.id}
                  onClick={() => onRespond?.(request.id, false)}
                >
                  Recusar
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
