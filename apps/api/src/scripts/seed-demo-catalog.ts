import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import type { LotDestination, QualityGrade } from '@colheita/contracts';
import type { Connection } from 'mongoose';
import { CoreModule } from '../core.module';
import { RegisterBuyerUseCase } from '../modules/buyers/use-cases/register-buyer.use-case';
import { HarvestLot } from '../modules/harvest-lots/entities/harvest-lot.entity';
import {
  HARVEST_LOT_REPOSITORY,
  HarvestLotRepository,
} from '../modules/harvest-lots/repositories/harvest-lot.repository';
import { LotDestinationPolicy } from '../modules/harvest-lots/services/lot-destination-policy';
import { User } from '../modules/identity/entities/user.entity';
import { USER_REPOSITORY, UserRepository } from '../modules/identity/repositories/user.repository';
import { ConfirmLotDestinationUseCase } from '../modules/lot-routing/use-cases/confirm-lot-destination.use-case';
import { LotPriceSuggester } from '../modules/market-intelligence/services/lot-price-suggester';
import { RegisterPriceReferenceUseCase } from '../modules/market-intelligence/use-cases/register-price-reference.use-case';
import { AcceptOrderUseCase } from '../modules/orders/use-cases/accept-order.use-case';
import { ConfirmOrderDeliveryUseCase } from '../modules/orders/use-cases/confirm-order-delivery.use-case';
import { CreateOrderUseCase } from '../modules/orders/use-cases/create-order.use-case';
import { HandlePaymentConfirmedUseCase } from '../modules/orders/use-cases/handle-payment-confirmed.use-case';
import { RegisterProducerUseCase } from '../modules/producers/use-cases/register-producer.use-case';
import { ApproveServiceProviderUseCase } from '../modules/service-providers/use-cases/approve-service-provider.use-case';
import { RegisterServiceProviderUseCase } from '../modules/service-providers/use-cases/register-service-provider.use-case';
import { UpdateServiceProviderProfileUseCase } from '../modules/service-providers/use-cases/update-service-provider-profile.use-case';
import { AcceptDonationUseCase } from '../modules/surplus/use-cases/accept-donation.use-case';
import { ApproveNgoUseCase } from '../modules/surplus/use-cases/approve-ngo.use-case';
import { ConfirmDonationReceiptUseCase } from '../modules/surplus/use-cases/confirm-donation-receipt.use-case';
import { RegisterNgoUseCase } from '../modules/surplus/use-cases/register-ngo.use-case';
import { PHOTO_STORAGE, PhotoStorage } from '../shared/storage/photo-storage';

/**
 * Catálogo de DEMONSTRAÇÃO (vídeo-pitch e testes manuais), só para banco local.
 *   pnpm --filter @colheita/api build && pnpm --filter @colheita/api seed:demo -- --reset
 *
 * Apaga o banco local e recria: cotações, 8 produtores com lotes fotografados (fotos reais do
 * Wikimedia Commons em demo-data/photos), ofertas, transportador, compradores, pedidos pagos e
 * uma doação recebida por ONG. Todos os passos usam os casos de uso da API (mesmas regras do produto).
 */

const PRIVACY_POLICY_VERSION = '2026-01';
const PHOTOS_DIRECTORY = resolve(__dirname, '../../demo-data/photos');

const PRICE_REFERENCES = [
  { crop: 'tomate', pricePerKg: 4.2 },
  { crop: 'alface', pricePerKg: 6.5 },
  { crop: 'banana', pricePerKg: 3.1 },
  { crop: 'batata', pricePerKg: 3.4 },
  { crop: 'cenoura', pricePerKg: 3.0 },
  { crop: 'pimentão', pricePerKg: 7.2 },
  { crop: 'abobrinha', pricePerKg: 3.8 },
  { crop: 'mandioca', pricePerKg: 2.6 },
];

const DEFECTS_BY_GRADE: Record<QualityGrade, string[]> = {
  A: [],
  B: ['manchas superficiais', 'tamanho irregular'],
  C: ['tamanho fora do padrão', 'rachaduras leves'],
  D: ['frutos murchos', 'manchas extensas'],
};

interface DemoLot {
  photo: string;
  crop: string;
  grade: QualityGrade;
  confidence: number;
  quantityBoxes: number;
  boxWeightKg: number;
  destination: LotDestination;
  /** Ajuste do produtor sobre o preço sugerido (1 = aceita o sugerido). */
  priceAdjustment: number;
  harvestedHoursAgo: number;
}

