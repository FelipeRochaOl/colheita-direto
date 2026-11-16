import { DeleteOutlined } from '@ant-design/icons';
import { useCreateOrder } from '@colheita/api-client';
import type { CreateOrderInput } from '@colheita/contracts';
import { MoneyText, PageSection } from '@colheita/ui-web';
import { Alert, Button, Card, Checkbox, Empty, InputNumber, Radio } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSession } from '../features/auth/hooks/use-session';
import { useCart } from '../features/cart/hooks/use-cart';
import { capitalize } from '../utils/labels';

export function CartPage() {
  const { items, productsTotal, updateBoxes, removeItem, clear } = useCart();
  const { session, hasRole } = useSession();
  const [deliveryMode, setDeliveryMode] = useState<CreateOrderInput['deliveryMode']>('PLATFORM_FREIGHT');
  const [extraServices, setExtraServices] = useState<CreateOrderInput['extraServices']>([]);
  const createOrder = useCreateOrder();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <PageSection title="Carrinho">
        <Empty description="Seu carrinho está vazio">
          <Button type="primary" onClick={() => navigate('/mercado')}>Ver ofertas</Button>
        </Empty>
      </PageSection>
    );
  }

  const handleCheckout = () => {
    if (!session) return navigate('/entrar?voltar=/carrinho');
    if (!hasRole('buyer')) return navigate('/cadastro?perfil=buyer');
    createOrder.mutate(
      { items: items.map((item) => ({ offerId: item.offer.id, boxes: item.boxes })), deliveryMode, extraServices },
      {
        onSuccess: () => {
          clear();
          navigate('/pedidos');
        },
      },
    );
  };

  return (
    <PageSection title="Carrinho">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-3">
          {items.map(({ offer, boxes }) => (
            <Card key={offer.id} size="small">
              <div className="flex items-center gap-4 flex-wrap">
                <img src={offer.photoUrls[0]} alt="" className="w-16 h-16 object-cover rounded-sm" />
                <div className="flex-1 min-w-40">
                  <div className="font-semibold">{capitalize(offer.crop)} · classe {offer.grade}</div>
                  <div className="text-sm">{offer.producerName}</div>
                </div>
                <InputNumber min={1} max={offer.availableBoxes} value={boxes} onChange={(value) => updateBoxes(offer.id, value ?? 1)} addonAfter="cx" />
                <MoneyText value={boxes * offer.pricePerBox} strong />
                <Button type="text" icon={<DeleteOutlined />} aria-label="Remover" onClick={() => removeItem(offer.id)} />
              </div>
            </Card>
          ))}
        </div>
        <Card title="Entrega e pagamento">
          <Radio.Group value={deliveryMode} onChange={(event) => setDeliveryMode(event.target.value)} className="flex! flex-col! gap-2">
            <Radio value="PLATFORM_FREIGHT">Frete com transportador da região</Radio>
            <Radio value="PRODUCER_DELIVERY">O produtor entrega</Radio>
            <Radio value="PICKUP">Retiro no sítio</Radio>
          </Radio.Group>
          <Checkbox.Group
            className="mt-4! flex! flex-col! gap-1"
            value={extraServices}
            onChange={(values) => setExtraServices(values as CreateOrderInput['extraServices'])}
            options={[
              { label: 'Câmara fria até a entrega', value: 'COLD_STORAGE' },
              { label: 'Embalagem para revenda', value: 'PACKING' },
            ]}
          />
          <div className="mt-6 flex justify-between text-lg">
            <span>Produtos</span>
            <MoneyText value={productsTotal} strong />
          </div>
          <p className="text-sm text-border-active">Frete e serviços são calculados ao fechar o pedido.</p>
          {createOrder.error && <Alert type="error" showIcon message={createOrder.error.message} className="mt-4!" />}
          <Button type="primary" size="large" block className="mt-4!" loading={createOrder.isPending} onClick={handleCheckout}>
            Fechar pedido e pagar com Pix
          </Button>
        </Card>
      </div>
    </PageSection>
  );
}
