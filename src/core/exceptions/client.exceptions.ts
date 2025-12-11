import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BadRequestException extends BaseException {

  constructor(message: string, error: { code: string, details: string | Record<string, any> | Record<string, any>[] }) {

    super(
      message,
      error,
      HttpStatus.BAD_REQUEST
    );
  }
}

// export class UnauthorizedException extends BaseException {

//   constructor(message?: string, displayMessage?: string) {

//     super(
//       message,
//       displayMessage,
//       HttpConstants.CLIENT_ERROR.UNAUTHORIZED.CODE
//     );
//   }
// }

// export class ForbiddenException extends BaseException {

//   constructor(message?: string, displayMessage?: string) {

//     super(
//       message,
//       displayMessage,
//       HttpConstants.CLIENT_ERROR.FORBIDDEN.CODE
//     );
//   }
// }

// export class NotFoundException extends BaseException {

//   constructor(message?: string, displayMessage?: string) {

//     super(
//       message,
//       displayMessage,
//       HttpConstants.CLIENT_ERROR.NOT_FOUND.CODE
//     );
//   }
// }

// export class MethodNotAllowedException extends BaseException {

//   constructor(message?: string, displayMessage?: string) {

//     super(
//       message,
//       displayMessage,
//       HttpConstants.CLIENT_ERROR.METHOD_NOT_ALLOWED.CODE
//     );
//   }
// }

// export class ConflictException extends BaseException {

//   constructor(message?: string, displayMessage?: string) {

//     super(
//       message,
//       displayMessage,
//       HttpConstants.CLIENT_ERROR.CONFLICT.CODE
//     );
//   }
// }

// export class UnprocessableEntityException extends BaseException {

//   constructor(message?: string, displayMessage?: string) {

//     super(
//       message,
//       displayMessage,
//       HttpConstants.CLIENT_ERROR.UNPROCESSABLE_ENTITY.CODE
//     );
//   }
// }

// export class TooManyRequestsException extends BaseException {

//   constructor(message?: string, displayMessage?: string) {

//     super(
//       message,
//       displayMessage,
//       HttpConstants.CLIENT_ERROR.TOO_MANY_REQUESTS.CODE
//     );
//   }
// }

// export class PayloadTooLargeException extends BaseException {

//   constructor(message?: string, displayMessage?: string) {

//     super(
//       message,
//       displayMessage,
//       HttpConstants.CLIENT_ERROR.PAYLOAD_TOO_LARGE.CODE
//     );
//   }
// }
