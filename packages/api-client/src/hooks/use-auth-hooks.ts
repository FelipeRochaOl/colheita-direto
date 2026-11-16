import { useMutation } from '@tanstack/react-query';
import type {
  RegisterBuyerInput,
  RegisterNgoInput,
  RegisterProducerInput,
  RegisterServiceProviderInput,
} from '@colheita/contracts';
import { useApiClient } from '../api-client-context';

export function useRequestOtp() {
  const apiClient = useApiClient();
  return useMutation({ mutationFn: (phoneNumber: string) => apiClient.requestOtp(phoneNumber) });
}

export function useVerifyOtp() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: ({ phoneNumber, code }: { phoneNumber: string; code: string }) => apiClient.verifyOtp(phoneNumber, code),
  });
}

export function useRegisterProducer() {
  const apiClient = useApiClient();
  return useMutation({ mutationFn: (input: RegisterProducerInput) => apiClient.registerProducer(input) });
}

export function useRegisterBuyer() {
  const apiClient = useApiClient();
  return useMutation({ mutationFn: (input: RegisterBuyerInput) => apiClient.registerBuyer(input) });
}

export function useRegisterServiceProvider() {
  const apiClient = useApiClient();
  return useMutation({ mutationFn: (input: RegisterServiceProviderInput) => apiClient.registerServiceProvider(input) });
}

export function useRegisterNgo() {
  const apiClient = useApiClient();
  return useMutation({ mutationFn: (input: RegisterNgoInput) => apiClient.registerNgo(input) });
}
