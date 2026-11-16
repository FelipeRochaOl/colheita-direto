import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CoreModule } from './core.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './shared/auth/jwt-auth.guard';
import { RolesGuard } from './shared/auth/roles.guard';
import { DomainErrorFilter } from './shared/errors/domain-error.filter';

/** Aplicação HTTP: rotas, autenticação, papéis e limite de requisições. */
@Module({
  imports: [CoreModule, HealthModule, ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: DomainErrorFilter },
  ],
})
export class AppModule {}
