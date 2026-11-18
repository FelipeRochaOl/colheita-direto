import { useMyServiceProviderProfile, useRespondServiceRequest, useServiceRequests } from '@colheita/api-client';
import { PageSection } from '@colheita/ui-web';
import { Alert, Badge, Button, Skeleton, Tabs, message } from 'antd';
import { useSearchParams } from 'react-router';
import { ServiceProviderProfileForm } from '../features/services/components/service-provider-profile-form';
import { ServiceRequestList } from '../features/services/components/service-request-list';

const TAB_KEYS = ['requests', 'services'] as const;
type ServiceProviderTab = (typeof TAB_KEYS)[number];

/** Área do prestador/transportadora: divulga serviços e preços e responde às solicitações. */
export function ServiceProviderPage() {
  const profile = useMyServiceProviderProfile();
  const serviceRequests = useServiceRequests();
  const respond = useRespondServiceRequest();
  const [messageApi, messageContext] = message.useMessage();
  const [searchParams, setSearchParams] = useSearchParams();

  const hasOfferings = Boolean(profile.data?.offerings.length);
  const requestedTab = searchParams.get('aba') as ServiceProviderTab | null;
  // Quem ainda não divulgou preço cai direto em "Meus serviços"
  const activeTab: ServiceProviderTab =
    requestedTab && TAB_KEYS.includes(requestedTab) ? requestedTab : profile.data && !hasOfferings ? 'services' : 'requests';
  const received = serviceRequests.data?.received ?? [];
  const pending = received.filter((request) => request.status === 'REQUESTED').length;

  if (profile.isLoading) return <Skeleton active className="mt-8" />;
  if (profile.error || !profile.data)
    return (
      <Alert
        type="error"
        showIcon
        className="mt-8!"
        message={profile.error?.message ?? 'Não foi possível carregar seu perfil.'}
        action={<Button onClick={() => profile.refetch()}>Tentar de novo</Button>}
      />
    );

  return (
    <PageSection title="Meus serviços">
      {messageContext}
      <div className="flex flex-col gap-3 mb-4 max-w-3xl">
        {!profile.data.isApproved && (
          <Alert
            type="info"
            showIcon
            message="Cadastro aguardando aprovação. Você já pode divulgar seus preços; eles aparecem para os produtores assim que aprovarmos seus documentos."
          />
        )}
        {!hasOfferings && (
          <Alert type="warning" showIcon message="Divulgue ao menos um serviço com preço para receber solicitações." />
        )}
      </div>
      <Tabs
        size="large"
        activeKey={activeTab}
        onChange={(tab) => setSearchParams({ aba: tab }, { replace: true })}
        items={[
          {
            key: 'requests',
            label: (
              <span className="inline-flex items-center gap-2">
                Solicitações
                {pending > 0 && <Badge count={pending} aria-label={`${pending} aguardando resposta`} />}
              </span>
            ),
            children: serviceRequests.isLoading ? (
              <Skeleton active />
            ) : (
              <div className="max-w-3xl">
                {respond.error && <Alert type="error" showIcon message={respond.error.message} className="mb-4!" />}
                <ServiceRequestList
                  serviceRequests={received}
                  perspective="service_provider"
                  onRespond={(serviceRequestId, accept) => respond.mutate({ serviceRequestId, accept })}
                  pendingServiceRequestId={respond.isPending ? respond.variables.serviceRequestId : null}
                />
              </div>
            ),
          },
          {
            key: 'services',
            label: 'Serviços, preços e cobertura',
            children: (
              <div className="max-w-3xl">
                <ServiceProviderProfileForm
                  profile={profile.data}
                  onSaved={() => void messageApi.success('Serviços divulgados.')}
                />
              </div>
            ),
          },
        ]}
      />
    </PageSection>
  );
}
