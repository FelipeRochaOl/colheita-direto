import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './shared/config/app-config.service';

async function bootstrapHttpServer(): Promise<void> {
  // rawBody: necessário para validar a assinatura do webhook do WhatsApp.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const appConfig = app.get(AppConfigService);

  app.enableCors({ origin: appConfig.get('WEB_APP_URL') });
  app.enableShutdownHooks();

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Colheita Direta API')
      .setDescription('Marketplace direto do produtor, classificação por foto e destinação de excedentes')
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(appConfig.get('PORT'));
}

void bootstrapHttpServer();
