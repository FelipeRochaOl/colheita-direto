import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateOrderInput, Order, SearchOffersInput } from '@colheita/contracts';
import { useApiClient } from '../api-client-context';
import { queryKeys } from '../query-keys';

const PAYMENT_POLL_INTERVAL_MS = 4000;

export function useOffers(filters: SearchOffersInput) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: queryKeys.offers(filters),
    queryFn: () => apiClient.searchOffers(filters),
    placeholderData: keepPreviousData,
  });
}

export function useOffer(offerId: string) {
  const apiClient = useApiClient();
  return useQuery({ queryKey: queryKeys.offer(offerId), queryFn: () => apiClient.getOffer(offerId) });
}

export function useCreateOrder() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => apiClient.createOrder(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      void queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export function useOrders() {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => apiClient.listOrders(),
    // Enquanto há pedido aguardando Pix, acompanha o pagamento.
    refetchInterval: (query) =>
      query.state.data?.some((order: Order) => order.status === 'CREATED') ? PAYMENT_POLL_INTERVAL_MS : false,
  });
}

export function useAcceptOrder() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => apiClient.acceptOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
  });
}

export function useConfirmOrderDelivery() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => apiClient.confirmOrderDelivery(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
  });
}
