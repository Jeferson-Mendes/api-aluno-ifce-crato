import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendEmailConfirmationCodeDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'Pleace enter a correct email.' })
  @ApiProperty()
  readonly email: string;
}
