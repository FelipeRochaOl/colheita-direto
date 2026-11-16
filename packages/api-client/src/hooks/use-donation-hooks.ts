import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api-client-context';
import { queryKeys } from '../query-keys';

export function useDonations() {
  const apiClient = useApiClient();
  return useQuery({ queryKey: queryKeys.donations, queryFn: () => apiClient.listDonations() });
}

export function useAcceptDonation() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (donationId: string) => apiClient.acceptDonation(donationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donations }),
  });
}

export function useConfirmDonationReceipt() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ donationId, receivedWeightKg }: { donationId: string; receivedWeightKg: number }) =>
      apiClient.confirmDonationReceipt(donationId, { receivedWeightKg }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donations }),
  });
}
