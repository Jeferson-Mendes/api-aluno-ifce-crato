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
import { CourseType, RolesEnum, UserType } from 'src/ts/enums';

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
  @ApiProperty({ required: false })
  readonly file?: string;

  @IsOptional()
  @IsEnum(CourseType, {
    message: 'Please provide a valid value for course type',
  })
  @ApiProperty({ required: false, enum: CourseType })
  readonly course?: string;

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

  @IsNotEmpty()
  @IsEnum(UserType, {
    message: 'Please provide a valid value for user type',
  })
  @ApiProperty({ enum: UserType, required: true })
  readonly type: UserType;

  @IsEmpty({ message: 'You cannot provide roles' })
  readonly roles: RolesEnum[];

  @IsEmpty({ message: 'You cannot provide the isActive status' })
  readonly isActive: boolean;
}
