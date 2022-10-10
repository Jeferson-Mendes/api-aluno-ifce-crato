import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmpty,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsOptional,
} from 'class-validator';
import { UserRolesEnum } from '../../users/schemas/user-schema';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  readonly name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Pleace, enter a correct email.' })
  @ApiProperty({ type: String })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @ApiProperty({ type: String })
  readonly password: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  readonly birthDate: Date;

  @IsNotEmpty()
  @IsPhoneNumber('BR')
  @ApiProperty()
  readonly phoneNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly registration?: string;

  @IsEmpty({ message: 'You cannot provide the user role' })
  readonly userRole?: UserRolesEnum;

  @IsEmpty({ message: 'You cannot provide the isActive status' })
  readonly isActive: boolean;
}
