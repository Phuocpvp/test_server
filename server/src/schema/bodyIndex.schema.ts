// bodyIndex.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BodyIndexDocument = BodyIndex & Document;

@Schema()
export class BodyIndex {
  @Prop()
  Weigh: number;

  @Prop()
  BMI: number;

  @Prop()
  Height: number;
}

export const BodyIndexSchema = SchemaFactory.createForClass(BodyIndex);
