import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, example: 'Introduction to Programming' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, example: 'Learn the basics of programming with hands-on exercises' })
  description: string;

  @IsDateString()
  @ApiProperty({ type: String, required: true, example: '2024-01-15T10:00:00.000Z' })
  startTime: string;

  @IsDateString()
  @ApiProperty({ type: String, required: true, example: '2024-01-15T12:00:00.000Z' })
  endTime: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({ type: Number, required: true, example: 30, minimum: 1 })
  capacity: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ type: Number, required: true, example: 5, minimum: 0 })
  creditCost: number;
}
