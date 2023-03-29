import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../users/schemas/user.schema';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@ApiTags('users')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Register user
  @Post('/signup')
  @HttpCode(201)
  @ApiCreatedResponse({
    status: 201,
    type: User,
  })
  async signUp(@Body() signUpDto: SignUpDto): Promise<User> {
    return await this.authService.signUp(signUpDto);
  }

  @Post('/login')
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        user: {
          name: 'Aluno',
          email: 'aluno@email.com',
          password:
            '$2a$10$pjSSPAkNogLeDXoR0Tnk3etmmGQLM843.1LcNbk5YJoLN/HHvKI1u',
          birthDate: '2000-01-18T00:00:00.000Z',
          phoneNumber: '88999999999',
          registration: '1111111111111',
          isActive: true,
          createdAt: '2022-10-10T00:15:09.361Z',
          updatedAt: '2022-10-10T00:15:09.361Z',
          id: '6343640d4e95843f1e8678e3',
        },
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNDM2NDBkNGU5NTg0M2YxZTg2NzhlMyIsImlhdCI6MTY2NTM2MTMxNiwiZXhwIjoxNjY1NDQ3NzE2fQ.B1XBQwq7FdkPBt7zKSMwR4eMn1FDRxyyg6_S3UnN_5Y',
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ user: User; token: string }> {
    return await this.authService.login(loginDto);
  }
}
