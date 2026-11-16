/** Erros de regra de negócio. O filtro global converte cada tipo em status HTTP. */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class EntityNotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(entityName: string, entityId: string) {
    super(`${entityName} ${entityId} não encontrado`);
  }
}

export class BusinessRuleViolationError extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
}

export class AccessDeniedError extends DomainError {
  readonly code = 'ACCESS_DENIED';
}

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
}
