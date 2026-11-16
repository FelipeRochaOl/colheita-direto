import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RegisterExpenseInput } from '../api-client';
import { useApiClient } from '../api-client-context';
import { queryKeys } from '../query-keys';

export function useFarmSummary() {
  const apiClient = useApiClient();
  return useQuery({ queryKey: queryKeys.farmSummary, queryFn: () => apiClient.getFarmSummary() });
}

export function useRegisterExpense() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterExpenseInput) => apiClient.registerExpense(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.farmSummary }),
  });
}

export function useImpactIndicators() {
  const apiClient = useApiClient();
  return useQuery({ queryKey: queryKeys.impactIndicators, queryFn: () => apiClient.getImpactIndicators() });
}
