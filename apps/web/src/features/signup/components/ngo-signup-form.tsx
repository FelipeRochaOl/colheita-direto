import { useRegisterNgo, useUpdateMyNgoProfile } from '@colheita/api-client';
import type { GeoPoint, NgoProfile } from '@colheita/contracts';
import { Alert, Button, Form, Input, InputNumber } from 'antd';
import { LocationField } from './location-field';
import { PRIVACY_POLICY_VERSION, PrivacyConsentField } from './privacy-consent-field';

interface NgoSignupValues {
  name: string;
  document: string;
  address: string;
  location: GeoPoint;
  pickupRadiusKm: number;
}

/** Cadastro da ONG; com `profile` vira a edição de "Meus dados" (CNPJ não muda). */
export function NgoSignupForm({
  onRegistered,
  profile,
}: {
  onRegistered: () => void;
  profile?: NgoProfile;
}) {
  const registerNgo = useRegisterNgo();
  const updateProfile = useUpdateMyNgoProfile();
  const isEditing = Boolean(profile);
  const mutation = isEditing ? updateProfile : registerNgo;
  return (
    <Form<NgoSignupValues>
      layout="vertical"
      requiredMark={false}
      initialValues={profile ?? { pickupRadiusKm: 50 }}
      onFinish={({ document, ...values }) =>
        isEditing
          ? updateProfile.mutate(values, { onSuccess: onRegistered })
          : registerNgo.mutate(
              { ...values, document, acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION },
              { onSuccess: onRegistered },
            )
      }
    >
      {mutation.error && (
        <Alert type="error" showIcon message={mutation.error.message} className="mb-4!" />
      )}
      <Form.Item name="name" label="Nome da organização" rules={[{ required: true }]}>
        <Input size="large" />
      </Form.Item>
      <Form.Item
        name="document"
        label="CNPJ"
        rules={[{ required: true, min: 14 }]}
        extra={isEditing ? 'O CNPJ foi conferido na aprovação e não pode ser alterado aqui.' : undefined}
      >
        <Input size="large" disabled={isEditing} />
      </Form.Item>
      <Form.Item name="address" label="Endereço" rules={[{ required: true }]}>
        <Input size="large" />
      </Form.Item>
      <Form.Item
        name="location"
        label="Localização"
        rules={[{ required: true, message: 'Marque a localização' }]}
      >
        <LocationField label="Usar minha localização" />
      </Form.Item>
      <Form.Item name="pickupRadiusKm" label="Até quantos km vocês retiram">
        <InputNumber min={5} max={200} />
      </Form.Item>
      {!isEditing && <PrivacyConsentField />}
      <Button type="primary" htmlType="submit" size="large" loading={mutation.isPending}>
        {isEditing ? 'Salvar alterações' : 'Cadastrar organização'}
      </Button>
    </Form>
  );
}
