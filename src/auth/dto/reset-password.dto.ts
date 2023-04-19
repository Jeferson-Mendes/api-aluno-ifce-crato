import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ResetPassDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(4)
  @ApiProperty()
  readonly code: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly newPassword: string;
}
