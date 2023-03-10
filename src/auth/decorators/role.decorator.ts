import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from 'src/ts/enums';

export const Role = (...roles: RolesEnum[]) => SetMetadata('roles', roles);
