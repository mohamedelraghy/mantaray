import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Record<string, any> | null;
}

@Injectable()
export class ResponseWrapperInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {

  intercept(_context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {

    return next
      .handle()
      .pipe(
        map(data =>  {
          // Allow controllers to override message: return { message: '...', data: {...} }
          let message = 'Request successful';
          let responseData = data;

          // If controller returns `{ message, data }`, use that
          if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
            message = data.message;
            responseData = data.data;
          }

          return {
            success: true,
            message,
            data: responseData
          };
        })
      );
  }
}
