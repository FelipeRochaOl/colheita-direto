import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { UserRole } from '@colheita/contracts';
import { AuthenticatedUser } from './authenticated-user';

export const IS_PUBLIC_ROUTE = 'isPublicRoute';
export const REQUIRED_ROLES = 'requiredRoles';

/** Rota acessível sem login (vitrine, webhooks). */
export const PublicRoute = () => SetMetadata(IS_PUBLIC_ROUTE, true);

/** Rota acessível apenas aos papéis informados. */
export const Roles = (...roles: UserRole[]) => SetMetadata(REQUIRED_ROLES, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => context.switchToHttp().getRequest().user,
);
