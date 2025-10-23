import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { toObjectId } from 'src/core/utils/mongo.util';

export class CreateBookingDto {
  @IsNotEmpty()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ required: true, example: '507f1f77bcf86cd799439011' })
  classId: string;
}


