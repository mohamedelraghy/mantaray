import { ConflictException } from '@nestjs/common';

export class RecordExistsException extends ConflictException {
  public readonly code: string;
  public readonly field?: string;
  public readonly value?: string;

  constructor(record: string, field?: string, value?: string) {
    
    const message = field 
      ? `${record} with this ${field} already exists`
      : `${record} already exists`;
    super(message);
    this.code = field ? `DUPLICATE_${field.toUpperCase()}` : 'DUPLICATE_RECORD';
    this.field = field;
    this.value = value;
  }
}
