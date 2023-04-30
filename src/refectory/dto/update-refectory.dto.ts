import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, IsNumber, IsUrl } from 'class-validator';

export class UpdateRefectoryDto {
  @IsEmpty({ message: 'You cannot provide start answer date' })
  startAnswersDate: number;
  @IsEmpty({ message: 'You cannot provide menuUrl' })
  menuUrl: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  vigencyDate: number;
}

export class ApiResponseUpdate {
  @ApiProperty({ required: false })
  refectoryId: string;
}

export class UpdateMenuUrlDto {
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  menuUrl: string;
}
