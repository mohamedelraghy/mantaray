import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { BaseEntity } from '../../core/entities/base.entity';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';
import { BookingStatus } from '../enums/booking-status.enum';

export type BookingDoc = Booking & Document;

@Schema({ timestamps: true, id: true, versionKey: false })
export class Booking extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: Class.name, required: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date, required: true })
  endTime: Date;

  @Prop({ type: String, enum: Object.values(BookingStatus), default: BookingStatus.CONFIRMED })
  status: BookingStatus;
}

export const bookingSchema = SchemaFactory.createForClass(Booking);


