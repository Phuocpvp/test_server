// sleep.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SleepDocument = Sleep & Document;

@Schema()
export class Sleep {
  @Prop()
  sleepTime: number;

  @Prop()
  Start: Date;

  @Prop()
  End: Date;
}

export const SleepSchema = SchemaFactory.createForClass(Sleep);