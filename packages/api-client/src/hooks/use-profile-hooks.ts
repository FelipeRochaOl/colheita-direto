import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateBuyerProfileInput, UpdateNgoProfileInput, UpdateProducerProfileInput } from '@colheita/contracts';
import { useApiClient } from '../api-client-context';
import { queryKeys } from '../query-keys';

/** Hooks da tela "Meus dados": um par leitura/edição por perfil. */
export function useMyProducerProfile(enabled = true) {
  const apiClient = useApiClient();
  return useQuery({ queryKey: queryKeys.myProfile('producer'), queryFn: () => apiClient.getMyProducerProfile(), enabled });
}

export function useUpdateMyProducerProfile() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProducerProfileInput) => apiClient.updateMyProducerProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myProfile('producer') }),
  });
}

export function useMyBuyerProfile(enabled = true) {
  const apiClient = useApiClient();
  return useQuery({ queryKey: queryKeys.myProfile('buyer'), queryFn: () => apiClient.getMyBuyerProfile(), enabled });
}

export function useUpdateMyBuyerProfile() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBuyerProfileInput) => apiClient.updateMyBuyerProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myProfile('buyer') }),
  });
}

export function useMyNgoProfile(enabled = true) {
  const apiClient = useApiClient();
  return useQuery({ queryKey: queryKeys.myProfile('ngo'), queryFn: () => apiClient.getMyNgoProfile(), enabled });
}

export function useUpdateMyNgoProfile() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNgoProfileInput) => apiClient.updateMyNgoProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myProfile('ngo') }),
  });
}
