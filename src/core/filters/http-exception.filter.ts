import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Request as ExpressRequest } from 'express-serve-static-core';
import { ErrorResponse } from '../shared/response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(HttpExceptionFilter.name);
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<ExpressRequest & { session?: { id: string } }>();
    const { url, method } = request;
    const requestId = request?.session?.id || 'unknown';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      const { errorCode, message, details } = this.handleHttpException(
        status,
        exception,
        exceptionResponse,
      );

      const errorResponse: ErrorResponse = {
        success: false,
        message,
        error: {
          code: errorCode,
          details,
        },
      };

      this.logger.error({ requestId, status, errorResponse, url, method });

      return response.status(status).json(errorResponse);
    }

    const status = exception.graph
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: ErrorResponse = {
      success: false,
      message: exception instanceof Error ? exception.message : 'Internal server error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        details: {},
      },
    };

    this.logger.error({ requestId, status, errorResponse, url, method, exception });

    return response.status(status).json(errorResponse);
  }

  private handleHttpException(
    status: number,
    exception: HttpException,
    exceptionResponse: string | object,
  ): { errorCode: string; message: string; details: any } {
    const config = this.getStatusConfig(status);
    const responseObj = this.getResponseObject(exceptionResponse);
    const exceptionAny = exception as any;

    const errorCode = responseObj.code || exceptionAny.code || config.errorCode;
    const message = this.extractMessage(exception, exceptionResponse, responseObj, config.defaultMessage);
    const details = this.extractDetails(
      exception,
      responseObj,
      exceptionAny,
      config.defaultDetails,
      config.extractDetailsFromException,
    );

    return { errorCode, message, details };
  }

  private getStatusConfig(status: number): {
    errorCode: string;
    defaultMessage: string;
    defaultDetails: any;
    extractDetailsFromException: boolean;
  } {
    const configs: Record<number, {
      errorCode: string;
      defaultMessage: string;
      defaultDetails: any;
      extractDetailsFromException: boolean;
    }> = {
      [HttpStatus.BAD_REQUEST]: {
        errorCode: 'VALIDATION_ERROR',
        defaultMessage: 'Validation failed',
        defaultDetails: {},
        extractDetailsFromException: true,
      },
      [HttpStatus.UNAUTHORIZED]: {
        errorCode: 'UNAUTHORIZED',
        defaultMessage: 'Authentication required',
        defaultDetails: 'X-User-Role header is missing or invalid',
        extractDetailsFromException: false,
      },
      [HttpStatus.FORBIDDEN]: {
        errorCode: 'FORBIDDEN',
        defaultMessage: 'You do not have permission to perform this action',
        defaultDetails: 'Admin role required for this operation',
        extractDetailsFromException: false,
      },
      [HttpStatus.NOT_FOUND]: {
        errorCode: 'NOT_FOUND',
        defaultMessage: 'Resource not found',
        defaultDetails: {},
        extractDetailsFromException: true,
      },
      [HttpStatus.CONFLICT]: {
        errorCode: 'CONFLICT',
        defaultMessage: 'Resource conflict',
        defaultDetails: {},
        extractDetailsFromException: true,
      },
      [HttpStatus.UNPROCESSABLE_ENTITY]: {
        errorCode: 'VALIDATION_ERROR',
        defaultMessage: 'Validation failed',
        defaultDetails: {},
        extractDetailsFromException: true,
      },
    };

    return (
      configs[status] || {
        errorCode: this.getErrorCodeFromStatus(status),
        defaultMessage: 'An error occurred',
        defaultDetails: {},
        extractDetailsFromException: false,
      }
    );
  }

  private extractMessage(
    exception: HttpException,
    exceptionResponse: string | object,
    responseObj: any,
    defaultMessage: string,
  ): string {
    if (responseObj.message) {
      if (Array.isArray(responseObj.message)) {
        return 'Validation failed';
      }
      return responseObj.message;
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    return exception.message || defaultMessage;
  }

  private extractDetails(
    exception: HttpException,
    responseObj: any,
    exceptionAny: any,
    defaultDetails: any,
    extractFromException?: boolean,
  ): any {
    if (responseObj.details) {
      return responseObj.details;
    }

    if (responseObj.error && Array.isArray(responseObj.error)) {
      return responseObj.error;
    }

    if (responseObj.message && Array.isArray(responseObj.message)) {
      return responseObj.message.map((msg: any) => {
        if (typeof msg === 'string') {
          return { message: msg };
        }
        return {
          field: msg.property || msg.field,
          message: msg.constraints ? Object.values(msg.constraints)[0] : msg.message,
        };
      });
    }

    if (!extractFromException) {
      return defaultDetails;
    }

    if (exceptionAny.resource) {
      const details: any = {
        resource: exceptionAny.resource,
      };
      
      if (exceptionAny.field && exceptionAny.value) {
        details[exceptionAny.field] = exceptionAny.value;
      } else if (exceptionAny.id) {
        details.id = exceptionAny.id;
      }
      
      return details;
    }

    if (exceptionAny.field) {
      return {
        field: exceptionAny.field,
        ...(exceptionAny.value && { value: exceptionAny.value }),
      };
    }

    return defaultDetails;
  }

  private getResponseObject(exceptionResponse: string | object): any {
    return typeof exceptionResponse === 'object' && exceptionResponse !== null
      ? (exceptionResponse as any)
      : {};
  }

  private getErrorCodeFromStatus(status: number): string {
    const statusCodeMap: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return statusCodeMap[status] || 'UNKNOWN_ERROR';
  }
}
