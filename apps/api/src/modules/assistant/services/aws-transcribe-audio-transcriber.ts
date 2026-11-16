import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  GetTranscriptionJobCommand,
  MediaFormat,
  StartTranscriptionJobCommand,
  TranscribeClient,
} from '@aws-sdk/client-transcribe';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { buildAwsClientOptions } from '../../../shared/storage/aws-client-options';
import { AudioTranscriber } from './audio-transcriber';

const POLL_INTERVAL_MILLISECONDS = 2000;
const MAX_POLL_ATTEMPTS = 45;

/** Amazon Transcribe (lote): áudio → S3 → job pt-BR → texto. Áudios do WhatsApp chegam em OGG/Opus. */
@Injectable()
export class AwsTranscribeAudioTranscriber implements AudioTranscriber {
  private readonly s3Client: S3Client;
  private readonly transcribeClient: TranscribeClient;
  private readonly bucketName: string;

  constructor(appConfig: AppConfigService) {
    this.s3Client = new S3Client(buildAwsClientOptions(appConfig));
    this.transcribeClient = new TranscribeClient({ region: appConfig.get('AWS_REGION') });
    this.bucketName = appConfig.get('HARVEST_PHOTOS_BUCKET');
  }

  async transcribe(audio: Buffer, mimeType: string): Promise<string> {
    const jobName = `voice-${randomUUID()}`;
    const audioKey = `voice-messages/${jobName}.ogg`;
    const transcriptKey = `voice-transcripts/${jobName}.json`;

    await this.s3Client.send(
      new PutObjectCommand({ Bucket: this.bucketName, Key: audioKey, Body: audio, ContentType: mimeType }),
    );
    await this.transcribeClient.send(
      new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: 'pt-BR',
        MediaFormat: MediaFormat.OGG,
        Media: { MediaFileUri: `s3://${this.bucketName}/${audioKey}` },
        OutputBucketName: this.bucketName,
        OutputKey: transcriptKey,
      }),
    );
    await this.waitForCompletion(jobName);

    const transcriptObject = await this.s3Client.send(
      new GetObjectCommand({ Bucket: this.bucketName, Key: transcriptKey }),
    );
    const transcript = JSON.parse(await transcriptObject.Body!.transformToString()) as {
      results: { transcripts: Array<{ transcript: string }> };
    };
    return transcript.results.transcripts.map((item) => item.transcript).join(' ').trim();
  }

  private async waitForCompletion(jobName: string): Promise<void> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const { TranscriptionJob } = await this.transcribeClient.send(
        new GetTranscriptionJobCommand({ TranscriptionJobName: jobName }),
      );
      if (TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED') return;
      if (TranscriptionJob?.TranscriptionJobStatus === 'FAILED') {
        throw new Error(`Transcrição falhou: ${TranscriptionJob.FailureReason}`);
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MILLISECONDS));
    }
    throw new Error('Transcrição demorou demais');
  }
}
