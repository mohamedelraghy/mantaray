import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(HttpExceptionFilter.name);
  }

  catch(exception: any, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const code = exception.code;
    const message = exception.message || 'Internal server error';
    const error = exception.error;

    response.status(code).json({
      success: false,
      message,
      error
    });
  }  
}
