import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { BaseEntity } from '../../core/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { ObjectId } from 'src/core/utils/mongo.util';

export type MembershipDoc = Membership & Document;

@Schema({ timestamps: true, id: true, versionKey: false })
export class Membership extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: ObjectId;

  @Prop({ type: Number, required: true, min: 1 })
  creditsToAdded: number;
}

export const membershipSchema = SchemaFactory.createForClass(Membership);
