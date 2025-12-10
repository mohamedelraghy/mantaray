import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  currentPage: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: 48 })
  totalItems: number;

  @ApiProperty({ example: 10 })
  itemsPerPage: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}

export class ErrorDetails {
  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code: string;

  @ApiProperty({ 
    example: [
      { field: 'quantity', message: 'Quantity must be greater than or equal to 0' }
    ],
    description: 'Additional error information'
  })
  details: any;
}

export class SuccessResponse<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Products retrieved successfully' })
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty({ type: PaginationMeta, required: false })
  pagination?: PaginationMeta;
}

export class ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ type: ErrorDetails })
  error: ErrorDetails;
}

