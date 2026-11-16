import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Inject,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PublicRoute } from '../../../shared/auth/auth.decorators';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { EVENT_PUBLISHER, EventPublisher } from '../../../shared/queue/event-publisher';
import { WHATSAPP_MESSAGE_RECEIVED_EVENT } from '../services/whatsapp-inbound-message';
import { WhatsAppWebhookBody, WhatsAppWebhookParser } from '../services/whatsapp-webhook-parser';

/** Webhook da WhatsApp Cloud API. Responde rápido e delega o processamento ao worker via SQS. */
@ApiExcludeController()
@PublicRoute()
@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  constructor(
    private readonly appConfig: AppConfigService,
    private readonly webhookParser: WhatsAppWebhookParser,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisher,
  ) {}

  /** Verificação do webhook feita pela Meta ao configurar a URL. */
  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    const expectedToken = this.appConfig.get('WHATSAPP_VERIFY_TOKEN');
    if (mode !== 'subscribe' || !expectedToken || verifyToken !== expectedToken) throw new ForbiddenException();
    return challenge;
  }

  @Post()
  @HttpCode(200)
  async receive(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string | undefined,
  ): Promise<void> {
    this.assertValidSignature(request.rawBody, signature);
    const messages = this.webhookParser.parse(request.body as WhatsAppWebhookBody);
    for (const message of messages) {
      await this.eventPublisher.publish('notification-events', WHATSAPP_MESSAGE_RECEIVED_EVENT, { ...message });
    }
  }

  private assertValidSignature(rawBody: Buffer | undefined, signature: string | undefined): void {
    const appSecret = this.appConfig.get('WHATSAPP_APP_SECRET');
    if (!appSecret || !rawBody || !signature?.startsWith('sha256=')) throw new ForbiddenException();
    const expected = Buffer.from(`sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`);
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new ForbiddenException();
  }
}
