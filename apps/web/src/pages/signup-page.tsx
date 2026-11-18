import type { UserRole } from '@colheita/contracts';
import { PageSection } from '@colheita/ui-web';
import { Alert, Button, Tabs } from 'antd';
import type { ReactNode } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { useSession } from '../features/auth/hooks/use-session';
import { BuyerSignupForm } from '../features/signup/components/buyer-signup-form';
import { NgoSignupForm } from '../features/signup/components/ngo-signup-form';
import { ProducerSignupForm } from '../features/signup/components/producer-signup-form';
import { ServiceProviderSignupForm } from '../features/signup/components/service-provider-signup-form';
import { HOME_BY_ROLE } from '../utils/role-home';

export function SignupPage() {
  const { session, isLoading, hasRole } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedRole = (searchParams.get('perfil') as UserRole) ?? 'producer';

  if (!isLoading && !session)
    return <Navigate to={`/entrar?voltar=/cadastro?perfil=${selectedRole}`} replace />;

  const goHome = (role: UserRole) => () => navigate(HOME_BY_ROLE[role] ?? '/');
  // Quem já tem o perfil vê um atalho para a área, e não o formulário de novo
  const formOrShortcut = (role: UserRole, form: ReactNode) =>
    hasRole(role) ? (
      <Alert
        type="success"
        showIcon
        message="Você já tem este perfil."
        action={
          <Button type="primary" onClick={goHome(role)}>
            Ir para minha área
          </Button>
        }
      />
    ) : (
      form
    );

  return (
    <PageSection title="Escolha seu perfil">
      <p className="-mt-2 mb-6 max-w-2xl text-border-active">
        Como você quer usar a Colheita Direta? Você pode ter mais de um perfil com o mesmo celular.
      </p>
      <div className="max-w-2xl">
        <Tabs
          activeKey={selectedRole}
          onChange={(role) => setSearchParams({ perfil: role })}
          items={[
            {
              key: 'producer',
              label: 'Produtor',
              children: formOrShortcut(
                'producer',
                <ProducerSignupForm onRegistered={goHome('producer')} />,
              ),
            },
            {
              key: 'buyer',
              label: 'Comprador',
              children: formOrShortcut('buyer', <BuyerSignupForm onRegistered={goHome('buyer')} />),
            },
            {
              key: 'service_provider',
              label: 'Transporte e serviços',
              children: formOrShortcut(
                'service_provider',
                <ServiceProviderSignupForm onRegistered={goHome('service_provider')} />,
              ),
            },
            {
              key: 'ngo',
              label: 'ONG / banco de alimentos',
              children: formOrShortcut('ngo', <NgoSignupForm onRegistered={goHome('ngo')} />),
            },
          ]}
        />
      </div>
    </PageSection>
  );
}
