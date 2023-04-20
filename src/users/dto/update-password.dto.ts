import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly newPassword: string;
}
