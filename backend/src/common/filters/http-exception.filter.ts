import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // Don't log 401/403 errors as they're common and expected
    if (status !== HttpStatus.UNAUTHORIZED && status !== HttpStatus.FORBIDDEN) {
      this.logger.error(
        `HTTP Exception: ${status} - ${request.method} ${request.url}`,
        exception.stack,
      );
    }

    let responseBody;
    if (typeof errorResponse === 'object') {
      responseBody = {
        ...errorResponse,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else {
      responseBody = {
        statusCode: status,
        message: errorResponse,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    // Sanitize error response for 500 errors in production
    if (status === HttpStatus.INTERNAL_SERVER_ERROR && process.env.NODE_ENV === 'production') {
      responseBody = {
        statusCode: status,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    response.status(status).json(responseBody);
  }
} 