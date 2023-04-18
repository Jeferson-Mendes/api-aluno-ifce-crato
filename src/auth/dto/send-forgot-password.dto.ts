import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendForgotPassDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Pleace enter a correct email.' })
  @ApiProperty()
  readonly email: string;
}
