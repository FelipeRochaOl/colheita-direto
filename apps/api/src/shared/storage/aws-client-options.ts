import { AppConfigService } from '../config/app-config.service';

/** Opções comuns dos clientes AWS. Em desenvolvimento aponta para o LocalStack. */
export function buildAwsClientOptions(appConfig: AppConfigService) {
  const endpoint = appConfig.get('AWS_ENDPOINT_URL');
  return {
    region: appConfig.get('AWS_REGION'),
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
  };
}
