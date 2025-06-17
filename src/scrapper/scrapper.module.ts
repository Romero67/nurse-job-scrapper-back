import { Module } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobLink, JobLinkSchema } from './schemas/jobLink.schema';
import { Job, JobSchema } from './schemas/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobLink.name, schema: JobLinkSchema },
      { name: Job.name, schema: JobSchema },
    ]),
  ],
  providers: [ScrapperService],
})
export class ScrapperModule {}
