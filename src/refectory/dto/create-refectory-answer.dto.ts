import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateRefectoryAnswerDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  @ApiProperty()
  breakfast: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  @ApiProperty()
  lunch: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  @ApiProperty()
  afternoonSnack: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  @ApiProperty()
  dinner: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  @ApiProperty()
  nightSnack: number;
}
