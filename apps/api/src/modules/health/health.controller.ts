import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { PublicRoute } from '../../shared/auth/auth.decorators';

@ApiTags('Saúde')
@PublicRoute()
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly databaseConnection: Connection) {}

  @Get()
  async check(): Promise<{ status: 'ok' }> {
    try {
      await this.databaseConnection.db!.admin().ping();
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }
}
