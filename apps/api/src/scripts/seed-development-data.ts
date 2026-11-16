import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../core.module';
import { RegisterPriceReferenceUseCase } from '../modules/market-intelligence/use-cases/register-price-reference.use-case';
import { User } from '../modules/identity/entities/user.entity';
import { USER_REPOSITORY, UserRepository } from '../modules/identity/repositories/user.repository';

/**
 * Dados de desenvolvimento. Uso: node dist/scripts/seed-development-data.js +5511999990000
 * - Cria (ou promove) o telefone informado como admin.
 * - Registra cotações de EXEMPLO. Em produção, substituir pela importação CONAB/Prohort e CEASAs.
 */
const EXAMPLE_PRICE_REFERENCES = [
  { crop: 'tomate', pricePerKg: 4.2 },
  { crop: 'alface', pricePerKg: 6.5 },
  { crop: 'banana', pricePerKg: 3.1 },
  { crop: 'batata', pricePerKg: 3.4 },
  { crop: 'cenoura', pricePerKg: 3.0 },
];

async function seedDevelopmentData(): Promise<void> {
  const adminPhoneNumber = process.argv[2];
  const app = await NestFactory.createApplicationContext(CoreModule, { logger: ['error', 'warn'] });

  const registered = await app.get(RegisterPriceReferenceUseCase).execute(
    EXAMPLE_PRICE_REFERENCES.map((reference) => ({
      ...reference,
      source: 'EXEMPLO (desenvolvimento) – substituir por CONAB/CEASA',
      referenceDate: new Date(),
    })),
  );
  Logger.log(`${registered} cotações de exemplo registradas`);

  if (adminPhoneNumber) {
    const userRepository = app.get<UserRepository>(USER_REPOSITORY);
    const user = (await userRepository.findByPhoneNumber(adminPhoneNumber)) ?? User.createFromPhone(adminPhoneNumber);
    user.grantRole('admin', user.name ?? 'Administrador', 'desenvolvimento');
    await userRepository.save(user);
    Logger.log(`${adminPhoneNumber} agora é admin`);
  }
  await app.close();
}

void seedDevelopmentData();
