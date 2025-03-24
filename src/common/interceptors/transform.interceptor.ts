import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map(data => {
        // If the data already has a defined structure, return it as is
        if (data && data.statusCode && data.message) {
          return data;
        }

        // Extract message from data if it exists
        let message = 'Success';
        if (data && data.message) {
          message = data.message;
          delete data.message;
        }

        // For responses directly returning strings
        if (typeof data === 'string') {
          return {
            statusCode,
            message: data,
            data: null,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        return {
          statusCode,
          message,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
} 