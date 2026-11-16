import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../shared/config/app-config.service';

/** Baixa fotos e áudios recebidos no WhatsApp (dois passos: metadados → arquivo). */
@Injectable()
export class WhatsAppMediaDownloader {
  constructor(private readonly appConfig: AppConfigService) {}

  async download(mediaId: string): Promise<{ content: Buffer; mimeType: string }> {
    const authorization = { Authorization: `Bearer ${this.appConfig.get('WHATSAPP_ACCESS_TOKEN')}` };
    const metadataResponse = await fetch(`${this.appConfig.get('WHATSAPP_GRAPH_API_URL')}/${mediaId}`, {
      headers: authorization,
    });
    if (!metadataResponse.ok) throw new Error(`Mídia ${mediaId} não encontrada (${metadataResponse.status})`);
    const metadata = (await metadataResponse.json()) as { url: string; mime_type: string };

    const fileResponse = await fetch(metadata.url, { headers: authorization });
    if (!fileResponse.ok) throw new Error(`Falha ao baixar mídia ${mediaId} (${fileResponse.status})`);
    return { content: Buffer.from(await fileResponse.arrayBuffer()), mimeType: metadata.mime_type };
  }
}
