import { NotFoundException } from '@nestjs/common';

export class RecordNotFoundException extends NotFoundException {
  public readonly code = 'NOT_FOUND';
  public readonly resource: string;
  public readonly field?: string;
  public readonly value?: string;

  constructor(record: string, field: string = 'id', value?: string) {
    const message = value
      ? `${record} with this ${field} not found`
      : `${record} not found`;
    super(message);
    this.resource = record;
    if (value) {
      this.field = field;
      this.value = value;
    }
  }
}
