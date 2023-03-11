import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RolesEnum } from 'src/ts/enums';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<RolesEnum[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return matchRoles(requiredRoles, user.roles);
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
