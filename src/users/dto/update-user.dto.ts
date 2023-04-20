import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  readonly name: string;

  @IsOptional()
  @IsPhoneNumber('BR')
  @ApiProperty({ required: false })
  readonly phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  readonly file: string;
}

export class ApiResponseUpdateUser {
  @ApiProperty({ required: false })
  userId: string;
}
