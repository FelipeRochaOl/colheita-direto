import { applyDecorators, Body } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { toJSONSchema, ZodType } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

/** Valida o body com um schema zod compartilhado e documenta o mesmo schema no Swagger. */
export function ValidatedBody<Output>(schema: ZodType<Output>): ParameterDecorator {
  return Body(new ZodValidationPipe(schema));
}

export function ApiBodyFromSchema(schema: ZodType): MethodDecorator {
  return applyDecorators(ApiBody({ schema: toJSONSchema(schema, { unrepresentable: 'any' }) as object }));
}
