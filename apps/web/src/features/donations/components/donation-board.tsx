import { useAcceptDonation, useConfirmDonationReceipt, useDonations } from '@colheita/api-client';
import type { Donation } from '@colheita/contracts';
import { Alert, Button, Card, Empty, InputNumber, Skeleton, Tag } from 'antd';
import { useState } from 'react';
import { capitalize, donationStatusLabels } from '../../../utils/labels';

function ReceiptConfirmation({ donation }: { donation: Donation }) {
  const [receivedWeightKg, setReceivedWeightKg] = useState<number | null>(Math.round(donation.estimatedWeightKg));
  const confirmReceipt = useConfirmDonationReceipt();
  return (
    <div className="flex gap-2 items-center flex-wrap">
      <InputNumber addonAfter="kg recebidos" min={1} value={receivedWeightKg} onChange={setReceivedWeightKg} />
      <Button
        type="primary"
        loading={confirmReceipt.isPending}
        disabled={!receivedWeightKg}
        onClick={() => confirmReceipt.mutate({ donationId: donation.id, receivedWeightKg: receivedWeightKg! })}
      >
        Confirmar recebimento
      </Button>
    </div>
  );
}

function DonationCard({ donation, action }: { donation: Donation; action?: React.ReactNode }) {
  return (
    <Card>
      <div className="flex justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold">
            {donation.quantityBoxes} cx de {capitalize(donation.crop)} (~{Math.round(donation.estimatedWeightKg)} kg)
          </div>
          <div className="text-sm">Produtor: {donation.producerName}</div>
        </div>
        <Tag color="green">{donationStatusLabels[donation.status]}</Tag>
      </div>
      {action && <div className="mt-3">{action}</div>}
    </Card>
  );
}

export function DonationBoard() {
  const { data: board, isLoading, error } = useDonations();
  const acceptDonation = useAcceptDonation();

  if (isLoading) return <Skeleton active />;
  if (error) return <Alert type="error" message={error.message} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-3">Disponíveis perto de vocês</h2>
        {board?.available.length ? (
          <div className="flex flex-col gap-3">
            {board.available.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                action={
                  <Button type="primary" loading={acceptDonation.isPending} onClick={() => acceptDonation.mutate(donation.id)}>
                    Aceitar e combinar retirada
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <Empty description="Nenhuma doação disponível agora. Avisamos pelo WhatsApp quando surgir." />
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">Aceitas por vocês</h2>
        {board?.accepted.length ? (
          <div className="flex flex-col gap-3">
            {board.accepted.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                action={donation.status === 'ACCEPTED' ? <ReceiptConfirmation donation={donation} /> : undefined}
              />
            ))}
          </div>
        ) : (
          <Empty description="Nada por aqui ainda" />
        )}
      </div>
    </div>
  );
}
