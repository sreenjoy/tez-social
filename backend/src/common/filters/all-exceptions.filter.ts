import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Log the exception with stack trace
    this.logger.error(
      `Unhandled Exception: ${exception.message || 'Unknown error'}`,
      exception.stack,
    );

    // Determine status code
    const status =
      exception.status || exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

    // Prepare safe response
    const responseBody = {
      statusCode: status,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : (exception.message || 'Internal server error'),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(responseBody);
  }
} 