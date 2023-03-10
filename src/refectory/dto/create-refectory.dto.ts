import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class MenuDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  breakfast: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  lunch: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  afternoonSnack: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  dinner: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  nightSnack: string;
}

export class CreateRefectoryDto {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  startAnswersDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  closingDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  vigencyDate: Date;

  @IsObject()
  @ValidateNested()
  @Type(() => MenuDto)
  @ApiProperty()
  menu: MenuDto;
}
