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
import { UserRolesEnum } from 'src/users/schemas/user.schema';
import { CreateCommuniqueDto } from './dto/create-communique.dto';

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
            title: 'Notícia teste',
            contents: 'noticia teste',
            referenceLinks: ['link', 'link', 'link', 'link'],
            createdAt: '2022-10-24T01:47:00.961Z',
            updatedAt: '2022-10-24T01:47:00.961Z',
            id: '6355ee94347f1c0e4a9bec6b',
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
  ): Promise<Communique> {
    return await this.communiqueService.create(createCommuniqueDto);
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
