import {
  useMyBuyerProfile,
  useMyNgoProfile,
  useMyProducerProfile,
  useMyServiceProviderProfile,
} from '@colheita/api-client';
import { formatInternationalPhoneNumber, type UserRole } from '@colheita/contracts';
import { PageSection } from '@colheita/ui-web';
import { Alert, Button, Skeleton, Tabs, message } from 'antd';
import type { ReactNode } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { useSession } from '../features/auth/hooks/use-session';
import { BuyerSignupForm } from '../features/signup/components/buyer-signup-form';
import { NgoSignupForm } from '../features/signup/components/ngo-signup-form';
import { ProducerSignupForm } from '../features/signup/components/producer-signup-form';
import { ServiceProviderProfileForm } from '../features/services/components/service-provider-profile-form';

type EditableRole = Extract<UserRole, 'producer' | 'buyer' | 'ngo' | 'service_provider'>;

/** Carregamento/erro comuns às abas: o formulário só monta com os dados já buscados. */
function ProfileLoader<Profile>({
  query,
  children,
}: {
  query: { data?: Profile; isLoading: boolean; error: Error | null; refetch: () => unknown };
  children: (profile: Profile) => ReactNode;
}) {
  if (query.isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (query.error || !query.data)
    return (
      <Alert
        type="error"
        showIcon
        message={query.error?.message ?? 'Não foi possível carregar seus dados.'}
        action={<Button onClick={() => query.refetch()}>Tentar de novo</Button>}
      />
    );
  return <>{children(query.data)}</>;
}

/** "Meus dados": o usuário revisa e corrige o cadastro de cada perfil que tem. */
export function ProfilePage() {
  const { session, isLoading, hasRole } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageApi, messageContext] = message.useMessage();

  const producerProfile = useMyProducerProfile(hasRole('producer'));
  const buyerProfile = useMyBuyerProfile(hasRole('buyer'));
  const ngoProfile = useMyNgoProfile(hasRole('ngo'));
  const serviceProviderProfile = useMyServiceProviderProfile(hasRole('service_provider'));

  if (!isLoading && !session) return <Navigate to="/entrar?voltar=/meus-dados" replace />;
  if (!session) return null;

  const notifySaved = () => void messageApi.success('Dados atualizados.');
  const tabs: Array<{ key: EditableRole; label: string; children: ReactNode }> = [];
  if (hasRole('producer'))
    tabs.push({
      key: 'producer',
      label: 'Produtor',
      children: (
        <ProfileLoader query={producerProfile}>
          {(profile) => <ProducerSignupForm profile={profile} onRegistered={notifySaved} />}
        </ProfileLoader>
      ),
    });
  if (hasRole('buyer'))
    tabs.push({
      key: 'buyer',
      label: 'Comprador',
      children: (
        <ProfileLoader query={buyerProfile}>
          {(profile) => <BuyerSignupForm profile={profile} onRegistered={notifySaved} />}
        </ProfileLoader>
      ),
    });
  if (hasRole('ngo'))
    tabs.push({
      key: 'ngo',
      label: 'ONG',
      children: (
        <ProfileLoader query={ngoProfile}>
          {(profile) => (
            <>
              {!profile.isApproved && (
                <Alert
                  type="info"
                  showIcon
                  className="mb-4!"
                  message="Organização aguardando aprovação da equipe."
                />
              )}
              <NgoSignupForm profile={profile} onRegistered={notifySaved} />
            </>
          )}
        </ProfileLoader>
      ),
    });

  if (hasRole('service_provider'))
    tabs.push({
      key: 'service_provider',
      label: 'Transporte e serviços',
      children: (
        <ProfileLoader query={serviceProviderProfile}>
          {(profile) => <ServiceProviderProfileForm profile={profile} onSaved={notifySaved} />}
        </ProfileLoader>
      ),
    });

  const requestedRole = searchParams.get('perfil');
  const activeKey = tabs.some((tab) => tab.key === requestedRole) ? requestedRole! : tabs[0]?.key;

  return (
    <PageSection title="Meus dados">
      {messageContext}
      <div className="max-w-2xl">
        <p className="-mt-2 mb-6 text-border-active">
          Celular da conta: <strong>{formatInternationalPhoneNumber(session.user.phoneNumber)}</strong>. Ele é
          usado para entrar e não pode ser trocado por aqui.
        </p>
        {tabs.length > 0 ? (
          <Tabs
            activeKey={activeKey}
            onChange={(role) => setSearchParams({ perfil: role })}
            items={tabs}
          />
        ) : (
          <Alert
            type="info"
            showIcon
            message="Você ainda não tem um perfil com dados editáveis aqui."
            action={
              <Link to="/cadastro">
                <Button type="primary">Criar perfil</Button>
              </Link>
            }
          />
        )}
      </div>
    </PageSection>
  );
}
