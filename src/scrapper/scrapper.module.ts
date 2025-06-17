import { Module } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobLink, JobLinkSchema } from './schemas/jobLink.schema';
import { ScrapperController } from './scrapper.controller';
import {
  ScrapperInfo,
  ScrapperInfoSchema,
} from './schemas/scrapperInfo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: JobLink.name, schema: JobLinkSchema }]),
    MongooseModule.forFeature([
      { name: ScrapperInfo.name, schema: ScrapperInfoSchema },
    ]),
  ],
  providers: [ScrapperService],
  controllers: [ScrapperController],
})
export class ScrapperModule {}
