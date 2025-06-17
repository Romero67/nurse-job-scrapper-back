import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScrapperModule } from './scrapper/scrapper.module';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { JobModule } from './job/job.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get('db_uri'),
        retryAttempts: 5,
        retryDelay: 3000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    {
      module: ScrapperModule,
      imports: [JobModule],
    },
    JobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
