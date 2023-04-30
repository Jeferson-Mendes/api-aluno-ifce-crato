import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserDecorator } from 'src/auth/decorators/current-user.decorator';
import { Role } from 'src/auth/decorators/role.decorator';
import { RoleGuard } from '../auth/guards/role.guard';
import {
  PaginationResponseType,
  RefectoryAnswerType,
  RefectoryStatusEnum,
  RolesEnum,
} from '../ts/enums';
import { User } from '../users/schemas/user.schema';
import { RefectoryService } from './refectory.service';
import { RefectoryAnswer } from './schemas/refectory-answer.schema';
import { Refectory } from './schemas/refectory.schema';
import { Query as ExpressQuery } from 'express-serve-static-core';
import {
  UpdateRefectoryDto,
  CreateRefectoryAnswerDto,
  CreateRefectoryDto,
  ApiResponseUpdate,
  UpdateMenuUrlDto,
} from './dto';

@ApiTags('refectory')
@Controller('refectory')
export class RefectoryController {
  constructor(private refectoryService: RefectoryService) {}

  @Get('current-refectory')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: Refectory })
  async getCurrentRefectory(
    @CurrentUserDecorator() user: User,
  ): Promise<Refectory> {
    return await this.refectoryService.getCurrentRefectory(user);
  }

  @Get('/:refectoryId')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: Refectory })
  async findById(
    @Param('refectoryId') refectoryId: string,
  ): Promise<Refectory> {
    return await this.refectoryService.findById(refectoryId);
  }

  @Get('current-refectory/answers')
  @UseGuards(AuthGuard(), RoleGuard)
  @Role(RolesEnum.REFECTORY_MANAGER)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        _id: '6401597781da6d33a87eb712',
        totalBreakfast: 1,
        totalLunch: 1,
        totalAfternoonSnack: 3,
        totalDinner: 2,
        totalNightSnack: 1,
        status: 'open',
        vigencyDate: '2023-03-07T00:00:00.000Z',
        closingDate: '2023-03-06T00:00:00.000Z',
        startAnswersDate: '2023-03-06T00:00:00.000Z',
        users: [
          {
            name: 'Any new User',
            breakfast: 1,
            lunch: 1,
            afternoonSnack: 1,
            dinner: 0,
            nightSnack: 0,
          },
          {
            name: 'Any new User 2',
            breakfast: 0,
            lunch: 0,
            afternoonSnack: 1,
            dinner: 1,
            nightSnack: 1,
          },
        ],
      },
    },
  })
  async getCurrentRefectoryAnswers(): Promise<RefectoryAnswerType> {
    return await this.refectoryService.getAnswers();
  }

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiQuery({ name: 'resPerPage', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({
    name: 'vigencyDate',
    required: false,
    example: '2023-03-23',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RefectoryStatusEnum,
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        list: [
          {
            status: 'created',
            vigencyDate: '2023-03-10T00:00:00.000Z',
            closingDate: '2023-03-06T00:00:00.000Z',
            startAnswersDate: '2023-03-06T00:00:00.000Z',
            menu: {
              breakfast: 'Bolo de cenoura com café ou suco de goiaba',
              lunch: 'Lasanha',
              afternoonSnack: 'Bolo de cenoura',
              dinner: 'Lasanha',
              nightSnack: 'Bolacha com suco de uva',
            },
            createdAt: '2023-03-10T00:29:46.297Z',
            updatedAt: '2023-03-10T00:29:46.297Z',
            id: '640a79fa3cd838f0378c39a8',
          },
        ],
        currentPage: 1,
        resPerPage: 10,
        totalPages: 1,
        totalItems: 1,
      },
    },
  })
  async list(@Query() query: ExpressQuery): Promise<PaginationResponseType> {
    return await this.refectoryService.listRefectory(query);
  }

  // Create refectory
  @Post('create')
  @UseGuards(AuthGuard(), RoleGuard)
  @Role(RolesEnum.REFECTORY_MANAGER)
  @ApiBearerAuth()
  @ApiResponse({ status: 201 })
  @ApiBadRequestResponse({
    status: 400,
    description: 'The provided vigency date is invalid',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async create(@Body() createRefectoryDto: CreateRefectoryDto): Promise<void> {
    return await this.refectoryService.createRefectory(createRefectoryDto);
  }

  // Create refectory answer
  @Post('create/answer/:refectoryId')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: RefectoryAnswer })
  async createAnswer(
    @Param('refectoryId') refectoryId: string,
    @Body() createRefectoryAnswerDto: CreateRefectoryAnswerDto,
    @CurrentUserDecorator() user: User,
  ): Promise<RefectoryAnswer> {
    return await this.refectoryService.createRefectoryAnswer(
      createRefectoryAnswerDto,
      user,
      refectoryId,
    );
  }

  @Patch('/:refectoryId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Role(RolesEnum.REFECTORY_MANAGER)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: ApiResponseUpdate })
  @ApiBadRequestResponse({
    description: 'Refectory not found or vigency date already exists.',
  })
  @ApiForbiddenResponse({ description: 'This refectory already is open.' })
  @ApiBadRequestResponse({
    description: 'The provided vigency date is invalid.',
  })
  @ApiBadRequestResponse({ description: 'Invalid dates' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async update(
    @Body() updateRefectoryDto: UpdateRefectoryDto,
    @Param('refectoryId') refectoryId: string,
  ): Promise<{ refectoryId: string }> {
    return await this.refectoryService.update(refectoryId, updateRefectoryDto);
  }

  @Put('/menu-url')
  @UseGuards(AuthGuard(), RoleGuard)
  @Role(RolesEnum.REFECTORY_MANAGER)
  @ApiBearerAuth()
  @ApiResponse({ status: 200 })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async updateMenuUrl(
    @Body() updateMenuUrlDto: UpdateMenuUrlDto,
  ): Promise<void> {
    return await this.refectoryService.updateMenuUrl(updateMenuUrlDto);
  }
}
