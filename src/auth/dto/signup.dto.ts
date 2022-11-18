import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmpty,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum UserRolesEnumDto {
  STUDENT = 'Student',
  EMPLOYEE = 'employee',
  EXTERNAL = 'External',
}

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

  @IsNotEmpty()
  @IsPhoneNumber('BR')
  @ApiProperty()
  readonly phoneNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly registration?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly siap?: string;

  @IsNotEmpty()
  @IsEnum(UserRolesEnumDto, {
    each: true,
    message: 'Please provide a valid value for user role',
  })
  @ApiProperty({ enum: UserRolesEnumDto, required: false, isArray: true })
  readonly userRoles: UserRolesEnumDto[];

  @IsEmpty({ message: 'You cannot provide the isActive status' })
  readonly isActive: boolean;
}
