import { Checkbox, Form } from 'antd';

export const PRIVACY_POLICY_VERSION = '2026-11';

/** Consentimento LGPD obrigatório em todo cadastro. */
export function PrivacyConsentField() {
  return (
    <Form.Item
      name="acceptedPrivacy"
      valuePropName="checked"
      rules={[
        {
          validator: (_, accepted) =>
            accepted
              ? Promise.resolve()
              : Promise.reject(new Error('É preciso aceitar para continuar')),
        },
      ]}
    >
      <Checkbox>
        Li e aceito os termos de uso e a política de privacidade. Meus dados são usados só para
        vendas, entregas e doações.
      </Checkbox>
    </Form.Item>
  );
}
