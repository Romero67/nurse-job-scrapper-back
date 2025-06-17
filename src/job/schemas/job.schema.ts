import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JobDocument = HydratedDocument<Job>;

@Schema({
  timestamps: true,
})
export class Job {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  employmentType: string[];

  @Prop({ default: false })
  directApply: boolean;

  @Prop({
    type: {
      name: { type: String, required: true },
      url: { type: String, required: false },
    },
    required: true,
  })
  organization: {
    name: string;
    url: string;
  };

  @Prop({
    type: {
      street: { type: String, required: false },
      locality: { type: String, required: true },
      region: { type: String, required: true },
      postalCode: { type: String, required: false },
      country: { type: String, required: true },
    },
    required: true,
  })
  location: {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string;
  };

  @Prop({ type: [String], default: [] })
  educationRequirements: string[];

  @Prop({ type: String, default: [] })
  experienceRequirements: string;

  @Prop({ type: String, default: '' })
  workHours: string;

  @Prop({
    type: {
      currency: { type: String, required: true },
      amount: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    required: false,
  })
  salary: {
    currency: string;
    amount: number;
    unit: string;
  };

  @Prop({ type: Date, required: false })
  datePosted: Date | undefined;
}

export const JobSchema = SchemaFactory.createForClass(Job);
