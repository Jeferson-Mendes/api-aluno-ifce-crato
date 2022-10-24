import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRolesEnum } from '../../users/schemas/user.schema';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<UserRolesEnum[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return matchRoles(requiredRoles, user.userRoles);
  }
}

function matchRoles(roles: string[], userRoles: string[]) {
  let available = false;
  roles.forEach((role) => {
    if (userRoles.includes(role)) {
      available = true;
    }
  });

  if (!available) {
    throw new ForbiddenException('Sem permissão para acessar este recurso.');
  }

  return true;
}
