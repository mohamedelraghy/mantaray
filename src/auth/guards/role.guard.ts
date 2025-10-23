import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { RoleEnum } from '../../users/enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    // *No Role specified for this route, allow access
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    return requiredRoles.includes(user.role);
  }
}
