import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@colheita/contracts';
import { REQUIRED_ROLES } from './auth.decorators';
import { AuthenticatedUser } from './authenticated-user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(REQUIRED_ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const user: AuthenticatedUser | undefined = context.switchToHttp().getRequest().user;
    const hasRequiredRole = user?.roles.some((role) => requiredRoles.includes(role) || role === 'admin');
    if (!hasRequiredRole) throw new ForbiddenException('Seu perfil não tem acesso a esta ação');
    return true;
  }
}
