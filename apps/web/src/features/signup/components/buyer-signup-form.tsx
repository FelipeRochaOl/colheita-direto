import { useRegisterBuyer, useUpdateMyBuyerProfile } from '@colheita/api-client';
import type { BuyerProfile, BuyerType, GeoPoint } from '@colheita/contracts';
import { Alert, Button, Form, Input, Select } from 'antd';
import { LocationField } from './location-field';
import { PRIVACY_POLICY_VERSION, PrivacyConsentField } from './privacy-consent-field';

const BUYER_TYPE_OPTIONS: Array<{ label: string; value: BuyerType }> = [
  { label: 'Consumidor (pessoa física)', value: 'CONSUMER' },
  { label: 'Restaurante', value: 'RESTAURANT' },
  { label: 'Mercado / sacolão', value: 'RETAIL' },
  { label: 'Indústria', value: 'INDUSTRY' },
  { label: 'Prefeitura / escola (PNAE)', value: 'PUBLIC_PROCUREMENT' },
];

interface BuyerSignupValues {
  name: string;
  buyerType: BuyerType;
  document: string;
  deliveryLocation: GeoPoint;
  deliveryAddress: string;
}

/** Cadastro do comprador; com `profile` vira a edição de "Meus dados" (documento não muda). */
export function BuyerSignupForm({
  onRegistered,
  profile,
}: {
  onRegistered: () => void;
  profile?: BuyerProfile;
}) {
  const registerBuyer = useRegisterBuyer();
  const updateProfile = useUpdateMyBuyerProfile();
  const isEditing = Boolean(profile);
  const mutation = isEditing ? updateProfile : registerBuyer;
  return (
    <Form<BuyerSignupValues>
      layout="vertical"
      requiredMark={false}
      initialValues={profile ?? { buyerType: 'CONSUMER' }}
      onFinish={({ document, ...values }) =>
        isEditing
          ? updateProfile.mutate(values, { onSuccess: onRegistered })
          : registerBuyer.mutate(
              { ...values, document, acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION },
              { onSuccess: onRegistered },
            )
      }
    >
      {mutation.error && (
        <Alert type="error" showIcon message={mutation.error.message} className="mb-4!" />
      )}
      <Form.Item name="buyerType" label="Você compra como">
        <Select size="large" options={BUYER_TYPE_OPTIONS} />
      </Form.Item>
      <Form.Item name="name" label="Nome ou razão social" rules={[{ required: true }]}>
        <Input size="large" />
      </Form.Item>
      <Form.Item
        name="document"
        label="CPF ou CNPJ"
        rules={[{ required: true, min: 11 }]}
        extra={isEditing ? 'Para trocar o documento, fale com o suporte.' : undefined}
      >
        <Input size="large" inputMode="numeric" disabled={isEditing} />
      </Form.Item>
      <Form.Item name="deliveryAddress" label="Endereço de entrega" rules={[{ required: true }]}>
        <Input size="large" />
      </Form.Item>
      <Form.Item
        name="deliveryLocation"
        label="Ponto de entrega"
        rules={[{ required: true, message: 'Marque a localização' }]}
      >
        <LocationField label="Usar minha localização" />
      </Form.Item>
      {!isEditing && <PrivacyConsentField />}
      <Button type="primary" htmlType="submit" size="large" loading={mutation.isPending}>
        {isEditing ? 'Salvar alterações' : 'Criar perfil de comprador'}
      </Button>
    </Form>
  );
}
