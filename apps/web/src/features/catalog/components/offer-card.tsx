import { EnvironmentOutlined } from '@ant-design/icons';
import type { Offer } from '@colheita/contracts';
import { describeQualityGrade, MoneyText, QualityGradeBadge, WeightText } from '@colheita/ui-web';
import { Link } from 'react-router';
import { capitalize } from '../../../utils/labels';

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <Link
      to={`/mercado/${offer.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white text-evergreen! ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(0,30,43,0.35)]"
    >
      <div className="relative h-48 overflow-hidden bg-mint">
        <img
          src={offer.photoUrls[0]}
          alt={`${offer.crop} de ${offer.producerName}`}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 py-1 pl-1 pr-3 text-xs font-semibold shadow-sm">
          <QualityGradeBadge grade={offer.grade} />
          {describeQualityGrade(offer.grade)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="font-serif text-2xl leading-tight">{capitalize(offer.crop)}</div>
        <div className="mt-1 text-sm text-border-active">{offer.producerName}</div>
        <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-border-active">
          <EnvironmentOutlined />
          {offer.city}/{offer.state}
          {offer.distanceKm !== null && ` · ${offer.distanceKm} km`}
        </div>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <span className="font-serif text-2xl text-green-dark">
              <MoneyText value={offer.pricePerBox} />
            </span>
            <span className="ml-1 text-sm text-border-active">
              / caixa <WeightText kilograms={offer.boxWeightKg} />
            </span>
          </div>
          <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-green-dark">
            {offer.availableBoxes} cx
          </span>
        </div>
      </div>
    </Link>
  );
}
