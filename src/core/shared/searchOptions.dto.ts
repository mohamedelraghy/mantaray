import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class SearchOptions {
  @IsNumber()
  @Min(0)
  @ApiProperty({ required: true, type: Number, example: 0 })
  offset: number;

  @IsPositive()
  @ApiProperty({ required: true, type: Number, example: 10 })
  size: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, type: String, example: 'createdAt' })
  sort? = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({ required: false, type: String, example: 'asc' })
  dir? = 'desc';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.replace(/[<>*()?]/g, '\\$&'))
  @ApiProperty({ required: false, type: String, example: 'search term' })
  searchTerm? = '';

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @ApiProperty({
    required: false,
    type: [Object],
    example: [{ attr: 'value' }],
  })
  filterBy?: Record<string, any>[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String], example: ['attr1', 'attr2'] })
  attributesToRetrieve?: string[] = [];

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    type: Date,
    required: false,
    example: new Date().toISOString().split('T')[0],
  })
  filterByDateFrom?: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    type: Date,
    required: false,
    example: new Date().toISOString().split('T')[0],
  })
  filterByDateTo?: Date;
}
