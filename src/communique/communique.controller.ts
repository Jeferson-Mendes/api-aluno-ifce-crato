import {
  Controller,
  Get,
  UseGuards,
  Query,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommuniqueService } from './communique.service';
import { Communique, CommuniqueTypeEnum } from './schemas/communique.schema';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Role } from 'src/auth/decorators/role.decorator';
import { User, UserRolesEnum } from 'src/users/schemas/user.schema';
import { CreateCommuniqueDto } from './dto/create-communique.dto';
import { CurrentUserDecorator } from 'src/auth/decorators/current-user.decorator';

@ApiTags('communique')
@Controller('communique')
export class CommuniqueController {
  constructor(private communiqueService: CommuniqueService) {}

  @Get()
  @UseGuards(AuthGuard())
  // @Role(UserRolesEnum.SUPERUSER)
  @ApiBearerAuth()
  @ApiQuery({ name: 'resPerPage', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({
    name: 'categories',
    required: false,
    enum: CommuniqueTypeEnum,
    example: 'Lecture,News',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        communiqueList: [
          {
            category: 'News',
            author: {
              name: 'Jeferson 2',
              id: '634f5593412af985891e2822',
            },
            title: 'Notícia com autor',
            contents: 'noticia teste com autor',
            referenceLinks: ['link', 'link', 'link', 'link'],
            createdAt: '2022-11-18T00:55:32.472Z',
            updatedAt: '2022-11-18T00:55:32.472Z',
            id: '6376d804e8379498fbedbec8',
          },
        ],
        currentPage: 1,
        resPerPage: 10,
        totalPages: 1,
        totalItems: 3,
      },
    },
  })
  async list(@Query() query: ExpressQuery): Promise<{
    communiqueList: Communique[];
    resPerPage: number;
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    return await this.communiqueService.list(query);
  }

  // Create
  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Role(UserRolesEnum.STUDENT)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: Communique })
  async create(
    @Body() createCommuniqueDto: CreateCommuniqueDto,
    @CurrentUserDecorator() user: User,
  ): Promise<Communique> {
    return await this.communiqueService.create(createCommuniqueDto, user._id);
  }

  // Detail
  @Get('/:communiqueId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Role(UserRolesEnum.STUDENT)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: Communique })
  async detail(
    @Param('communiqueId') communiqueId: string,
  ): Promise<Communique> {
    return await this.communiqueService.detail(communiqueId);
  }
}
