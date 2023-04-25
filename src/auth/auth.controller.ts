import {
  Controller,
  Post,
  Body,
  HttpCode,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../users/schemas/user.schema';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import {
  ConfirmEmailCodeDto,
  ResendEmailConfirmationCodeDto,
  ResetPassDto,
  SendForgotPassDto,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from '../multer/sharp.pipe';

@ApiTags('users')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Register user
  @Post('/signup')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    status: 201,
    type: User,
  })
  async signUp(
    @Body() signUpDto: SignUpDto,
    @UploadedFile(SharpPipe) file: Express.Multer.File,
  ): Promise<User> {
    return await this.authService.signUp(signUpDto, file);
  }

  @Post('confirm/email-code')
  @HttpCode(200)
  async confirmEmailCode(
    @Body() confirmEmailCodeDto: ConfirmEmailCodeDto,
  ): Promise<{ user: User; token: string }> {
    return this.authService.confirmEmailCode(confirmEmailCodeDto);
  }

  @Post('resend/email-code')
  @HttpCode(204)
  async resendEmailCode(
    @Body() resendEmailConfirmationCodeDto: ResendEmailConfirmationCodeDto,
  ): Promise<void> {
    return this.authService.resendEmailConfirmationCode(
      resendEmailConfirmationCodeDto,
    );
  }

  @Post('/login')
  @ApiOkResponse({
    status: 200,
    schema: {
      example: {
        user: {
          name: 'Username APP IFCE ALUNO',
          email: 'email@email',
          phoneNumber: '88999999999',
          roles: [],
          type: 'student',
          registration: '00000000000000',
          isActive: false,
          createdAt: '2023-04-15T03:32:49.116Z',
          updatedAt: '2023-04-15T03:57:39.762Z',
          id: '643a1ae114131cd5fdc92699',
        },
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNDM2NDBkNGU5NTg0M2YxZTg2NzhlMyIsImlhdCI6MTY2NTM2MTMxNiwiZXhwIjoxNjY1NDQ3NzE2fQ.B1XBQwq7FdkPBt7zKSMwR4eMn1FDRxyyg6_S3UnN_5Y',
      },
    },
  })
  @ApiResponse({
    status: 300,
    schema: {
      example: {
        message: 'Pending email confirmation',
        user: {
          name: 'Username APP IFCE ALUNO',
          email: 'email@email',
          phoneNumber: '88999999999',
          roles: [],
          type: 'student',
          registration: '00000000000000',
          isActive: false,
          createdAt: '2023-04-15T03:32:49.116Z',
          updatedAt: '2023-04-15T03:57:39.762Z',
          id: '643a1ae114131cd5fdc92699',
        },
        statusCode: 300,
      },
    },
  })
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ user: User; token: string }> {
    return await this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async sendForgotPassword(
    @Body() sendForgotPassword: SendForgotPassDto,
  ): Promise<void> {
    await this.authService.sendForgotPasswordEmail(sendForgotPassword.email);
    return;
  }

  @Patch('reset-password')
  @HttpCode(200)
  @ApiOkResponse({ type: User })
  async resetPassword(@Body() resetPassDto: ResetPassDto): Promise<User> {
    return await this.authService.resetPassword(resetPassDto);
  }
}
