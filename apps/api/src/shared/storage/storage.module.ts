import { Global, Module } from '@nestjs/common';
import { PHOTO_STORAGE } from './photo-storage';
import { S3PhotoStorage } from './s3-photo-storage';

@Global()
@Module({
  providers: [{ provide: PHOTO_STORAGE, useClass: S3PhotoStorage }],
  exports: [PHOTO_STORAGE],
})
export class StorageModule {}
