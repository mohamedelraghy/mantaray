import { SetMetadata } from '@nestjs/common';

import { RoleEnum } from '../users/enums/role.enum';

export const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);