interface DemoProducer {
  phoneNumber: string;
  name: string;
  farmName: string;
  city: string;
  latitude: number;
  longitude: number;
  lots: DemoLot[];
}

const PRODUCERS: DemoProducer[] = [
  {
    phoneNumber: '+5511900000101',
    name: 'João da Silva',
    farmName: 'Sítio Boa Vista',
    city: 'Mogi das Cruzes',
    latitude: -23.5229,
    longitude: -46.188,
    lots: [
      {
        photo: 'tomate-a',
        crop: 'tomate',
        grade: 'A',
        confidence: 0.94,
        quantityBoxes: 30,
        boxWeightKg: 20,
        destination: 'MARKETPLACE',
        priceAdjustment: 1,
        harvestedHoursAgo: 6,
      },
      {
        photo: 'pimentao-a',
        crop: 'pimentão',
        grade: 'A',
        confidence: 0.91,
        quantityBoxes: 20,
        boxWeightKg: 10,
        destination: 'MARKETPLACE',
        priceAdjustment: 0.95,
        harvestedHoursAgo: 20,
      },
    ],
  },
  {
    phoneNumber: '+5511900000102',
    name: 'Maria Souza',
    farmName: 'Sítio Esperança',
    city: 'Ibiúna',
    latitude: -23.6563,
    longitude: -47.2229,
    lots: [
      {
        photo: 'alface-a',
        crop: 'alface',
        grade: 'A',
        confidence: 0.93,
        quantityBoxes: 40,
        boxWeightKg: 8,
        destination: 'MARKETPLACE',
        priceAdjustment: 1.05,
        harvestedHoursAgo: 4,
      },
      {
        photo: 'tomate-b',
        crop: 'tomate',
        grade: 'B',
        confidence: 0.88,
        quantityBoxes: 25,
        boxWeightKg: 20,
        destination: 'DISCOUNT_MARKETPLACE',
        priceAdjustment: 1,
        harvestedHoursAgo: 10,
      },
    ],
  },
  {
    phoneNumber: '+5511900000103',
    name: 'Antônio Pereira',
    farmName: 'Chácara São José',
    city: 'Piedade',
    latitude: -23.7119,
    longitude: -47.4276,
    lots: [
      {
        photo: 'cenoura-a',
        crop: 'cenoura',
        grade: 'A',
        confidence: 0.92,
        quantityBoxes: 35,
        boxWeightKg: 20,
        destination: 'MARKETPLACE',
        priceAdjustment: 0.97,
        harvestedHoursAgo: 14,
      },
      {
        photo: 'cenoura-c',
        crop: 'cenoura',
        grade: 'C',
        confidence: 0.86,
        quantityBoxes: 50,
        boxWeightKg: 20,
        destination: 'INDUSTRY',
        priceAdjustment: 1,
        harvestedHoursAgo: 30,
      },
    ],
  },
  {
    phoneNumber: '+5511900000104',
    name: 'Rosa Oliveira',
    farmName: 'Sítio Vale Verde',
    city: 'Registro',
    latitude: -24.4871,
    longitude: -47.8442,
    lots: [
      {
        photo: 'banana-a',
        crop: 'banana',
        grade: 'A',
        confidence: 0.95,
        quantityBoxes: 45,
        boxWeightKg: 18,
        destination: 'MARKETPLACE',
        priceAdjustment: 1.08,
        harvestedHoursAgo: 26,
      },
    ],
  },
  {
    phoneNumber: '+5511900000105',
    name: 'Carlos Nakamura',
    farmName: 'Fazenda Nakamura',
    city: 'Biritiba Mirim',
    latitude: -23.5725,
    longitude: -46.0386,
    lots: [
      {
        photo: 'abobrinha-b',
        crop: 'abobrinha',
        grade: 'B',
        confidence: 0.87,
        quantityBoxes: 30,
        boxWeightKg: 15,
        destination: 'DISCOUNT_MARKETPLACE',
        priceAdjustment: 1,
        harvestedHoursAgo: 8,
      },
      {
        photo: 'pimentao-d',
        crop: 'pimentão',
        grade: 'D',
        confidence: 0.9,
        quantityBoxes: 12,
        boxWeightKg: 10,
        destination: 'DONATION',
        priceAdjustment: 1,
        harvestedHoursAgo: 40,
      },
    ],
  },
  {
    phoneNumber: '+5511900000106',
    name: 'Luzia Santos',
    farmName: 'Sítio Santa Luzia',
    city: 'Itapetininga',
    latitude: -23.5917,
    longitude: -48.0531,
    lots: [
      {
        photo: 'batata-a',
        crop: 'batata',
        grade: 'A',
        confidence: 0.9,
        quantityBoxes: 60,
        boxWeightKg: 25,
        destination: 'MARKETPLACE',
        priceAdjustment: 0.93,
        harvestedHoursAgo: 36,
      },
    ],
  },
  {
    phoneNumber: '+5511900000107',
    name: 'Benedito Ramos',
    farmName: 'Sítio Ramos',
    city: 'Pilar do Sul',
    latitude: -23.8128,
    longitude: -47.7164,
    lots: [
      {
        photo: 'mandioca-a',
        crop: 'mandioca',
        grade: 'A',
        confidence: 0.89,
        quantityBoxes: 40,
        boxWeightKg: 25,
        destination: 'MARKETPLACE',
        priceAdjustment: 1.02,
        harvestedHoursAgo: 18,
      },
    ],
  },
  {
    phoneNumber: '+5511900000108',
    name: 'Ana Paula Ferreira',
    farmName: 'Sítio Primavera',
    city: 'Atibaia',
    latitude: -23.1171,
    longitude: -46.5563,
    lots: [
      {
        photo: 'tomate-a2',
        crop: 'tomate',
        grade: 'A',
        confidence: 0.92,
        quantityBoxes: 28,
        boxWeightKg: 20,
        destination: 'MARKETPLACE',
        priceAdjustment: 1.06,
        harvestedHoursAgo: 12,
      },
    ],
  },
];

