import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateServiceRequestInput,
  SearchServiceProvidersInput,
  UpdateServiceProviderProfileInput,
} from '@colheita/contracts';
import { useApiClient } from '../api-client-context';
import { queryKeys } from '../query-keys';

/** "Meus serviços" do prestador: serviços divulgados, preços, raio e base. */
export function useMyServiceProviderProfile(enabled = true) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: queryKeys.myProfile('service_provider'),
    queryFn: () => apiClient.getMyServiceProviderProfile(),
    enabled,
  });
}

export function useUpdateMyServiceProviderProfile() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateServiceProviderProfileInput) => apiClient.updateMyServiceProviderProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myProfile('service_provider') }),
  });
}

/** Produtor: prestadores que atendem a fazenda, com preço estimado. */
export function useAvailableServiceProviders(input: SearchServiceProvidersInput | null) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: queryKeys.availableServiceProviders(input ?? { serviceType: 'TRANSPORT' }),
    queryFn: () => apiClient.searchServiceProviders(input!),
    enabled: Boolean(input),
  });
}

export function useServiceRequests(enabled = true) {
  const apiClient = useApiClient();
  return useQuery({ queryKey: queryKeys.serviceRequests, queryFn: () => apiClient.listServiceRequests(), enabled });
}

export function useCreateServiceRequest() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceRequestInput) => apiClient.createServiceRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests }),
  });
}

export function useRespondServiceRequest() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceRequestId, accept }: { serviceRequestId: string; accept: boolean }) =>
      apiClient.respondServiceRequest(serviceRequestId, accept),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests }),
  });
}
