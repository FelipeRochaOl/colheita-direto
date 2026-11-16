import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppConfigService } from '../config/app-config.service';
import { buildAwsClientOptions } from './aws-client-options';
import { PhotoStorage, PhotoUpload } from './photo-storage';

const SIGNED_URL_EXPIRATION_SECONDS = 15 * 60;

@Injectable()
export class S3PhotoStorage implements PhotoStorage {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(appConfig: AppConfigService) {
    this.s3Client = new S3Client(buildAwsClientOptions(appConfig));
    this.bucketName = appConfig.get('HARVEST_PHOTOS_BUCKET');
  }

  async createUploadUrl(ownerId: string, contentType: string): Promise<PhotoUpload> {
    const photoKey = this.buildPhotoKey(ownerId, contentType);
    const command = new PutObjectCommand({ Bucket: this.bucketName, Key: photoKey, ContentType: contentType });
    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: SIGNED_URL_EXPIRATION_SECONDS });
    return { uploadUrl, photoKey };
  }

  async createReadUrl(photoKey: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucketName, Key: photoKey });
    return getSignedUrl(this.s3Client, command, { expiresIn: SIGNED_URL_EXPIRATION_SECONDS });
  }

  async savePhoto(ownerId: string, content: Buffer, contentType: string): Promise<string> {
    const photoKey = this.buildPhotoKey(ownerId, contentType);
    await this.s3Client.send(
      new PutObjectCommand({ Bucket: this.bucketName, Key: photoKey, Body: content, ContentType: contentType }),
    );
    return photoKey;
  }

  async readPhoto(photoKey: string): Promise<Buffer> {
    const response = await this.s3Client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: photoKey }));
    const bytes = await response.Body!.transformToByteArray();
    return Buffer.from(bytes);
  }

  private buildPhotoKey(ownerId: string, contentType: string): string {
    const extension = contentType.split('/')[1] ?? 'jpg';
    return `harvest-photos/${ownerId}/${randomUUID()}.${extension}`;
  }
}
