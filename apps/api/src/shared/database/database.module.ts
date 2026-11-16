import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../config/app-config.service';

/** Conexão MongoDB (local em Docker, produção no MongoDB Atlas). Pool pequeno por causa do M0. */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService) => ({
        uri: appConfig.get('MONGODB_URI'),
        maxPoolSize: 10,
      }),
    }),
  ],
})
export class DatabaseModule {}
