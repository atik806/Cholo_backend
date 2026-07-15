import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        message = (obj.message as string) || exception.message;
        errors = obj.errors;
      }

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(`HTTP ${status}: ${message}`, exception.stack);
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Non-Error exception thrown: ${JSON.stringify(exception)}`,
      );
    }

    const sanitized =
      status >= HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : message;

    response.status(status).json({
      success: false,
      message: sanitized,
      ...(errors ? { errors } : {}),
      statusCode: status,
    });
  }
}
