import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBasicAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('/:userId')
  @UseGuards(AuthGuard())
  @ApiBasicAuth()
  @ApiOkResponse({ status: 200, type: User })
  async detail(@Param('userId') userId: string): Promise<User> {
    return await this.userService.detail(userId);
  }
}
