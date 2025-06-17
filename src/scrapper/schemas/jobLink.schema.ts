import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JobLinkDocument = HydratedDocument<JobLink>;

@Schema({
  timestamps: true,
})
export class JobLink {
  @Prop()
  link: string;

  @Prop()
  error?: string;

  @Prop()
  scrapped: boolean;
}

export const JobLinkSchema = SchemaFactory.createForClass(JobLink);
