import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HarvestLotsModule } from '../harvest-lots/harvest-lots.module';
import { ProducersModule } from '../producers/producers.module';
import { NgosController } from './controllers/ngos.controller';
import { DONATION_REPOSITORY } from './repositories/donation.repository';
import { MongoDonationRepository } from './repositories/mongo-donation.repository';
import { MongoNgoRepository } from './repositories/mongo-ngo.repository';
import { NGO_REPOSITORY } from './repositories/ngo.repository';
import { DonationDocument, DonationSchema } from './schemas/donation.schema';
import { NgoDocument, NgoSchema } from './schemas/ngo.schema';
import { AcceptDonationUseCase } from './use-cases/accept-donation.use-case';
import { ApproveNgoUseCase } from './use-cases/approve-ngo.use-case';
import { ConfirmDonationReceiptUseCase } from './use-cases/confirm-donation-receipt.use-case';
import { GetNgoProfileUseCase } from './use-cases/get-ngo-profile.use-case';
import { ListAvailableDonationsUseCase } from './use-cases/list-available-donations.use-case';
import { OfferDonationUseCase } from './use-cases/offer-donation.use-case';
import { RegisterNgoUseCase } from './use-cases/register-ngo.use-case';
import { UpdateNgoProfileUseCase } from './use-cases/update-ngo-profile.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NgoDocument.name, schema: NgoSchema },
      { name: DonationDocument.name, schema: DonationSchema },
    ]),
    HarvestLotsModule,
    ProducersModule,
  ],
  controllers: [NgosController],
  providers: [
    { provide: NGO_REPOSITORY, useClass: MongoNgoRepository },
    { provide: DONATION_REPOSITORY, useClass: MongoDonationRepository },
    RegisterNgoUseCase,
    ApproveNgoUseCase,
    OfferDonationUseCase,
    ListAvailableDonationsUseCase,
    AcceptDonationUseCase,
    ConfirmDonationReceiptUseCase,
    GetNgoProfileUseCase,
    UpdateNgoProfileUseCase,
  ],
  exports: [DONATION_REPOSITORY, OfferDonationUseCase],
})
export class SurplusModule {}
