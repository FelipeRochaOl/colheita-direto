import type { Offer } from '@colheita/contracts';
import { MoneyText, QualityGradeBadge } from '@colheita/ui-web';
import { Card } from 'antd';
import { Link } from 'react-router';
import { capitalize } from '../../../utils/labels';

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <Link to={`/mercado/${offer.id}`} className="block h-full">
      <Card
        hoverable
        className="h-full"
        cover={
          <img
            src={offer.photoUrls[0]}
            alt={`${offer.crop} de ${offer.producerName}`}
            className="h-44 object-cover bg-surface"
            loading="lazy"
          />
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{capitalize(offer.crop)}</div>
            <div className="text-sm text-border-active">{offer.producerName}</div>
            <div className="text-sm text-border-active">
              {offer.city}/{offer.state}
              {offer.distanceKm !== null && ` · ${offer.distanceKm} km`}
            </div>
          </div>
          <QualityGradeBadge grade={offer.grade} />
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span>
            <MoneyText value={offer.pricePerBox} strong /> <span className="text-sm">/ caixa {offer.boxWeightKg} kg</span>
          </span>
          <span className="text-sm text-border-active">{offer.availableBoxes} cx</span>
        </div>
      </Card>
    </Link>
  );
}
