import { SetMetadata } from '@nestjs/common';
import { UserRolesEnum } from 'src/users/schemas/user.schema';

export const Role = (...roles: UserRolesEnum[]) => SetMetadata('roles', roles);