const BUYERS = [
  {
    phoneNumber: '+5511900000201',
    name: 'Restaurante Sabor da Terra',
    buyerType: 'RESTAURANT' as const,
    document: '12345678000190',
    deliveryAddress: 'Rua Augusta, 1500 - São Paulo/SP',
    latitude: -23.5614,
    longitude: -46.6559,
  },
  {
    phoneNumber: '+5511900000202',
    name: 'Mercado Bom Preço',
    buyerType: 'RETAIL' as const,
    document: '98765432000110',
    deliveryAddress: 'Av. Salgado Filho, 800 - Guarulhos/SP',
    latitude: -23.4628,
    longitude: -46.5333,
  },
  {
    phoneNumber: '+5511900000203',
    name: 'Carla Mendes',
    buyerType: 'CONSUMER' as const,
    document: '52998224725',
    deliveryAddress: 'Rua Ipiranga, 300 - Mogi das Cruzes/SP',
    latitude: -23.5226,
    longitude: -46.1883,
  },
];

const roundToHalf = (value: number) => Math.round(value * 2) / 2;

function assertLocalDatabase(): void {
  const uri = process.env.MONGODB_URI ?? '';
  const isLocal = /mongodb:\/\/(localhost|127\.0\.0\.1|mongodb)(:\d+)?\//.test(uri);
  if (!isLocal) throw new Error(`seed:demo só roda em banco local. MONGODB_URI atual não é local.`);
  if (!process.argv.includes('--reset')) {
    throw new Error('Este script APAGA o banco local. Rode com --reset para confirmar.');
  }
}

