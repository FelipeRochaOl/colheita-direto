import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateAppConfig } from './app-config';
import { AppConfigService } from './app-config.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateAppConfig })],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
