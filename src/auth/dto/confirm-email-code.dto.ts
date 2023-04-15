import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ConfirmEmailCodeDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'Pleace enter a correct email.' })
  @ApiProperty()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ maxLength: 4 })
  @MaxLength(4)
  readonly code: string;
}
