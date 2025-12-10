import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { QueryOptions } from './query-options.interface';

export class QueryParamsDto implements QueryOptions {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiProperty({ required: false, type: Number, example: 1, default: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @ApiProperty({ required: false, type: Number, example: 10, default: 10 })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, type: String, example: 'laptop' })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, type: String, example: 'price', default: 'createdAt' })
  sort?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({ required: false, enum: ['asc', 'desc'], example: 'asc', default: 'desc' })
  order?: 'asc' | 'desc' = 'desc';

  [key: string]: any;
}

