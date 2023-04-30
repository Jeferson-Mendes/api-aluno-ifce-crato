import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRefectoryDto {
  @IsEmpty({ message: 'You cannot provide start answer date' })
  startAnswersDate: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VigencyDateModel)
  @ApiProperty()
  vigencyDates: VigencyDateModel[];

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  menuUrl: string;
}

class VigencyDateModel {
  @IsNumber()
  @IsNotEmpty()
  vigencyDate: number;
}
