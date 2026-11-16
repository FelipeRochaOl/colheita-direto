import { ColheitaApiClient } from '@colheita/api-client';

export const CREATE_HARVEST_LOT_MUTATION_KEY = ['create-harvest-lot'] as const;

/** Só dados serializáveis: a mutação fica salva no aparelho e é reenviada quando a internet voltar. */
export interface OfflineHarvestLotInput {
  crop: string;
  quantityBoxes: number;
  boxWeightKg: number;
  photoUris: string[];
  harvestedAt: string;
}

export async function createHarvestLotFromDevice(apiClient: ColheitaApiClient, input: OfflineHarvestLotInput) {
  const uploadUrls = await apiClient.createPhotoUploadUrls(input.photoUris.length, 'image/jpeg');
  await Promise.all(
    uploadUrls.map(async (upload, index) => {
      const photo = await (await fetch(input.photoUris[index])).blob();
      await apiClient.uploadPhoto(upload.uploadUrl, photo, 'image/jpeg');
    }),
  );
  return apiClient.createHarvestLot({
    crop: input.crop,
    quantityBoxes: input.quantityBoxes,
    boxWeightKg: input.boxWeightKg,
    photoKeys: uploadUrls.map((upload) => upload.photoKey),
    harvestedAt: input.harvestedAt,
  });
}
