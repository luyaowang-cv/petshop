import { BadRequest } from '@app/use-cases/errors/bad-request';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequest)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequest, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      http: {
        path: request.url,
        method: request.method,
      },
      name: 'BadRequest',
      message: exception.message,
    });
  }
}
