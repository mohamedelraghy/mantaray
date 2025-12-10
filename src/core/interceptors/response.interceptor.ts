import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '../shared/response.dto';
import { Pagination } from '../shared/pagination.dto';
import { SUCCESS_MESSAGE_KEY } from '../decorators/success-message.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof Pagination) {
          const response: SuccessResponse = {
            success: true,
            message: this.getSuccessMessage(context),
            data: data.content,
            pagination: data.toPaginationMeta(),
          };
          return response;
        }

        if (data && typeof data === 'object' && 'content' in data && 'count' in data) {
          const pagination = data as Pagination;
          const response: SuccessResponse = {
            success: true,
            message: this.getSuccessMessage(context),
            data: pagination.content,
            pagination: pagination.toPaginationMeta(),
          };
          return response;
        }

        const response: SuccessResponse = {
          success: true,
          message: this.getSuccessMessage(context),
          data,
        };

        return response;
      }),
    );
  }

  private getSuccessMessage(context: ExecutionContext): string {
    const customMessage = this.reflector.get<string>(
      SUCCESS_MESSAGE_KEY,
      context.getHandler(),
    );

    if (customMessage) {
      return customMessage;
    }

    const handler = context.getHandler();
    const controller = context.getClass();
    const method = context.switchToHttp().getRequest().method;
    const path = context.switchToHttp().getRequest().route?.path || '';

    const methodMessages: Record<string, string> = {
      GET: 'Data retrieved successfully',
      POST: 'Resource created successfully',
      PUT: 'Resource updated successfully',
      PATCH: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    };

    const defaultMessage = methodMessages[method] || 'Operation completed successfully';

    if (path.includes('search') || path.includes('find')) {
      return 'Data retrieved successfully';
    }

    return defaultMessage;
  }
}

