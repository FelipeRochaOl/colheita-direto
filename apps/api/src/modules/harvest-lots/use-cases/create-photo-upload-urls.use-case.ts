import { Inject, Injectable } from '@nestjs/common';
import type { PhotoUploadUrl } from '@colheita/contracts';
import { BusinessRuleViolationError } from '../../../shared/errors/domain-error';
import { PHOTO_STORAGE, PhotoStorage } from '../../../shared/storage/photo-storage';

const MAX_PHOTOS_PER_LOT = 5;
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** O app envia as fotos direto ao S3 (URL assinada), sem passar pela API. */
@Injectable()
export class CreatePhotoUploadUrlsUseCase {
  constructor(@Inject(PHOTO_STORAGE) private readonly photoStorage: PhotoStorage) {}

  async execute(producerId: string, photoCount: number, contentType: string): Promise<PhotoUploadUrl[]> {
    if (photoCount < 1 || photoCount > MAX_PHOTOS_PER_LOT) {
      throw new BusinessRuleViolationError(`Envie de 1 a ${MAX_PHOTOS_PER_LOT} fotos por lote`);
    }
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BusinessRuleViolationError('Formato de foto não aceito');
    }
    return Promise.all(
      Array.from({ length: photoCount }, () => this.photoStorage.createUploadUrl(producerId, contentType)),
    );
  }
}
