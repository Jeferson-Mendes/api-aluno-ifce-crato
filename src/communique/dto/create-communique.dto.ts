import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { CommuniqueTypeEnum } from '../schemas/communique.schema';

export class CreateCommuniqueDto {
  @IsNotEmpty()
  @IsEnum(CommuniqueTypeEnum, {
    each: true,
    message: 'Please provide a valid value for user communique category',
  })
  @ApiProperty({ enum: CommuniqueTypeEnum })
  readonly category: CommuniqueTypeEnum;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  readonly contents: string;

  @IsNotEmpty()
  @IsString({
    each: true,
  })
  @ApiProperty()
  readonly referenceLinks: string[];

  @IsOptional()
  @ApiProperty({ required: false })
  readonly file?: string;
}
