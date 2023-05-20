import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmpty,
  IsNotEmpty,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRefectoryDto {
  @IsEmpty({ message: 'You cannot provide start answer date' })
  startAnswersDate: Date;

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
  @IsDateString()
  @IsNotEmpty()
  vigencyDate: Date;
}
