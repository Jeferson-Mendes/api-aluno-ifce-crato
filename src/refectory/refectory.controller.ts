import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateRefectoryDto } from './dto/create-refectory.dto';
import { RefectoryService } from './refectory.service';
import { Refectory } from './schemas/refectory.schema';

@Controller('refectory')
export class RefectoryController {
  constructor(private refectoryService: RefectoryService) {}

  @Get('current-refectory')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: Refectory })
  async getCurrentRefectory(): Promise<Refectory> {
    return await this.refectoryService.getCurrentRefectory();
  }

  // Create refectory
  @Post('create')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: Refectory })
  async create(
    @Body() createRefectoryDto: CreateRefectoryDto,
  ): Promise<Refectory> {
    return await this.refectoryService.createRefectory(createRefectoryDto);
  }
}
