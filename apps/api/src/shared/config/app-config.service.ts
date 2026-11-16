import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './app-config';

/** Acesso tipado às variáveis de ambiente já validadas. */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  get<Key extends keyof AppConfig>(key: Key): AppConfig[Key] {
    return this.configService.get(key, { infer: true });
  }
}
