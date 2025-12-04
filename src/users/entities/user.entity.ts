import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { BaseEntity } from '../../core/entities/base.entity';
import { toHash } from '../../core/utils/mongo.util';
import { RoleEnum } from '../enums/role.enum';

export type UserDoc = User & Document;

@Schema({ timestamps: true, id: true, versionKey: false })
export class User extends BaseEntity {
  @Prop({ type: String, required: true, lowercase: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, set: (value: string) => toHash(value) })
  password: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, enum: Object.values(RoleEnum) })
  role: RoleEnum;
}

export const userSchema = SchemaFactory.createForClass(User);
