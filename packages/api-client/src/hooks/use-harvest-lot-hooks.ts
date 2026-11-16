import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ConfirmLotDestinationInput, HarvestLot } from '@colheita/contracts';
import { useApiClient } from '../api-client-context';
import { queryKeys } from '../query-keys';

const CLASSIFICATION_POLL_INTERVAL_MS = 3000;

export function useHarvestLots() {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: queryKeys.harvestLots,
    queryFn: () => apiClient.listHarvestLots(),
    // Enquanto algum lote está sendo classificado, atualiza sozinho.
    refetchInterval: (query) =>
      query.state.data?.some((lot: HarvestLot) => lot.status === 'PENDING_CLASSIFICATION')
        ? CLASSIFICATION_POLL_INTERVAL_MS
        : false,
  });
}

export interface NewHarvestLotPhoto {
  content: Blob;
  contentType: string;
}

export interface CreateHarvestLotWithPhotosInput {
  crop: string;
  quantityBoxes: number;
  boxWeightKg: number;
  photos: NewHarvestLotPhoto[];
}

/** Envia as fotos direto ao S3 (URLs assinadas) e cria o lote. */
export function useCreateHarvestLot() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ photos, ...lot }: CreateHarvestLotWithPhotosInput) => {
      // Uma URL por foto, assinada com o tipo da própria foto (JPEG e PNG podem vir misturados).
      const uploadUrls = await Promise.all(
        photos.map(async (photo) => {
          const [upload] = await apiClient.createPhotoUploadUrls(1, photo.contentType);
          await apiClient.uploadPhoto(upload.uploadUrl, photo.content, photo.contentType);
          return upload;
        }),
      );
      return apiClient.createHarvestLot({
        ...lot,
        photoKeys: uploadUrls.map((upload) => upload.photoKey),
        harvestedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.harvestLots }),
  });
}

export function useConfirmLotDestination() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ harvestLotId, ...input }: ConfirmLotDestinationInput & { harvestLotId: string }) =>
      apiClient.confirmLotDestination(harvestLotId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.harvestLots });
      void queryClient.invalidateQueries({ queryKey: queryKeys.farmSummary });
    },
  });
}
