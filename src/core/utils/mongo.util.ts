import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

export type ObjectId = Types.ObjectId;

export function toObjectId(value: string): string | Types.ObjectId {
  return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value;
}

export function toHash(value: string, rounds = 10): string {
  return value ? bcrypt.hashSync(value, rounds) : value;
}
