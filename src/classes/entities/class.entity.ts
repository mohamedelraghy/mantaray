import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { BaseEntity } from '../../core/entities/base.entity';

export type ClassDoc = Class & Document;

@Schema({ timestamps: true, id: true, versionKey: false })
export class Class extends BaseEntity {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date, required: true })
  endTime: Date;

  @Prop({ type: Number, required: true, min: 1 })
  capacity: number;

  @Prop({ type: Number, required: true, min: 0 })
  remainingCapacity: number;

  @Prop({ type: Number, required: true, min: 0 })
  creditCost: number;
}

export const classSchema = SchemaFactory.createForClass(Class);
