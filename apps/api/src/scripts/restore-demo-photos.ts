import 'reflect-metadata';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { CoreModule } from '../core.module';
import { AppConfigService } from '../shared/config/app-config.service';
import { buildAwsClientOptions } from '../shared/storage/aws-client-options';

/**
 * Restaura fotos que sumiram do S3 LOCAL (LocalStack não guarda dados ao reiniciar; o Mongo guarda).
 *   pnpm --filter @colheita/api build && pnpm --filter @colheita/api photos:restore
 *
 * Não apaga nada: para cada chave de foto citada em lotes/ofertas que não existe no bucket, envia
 * a foto de demonstração mais parecida (mesma cultura e nota) para a MESMA chave.
 */

const PHOTOS_DIRECTORY = resolve(__dirname, '../../demo-data/photos');
const logger = new Logger('RestoreDemoPhotos');

interface PhotoReference {
  photoKey: string;
  crop: string;
  grade: string | null;
}

/** "Pimentão" → "pimentao", como nos nomes dos arquivos de demonstração. */
function normalizeCrop(crop: string): string {
  return crop
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

/** Escolhe a foto de demonstração: cultura + nota, depois só a cultura, depois qualquer uma. */
export function pickDemoPhoto(demoPhotos: string[], crop: string, grade: string | null): string {
  const cropName = normalizeCrop(crop);
  const sameCrop = demoPhotos.filter((photo) => photo.startsWith(`${cropName}-`));
  const sameCropAndGrade = sameCrop.find((photo) => grade && photo.startsWith(`${cropName}-${grade.toLowerCase()}`));
  return sameCropAndGrade ?? sameCrop[0] ?? demoPhotos[0]!;
}

async function existsInBucket(s3Client: S3Client, bucketName: string, photoKey: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: photoKey }));
    return true;
  } catch (error) {
    if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return false;
    throw error;
  }
}

async function collectPhotoReferences(connection: Connection): Promise<PhotoReference[]> {
  const lots = await connection
    .collection('harvest_lots')
    .find({}, { projection: { photoKeys: 1, crop: 1, 'classification.grade': 1 } })
    .toArray();
  const offers = await connection
    .collection('offers')
    .find({}, { projection: { photoKeys: 1, crop: 1, grade: 1 } })
    .toArray();
  const references = new Map<string, PhotoReference>();
  for (const lot of lots)
    for (const photoKey of lot.photoKeys ?? [])
      references.set(photoKey, { photoKey, crop: lot.crop, grade: lot.classification?.grade ?? null });
  for (const offer of offers)
    for (const photoKey of offer.photoKeys ?? [])
      if (!references.has(photoKey)) references.set(photoKey, { photoKey, crop: offer.crop, grade: offer.grade ?? null });
  return [...references.values()];
}

async function restoreDemoPhotos(): Promise<void> {
  const app = await NestFactory.createApplicationContext(CoreModule, { logger: ['error', 'warn'] });
  try {
    const appConfig = app.get(AppConfigService);
    // Segurança: só no S3 local. Em produção as fotos são do produtor e não podem ser trocadas.
    if (!appConfig.get('AWS_ENDPOINT_URL'))
      throw new Error('AWS_ENDPOINT_URL vazio: este script só roda contra o LocalStack (desenvolvimento).');

    const bucketName = appConfig.get('HARVEST_PHOTOS_BUCKET');
    const s3Client = new S3Client(buildAwsClientOptions(appConfig));
    const demoPhotos = readdirSync(PHOTOS_DIRECTORY).filter((file) => file.endsWith('.jpg')).sort();
    const references = await collectPhotoReferences(app.get<Connection>(getConnectionToken()));

    let restored = 0;
    for (const reference of references) {
      if (await existsInBucket(s3Client, bucketName, reference.photoKey)) continue;
      const demoPhoto = pickDemoPhoto(demoPhotos, reference.crop, reference.grade);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: reference.photoKey,
          Body: readFileSync(resolve(PHOTOS_DIRECTORY, demoPhoto)),
          ContentType: 'image/jpeg',
        }),
      );
      restored += 1;
    }
    // O contexto Nest só imprime warn/error; o resumo vai direto no console
    console.log(`${references.length} fotos referenciadas, ${restored} restauradas no bucket ${bucketName}.`);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  restoreDemoPhotos().catch((error) => {
    logger.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
