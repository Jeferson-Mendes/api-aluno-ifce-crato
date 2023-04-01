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
import { RolesEnum, UserType } from 'src/ts/enums';

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

  @IsOptional()
  @IsPhoneNumber('BR')
  @ApiProperty({ required: false })
  readonly phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly registration?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly siap?: string;

  @IsOptional()
  @IsEnum(RolesEnum, {
    each: true,
    message: 'Please provide a valid value for user role',
  })
  @ApiProperty({ enum: RolesEnum, required: false, isArray: true })
  readonly roles: RolesEnum[];

  @IsNotEmpty()
  @IsEnum(UserType, {
    message: 'Please provide a valid value for user type',
  })
  @ApiProperty({ enum: UserType, required: true })
  readonly type: UserType;

  @IsEmpty({ message: 'You cannot provide the isActive status' })
  readonly isActive: boolean;
}
