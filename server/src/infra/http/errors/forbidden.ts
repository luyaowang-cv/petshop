import { Forbidden } from '@app/use-cases/errors/forbidden';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(Forbidden)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: Forbidden, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.FORBIDDEN;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      http: {
        path: request.url,
        method: request.method,
      },
      name: 'Forbidden',
      message: exception.message,
    });
  }
}
