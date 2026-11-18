import { useOffer } from '@colheita/api-client';
import {
  MoneyText,
  PageSection,
  QualityGradeBadge,
  describeQualityGrade,
  WeightText,
} from '@colheita/ui-web';
import { Alert, Button, Image, InputNumber, message, Skeleton } from 'antd';
import { useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router';
import { useCart } from '../features/cart/hooks/use-cart';
import { capitalize } from '../utils/labels';

export function OfferPage() {
  const { offerId = '' } = useParams();
  const { data: offer, isLoading, error } = useOffer(offerId);
  const [boxes, setBoxes] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();

  if (isLoading)
    return (
      <PageSection>
        <Skeleton active />
      </PageSection>
    );
  if (error || !offer)
    return (
      <PageSection>
        <Alert type="error" message={error?.message ?? 'Oferta não encontrada'} />
      </PageSection>
    );

  return (
    <PageSection>
      <Link
        to="/mercado"
        className="mb-6 inline-flex items-center gap-2 text-green-dark! hover:underline"
      >
        <ArrowLeftOutlined /> Voltar para ofertas
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Image.PreviewGroup>
          <div className="grid grid-cols-2 gap-2">
            {offer.photoUrls.map((photoUrl, index) => (
              <Image
                key={photoUrl}
                src={photoUrl}
                alt={`Foto ${index + 1} do lote`}
                className="object-cover rounded-sm"
              />
            ))}
          </div>
        </Image.PreviewGroup>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold m-0">{capitalize(offer.crop)}</h1>
            <QualityGradeBadge grade={offer.grade} size="large" />
          </div>
          <p className="text-border-active mt-1">
            Classe {offer.grade}: {describeQualityGrade(offer.grade)} · classificado por foto
          </p>
          <p className="mt-4">
            Produzido por <strong>{offer.producerName}</strong> em {offer.city}/{offer.state}
          </p>
          <p className="text-2xl mt-4">
            <MoneyText value={offer.pricePerBox} strong />{' '}
            <span className="text-base">
              por caixa de <WeightText kilograms={offer.boxWeightKg} />
            </span>
          </p>
          <p className="text-sm text-border-active">{offer.availableBoxes} caixas disponíveis</p>
          <label htmlFor="offer-boxes" className="mt-6 block text-sm font-medium">
            Quantas caixas?
          </label>
          <div className="flex flex-wrap gap-3 mt-2">
            <InputNumber
              id="offer-boxes"
              size="large"
              min={1}
              max={offer.availableBoxes}
              value={boxes}
              onChange={(value) => setBoxes(value ?? 1)}
            />
            <Button
              type="primary"
              size="large"
              onClick={() => {
                addItem(offer, boxes);
                void message.success('Adicionado ao carrinho');
                navigate('/carrinho');
              }}
            >
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
