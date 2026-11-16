import type { UserRole } from '@colheita/contracts';
import { PageSection } from '@colheita/ui-web';
import { Alert, Tabs } from 'antd';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { useSession } from '../features/auth/hooks/use-session';
import { BuyerSignupForm } from '../features/signup/components/buyer-signup-form';
import { NgoSignupForm } from '../features/signup/components/ngo-signup-form';
import { ProducerSignupForm } from '../features/signup/components/producer-signup-form';
import { ServiceProviderSignupForm } from '../features/signup/components/service-provider-signup-form';

const HOME_BY_ROLE: Partial<Record<UserRole, string>> = {
  producer: '/produtor',
  buyer: '/mercado',
  ngo: '/doacoes',
  service_provider: '/',
};

export function SignupPage() {
  const { session, isLoading, hasRole } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedRole = (searchParams.get('perfil') as UserRole) ?? 'producer';

  if (!isLoading && !session) return <Navigate to={`/entrar?voltar=/cadastro?perfil=${selectedRole}`} replace />;

  const goHome = (role: UserRole) => () => navigate(HOME_BY_ROLE[role] ?? '/');
  const alreadyHas = (role: UserRole) =>
    hasRole(role) ? <Alert type="success" showIcon message="Você já tem este perfil." className="mb-4!" /> : null;

  return (
    <PageSection title="Escolha seu perfil">
      <div className="max-w-2xl">
        <Tabs
          activeKey={selectedRole}
          onChange={(role) => setSearchParams({ perfil: role })}
          items={[
            { key: 'producer', label: 'Produtor', children: <>{alreadyHas('producer')}<ProducerSignupForm onRegistered={goHome('producer')} /></> },
            { key: 'buyer', label: 'Comprador', children: <>{alreadyHas('buyer')}<BuyerSignupForm onRegistered={goHome('buyer')} /></> },
            { key: 'service_provider', label: 'Transporte e serviços', children: <>{alreadyHas('service_provider')}<ServiceProviderSignupForm onRegistered={goHome('service_provider')} /></> },
            { key: 'ngo', label: 'ONG / banco de alimentos', children: <>{alreadyHas('ngo')}<NgoSignupForm onRegistered={goHome('ngo')} /></> },
          ]}
        />
      </div>
    </PageSection>
  );
}
