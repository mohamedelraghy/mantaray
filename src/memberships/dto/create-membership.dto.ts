import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { toObjectId } from 'src/core/utils/mongo.util';

export class CreateMembershipDto {
  @IsNotEmpty()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ 
    required: true, 
    example: '507f1f77bcf86cd799439011',
    description: 'The ID of the user to assign credits to'
  })
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({ 
    type: Number, 
    required: true, 
    example: 50, 
    minimum: 1,
    description: 'Number of credits to add to the user'
  })
  creditsToAdded: number;
}
