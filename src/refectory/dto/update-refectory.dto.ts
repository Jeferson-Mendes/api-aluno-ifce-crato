import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
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

export class UpdateRefectoryDto {
  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  startAnswersDate: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  closingDate: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  vigencyDate: Date;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MenuDto)
  @ApiProperty({ required: false })
  menu: MenuDto;
}

export class ApiResponseUpdate {
  @ApiProperty({ required: false })
  refectoryId: string;
}
