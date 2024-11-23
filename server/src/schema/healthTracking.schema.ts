// healthTracking.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BodyIndex, BodyIndexSchema } from './bodyIndex.schema';
import { Sleep, SleepSchema } from './sleep.schema';
import { User, UserSchema } from './user.schema';

export type HealthTrackingDocument = HealthTracking & Document;

@Schema()
export class HealthTracking {

  // Thêm một thuộc tính user để liên kết với User
  @Prop({ type: Types.ObjectId, ref: 'User'})
  user: Types.ObjectId; // Kiểu ObjectId và tham chiếu đến schema User

  @Prop()
  Day: Date;

  @Prop({ type: BodyIndexSchema})
  BODYINDEX: BodyIndex;

  @Prop({ type: SleepSchema})
  SLEEP: Sleep;
}

export const HealthTrackingSchema = SchemaFactory.createForClass(HealthTracking);
