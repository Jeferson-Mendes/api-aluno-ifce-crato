import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RolesEnum } from 'src/ts/enums';

export class UpdateUserRolesDto {
  @IsNotEmpty()
  @IsEnum(RolesEnum, {
    each: true,
    message: 'Please provide a valid value for user role',
  })
  @ApiProperty({ enum: RolesEnum, required: false, isArray: true })
  readonly roles: RolesEnum[];
}

export class ApiResponseUpdateUserRoles {
  @ApiProperty({ required: false })
  userId: string;
}
