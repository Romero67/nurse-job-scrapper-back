import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ScrapperInfoDocument = HydratedDocument<ScrapperInfo>;

@Schema({
  timestamps: true,
})
export class ScrapperInfo {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: Date })
  lastUpdated: Date;
}

export const ScrapperInfoSchema = SchemaFactory.createForClass(ScrapperInfo);