async function seedDemoCatalog(): Promise<void> {
  assertLocalDatabase();
  const app = await NestFactory.createApplicationContext(CoreModule, { logger: ['error', 'warn'] });

  await app.get<Connection>(getConnectionToken()).dropDatabase();
  console.log('Banco local apagado');

  const userRepository = app.get<UserRepository>(USER_REPOSITORY);
  const harvestLotRepository = app.get<HarvestLotRepository>(HARVEST_LOT_REPOSITORY);
  const photoStorage = app.get<PhotoStorage>(PHOTO_STORAGE);
  const priceSuggester = app.get(LotPriceSuggester);
  const destinationPolicy = app.get(LotDestinationPolicy);

  const createUser = async (phoneNumber: string) => {
    const user = User.createFromPhone(phoneNumber);
    await userRepository.save(user);
    return user;
  };
  const asAuthenticated = (user: User) => ({
    userId: user.id,
    phoneNumber: user.phoneNumber,
    roles: [],
  });

  await app.get(RegisterPriceReferenceUseCase).execute(
    PRICE_REFERENCES.map((reference) => ({
      ...reference,
      source: 'EXEMPLO (demonstração) – substituir por CONAB/CEASA',
      referenceDate: new Date(),
    })),
  );

  // Rede de apoio: transportador e ONG (precisam existir antes das ofertas e doações).
  const transporter = await createUser('+5511900000401');
  await app.get(RegisterServiceProviderUseCase).execute(asAuthenticated(transporter), {
    name: 'Fretes Alto Tietê',
    document: '11222333000144',
    serviceTypes: ['TRANSPORT', 'COLD_STORAGE'],
    baseLocation: { latitude: -23.5229, longitude: -46.188 },
    serviceRadiusKm: 200,
    vehicleCapacityKg: 3000,
    hasRefrigeration: true,
    acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION,
  });
  // Preços divulgados pelo transportador (aparecem na aba "Frete e serviços" do produtor)
  await app.get(UpdateServiceProviderProfileUseCase).execute(transporter.id, {
    name: 'Fretes Alto Tietê',
    offerings: [
      { serviceType: 'TRANSPORT', price: 2.2, baseFee: 35, description: 'Caminhão baú refrigerado 3 t' },
      { serviceType: 'COLD_STORAGE', price: 1.4 },
    ],
    baseLocation: { latitude: -23.5229, longitude: -46.188 },
    serviceRadiusKm: 200,
    vehicleCapacityKg: 3000,
    hasRefrigeration: true,
  });
  await app.get(ApproveServiceProviderUseCase).execute(transporter.id);

  // Prestador de serviços (sem frete): embalagem, classificação e assistência técnica
  const serviceProvider = await createUser('+5511900000402');
  const serviceProviderProfile = {
    name: 'Agro Serviços Mogi',
    baseLocation: { latitude: -23.5317, longitude: -46.1922 },
    serviceRadiusKm: 80,
    hasRefrigeration: false,
  };
  await app.get(RegisterServiceProviderUseCase).execute(asAuthenticated(serviceProvider), {
    ...serviceProviderProfile,
    document: '33444555000166',
    serviceTypes: ['PACKING', 'GRADING', 'TECHNICAL_ASSISTANCE'],
    acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION,
  });
  await app.get(UpdateServiceProviderProfileUseCase).execute(serviceProvider.id, {
    ...serviceProviderProfile,
    offerings: [
      { serviceType: 'PACKING', price: 1.8, description: 'Lavagem, seleção e embalagem em caixa K' },
      { serviceType: 'GRADING', price: 120, description: 'Classificação presencial do lote' },
      { serviceType: 'TECHNICAL_ASSISTANCE', price: 180, description: 'Visita de agrônomo' },
    ],
  });
  await app.get(ApproveServiceProviderUseCase).execute(serviceProvider.id);

  const ngo = await createUser('+5511900000301');
  await app.get(RegisterNgoUseCase).execute(asAuthenticated(ngo), {
    name: 'Banco de Alimentos Alto Tietê',
    document: '44555666000177',
    location: { latitude: -23.5236, longitude: -46.1857 },
    address: 'Rua Dr. Deodato Wertheimer, 200 - Mogi das Cruzes/SP',
    pickupRadiusKm: 80,
    acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION,
  });
  await app.get(ApproveNgoUseCase).execute(ngo.id);

  // Produtores, lotes fotografados, classificação e destino.
  const offerIdsByPhoto = new Map<string, { offerId: string; producerId: string }>();
  const donationIds: string[] = [];
  for (const producer of PRODUCERS) {
    const user = await createUser(producer.phoneNumber);
    await app.get(RegisterProducerUseCase).execute(user.id, {
      name: producer.name,
      farmName: producer.farmName,
      city: producer.city,
      state: 'SP',
      farmLocation: { latitude: producer.latitude, longitude: producer.longitude },
      crops: [...new Set(producer.lots.map((lot) => lot.crop))],
      acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION,
    });

    for (const lot of producer.lots) {
      const photo = readFileSync(resolve(PHOTOS_DIRECTORY, `${lot.photo}.jpg`));
      const photoKey = await photoStorage.savePhoto(user.id, photo, 'image/jpeg');
      const harvestLot = HarvestLot.create({
        producerId: user.id,
        crop: lot.crop,
        quantityBoxes: lot.quantityBoxes,
        boxWeightKg: lot.boxWeightKg,
        photoKeys: [photoKey],
        harvestedAt: new Date(Date.now() - lot.harvestedHoursAgo * 3_600_000),
      });
      const suggestedPrice = await priceSuggester.suggestPricePerBox({
        crop: lot.crop,
        grade: lot.grade,
        boxWeightKg: lot.boxWeightKg,
      });
      harvestLot.applyClassification(
        {
          grade: lot.grade,
          confidence: lot.confidence,
          defects: DEFECTS_BY_GRADE[lot.grade],
          estimatedWeightKg: null,
          classifierName: 'demonstração',
        },
        destinationPolicy.recommendDestination(lot.grade),
        suggestedPrice,
      );
      await harvestLotRepository.save(harvestLot);

      const result = await app.get(ConfirmLotDestinationUseCase).execute(user.id, harvestLot.id, {
        destination: lot.destination,
        pricePerBox: suggestedPrice ? roundToHalf(suggestedPrice * lot.priceAdjustment) : undefined,
      });
      if (result.offerId)
        offerIdsByPhoto.set(lot.photo, { offerId: result.offerId, producerId: user.id });
      if (result.donationId) donationIds.push(result.donationId);
    }
  }
  console.log(
    `${PRODUCERS.length} produtores, ${offerIdsByPhoto.size} ofertas, ${donationIds.length} doação`,
  );

  // Compradores e pedidos (pagos e entregues) para o painel de impacto ter números reais.
  const buyerUsers: User[] = [];
  for (const buyer of BUYERS) {
    const user = await createUser(buyer.phoneNumber);
    await app.get(RegisterBuyerUseCase).execute(asAuthenticated(user), {
      name: buyer.name,
      buyerType: buyer.buyerType,
      document: buyer.document,
      deliveryAddress: buyer.deliveryAddress,
      deliveryLocation: { latitude: buyer.latitude, longitude: buyer.longitude },
      acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION,
    });
    buyerUsers.push(user);
  }

  const purchases = [
    {
      buyer: buyerUsers[0],
      items: [
        { photo: 'tomate-a', boxes: 10 },
        { photo: 'alface-a', boxes: 12 },
      ],
      delivered: true,
    },
    {
      buyer: buyerUsers[1],
      items: [
        { photo: 'batata-a', boxes: 20 },
        { photo: 'banana-a', boxes: 15 },
      ],
      delivered: false,
    },
  ];
  let ordersCreated = 0;
  for (const purchase of purchases) {
    const orders = await app.get(CreateOrderUseCase).execute(purchase.buyer.id, {
      items: purchase.items.map((item) => ({
        offerId: offerIdsByPhoto.get(item.photo)!.offerId,
        boxes: item.boxes,
      })),
      deliveryMode: 'PLATFORM_FREIGHT',
      extraServices: [],
    });
    for (const order of orders) {
      await app.get(HandlePaymentConfirmedUseCase).execute(order.id);
      await app.get(AcceptOrderUseCase).execute(order.producerId, order.id);
      if (purchase.delivered)
        await app.get(ConfirmOrderDeliveryUseCase).execute(purchase.buyer.id, order.id);
      ordersCreated += 1;
    }
  }

  for (const donationId of donationIds) {
    await app.get(AcceptDonationUseCase).execute(ngo.id, donationId);
    await app
      .get(ConfirmDonationReceiptUseCase)
      .execute(ngo.id, donationId, { receivedWeightKg: 115 });
  }
  console.log(
    `${BUYERS.length} compradores, ${ordersCreated} pedidos pagos, doação recebida pela ONG`,
  );

  console.log('Telefones para entrar (o código aparece no log da API):');
  for (const producer of PRODUCERS)
    console.log(`  produtor  ${producer.phoneNumber}  ${producer.name}`);
  for (const buyer of BUYERS) console.log(`  comprador ${buyer.phoneNumber}  ${buyer.name}`);
  console.log(`  ONG       +5511900000301  Banco de Alimentos Alto Tietê`);
  console.log(`  frete     +5511900000401  Fretes Alto Tietê`);
  console.log(`  serviços  +5511900000402  Agro Serviços Mogi`);
  await app.close();
}

seedDemoCatalog().catch((error: unknown) => {
  new Logger('seed:demo').error(error instanceof Error ? error.message : error);
  process.exit(1);
});
