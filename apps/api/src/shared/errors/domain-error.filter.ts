import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  AccessDeniedError,
  BusinessRuleViolationError,
  DomainError,
  EntityNotFoundError,
  InvalidCredentialsError,
} from './domain-error';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(this.toHttpStatus(error)).json({ code: error.code, message: error.message });
  }

  private toHttpStatus(error: DomainError): number {
    if (error instanceof EntityNotFoundError) return HttpStatus.NOT_FOUND;
    if (error instanceof AccessDeniedError) return HttpStatus.FORBIDDEN;
    if (error instanceof InvalidCredentialsError) return HttpStatus.UNAUTHORIZED;
    if (error instanceof BusinessRuleViolationError) return HttpStatus.UNPROCESSABLE_ENTITY;
    return HttpStatus.BAD_REQUEST;
  }
}
