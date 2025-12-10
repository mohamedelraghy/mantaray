import { BadRequestException } from '@nestjs/common';

const message = 'id must be a mongodb id';

export class InvalidIdException extends BadRequestException {
  public readonly code = 'INVALID_ID';

  constructor() {
    super(message);
  }
}
