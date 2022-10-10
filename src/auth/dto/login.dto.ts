import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Pleace, enter a correct email.' })
  @ApiProperty({ type: String })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  readonly password: string;
}
