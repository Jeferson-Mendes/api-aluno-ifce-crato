import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUserDecorator } from 'src/auth/decorators/current-user.decorator';
import { Role } from 'src/auth/decorators/role.decorator';
import { RoleGuard } from '../auth/guards/role.guard';
import { RefectoryAnswerType, RolesEnum } from '../ts/enums';
import { User } from '../users/schemas/user.schema';
import { CreateRefectoryAnswerDto } from './dto/create-refectory-answer.dto';
import { CreateRefectoryDto } from './dto/create-refectory.dto';
import { RefectoryService } from './refectory.service';
import { RefectoryAnswer } from './schemas/refectory-answer.schema';
import { Refectory } from './schemas/refectory.schema';

@ApiTags('refectory')
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

  // Create refectory answer
  @Post('create/answer')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: RefectoryAnswer })
  async createAnswer(
    @Body() createRefectoryAnswerDto: CreateRefectoryAnswerDto,
    @CurrentUserDecorator() user: User,
  ): Promise<RefectoryAnswer> {
    return await this.refectoryService.createRefectoryAnswer(
      createRefectoryAnswerDto,
      user,
    );
  }
}
