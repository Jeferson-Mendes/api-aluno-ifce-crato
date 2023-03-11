import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId, IsNumber, Min, Max } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateRefectoryAnswerDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty()
  refectory: ObjectId;

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
