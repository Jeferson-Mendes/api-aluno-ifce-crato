import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { PaginationResponseType, RolesEnum } from 'src/ts/enums';
import { CurrentUserDecorator } from 'src/auth/decorators/current-user.decorator';
import {
  ApiResponseUpdateUser,
  ApiResponseUpdateUserRoles,
  UpdatePasswordDto,
  UpdateUserDto,
  UpdateUserRolesDto,
} from './dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Role } from 'src/auth/decorators/role.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiQuery({ name: 'resPerPage', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description:
      'Atributo considerado para buscar usuários por nome, matrícula ou siap.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        list: [
          {
            name: 'Any new User 2',
            email: 'any_user_2@email.com',
            phoneNumber: '88999999999',
            roles: ['mural_manager', 'refectory_manager'],
            type: 'student',
            registration: '20182087504232',
            isActive: true,
            createdAt: '2023-03-10T00:29:02.402Z',
            updatedAt: '2023-03-10T00:29:02.402Z',
            id: '640a79ce3cd838f0378c39a0',
          },
        ],
        currentPage: 1,
        resPerPage: 10,
        totalPages: 1,
        totalItems: 1,
      },
    },
  })
  async find(@Query() query: ExpressQuery): Promise<PaginationResponseType> {
    return await this.userService.find(query);
  }

  @Get('/:userId')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOkResponse({ status: 200, type: User })
  async detail(@Param('userId') userId: string): Promise<User> {
    return await this.userService.detail(userId);
  }

  @Patch()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOkResponse({ status: 200, type: ApiResponseUpdateUser })
  async update(
    @CurrentUserDecorator() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ userId: string }> {
    return await this.userService.update(user, updateUserDto);
  }

  @Patch('/roles/:userId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Role(RolesEnum.PERMISSION_MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ status: 200, type: ApiResponseUpdateUserRoles })
  async updateRoles(
    @Param('userId') userId: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
  ): Promise<{ userId: string }> {
    return await this.userService.updateRoles(userId, updateUserRolesDto);
  }

  @Patch('/update-password')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOkResponse({
    status: 200,
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Invalid userId' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({ description: 'Invalid current password' })
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUserDecorator() user: User,
  ): Promise<User> {
    return await this.userService.updatePassword(
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword,
      user._id,
    );
  }
}
