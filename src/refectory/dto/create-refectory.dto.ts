import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmpty,
  IsNotEmpty,
  IsNumber,
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
  @IsEmpty({ message: 'You cannot provide start answer date' })
  startAnswersDate: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  vigencyDate: number;

  @IsObject()
  @ValidateNested()
  @Type(() => MenuDto)
  @ApiProperty()
  menu: MenuDto;
}
