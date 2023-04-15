import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import ApiFeatures from 'src/utils/apiFeatures';
import { MailService } from '../mail/mail.service';
import { generateCode } from '../helpers';
import {
  ConfirmEmailCodeDto,
  LoginDto,
  ResendEmailConfirmationCodeDto,
  SignUpDto,
} from './dto';
import ServerError from '../shared/errors/ServerError';
import { addMinutes, isAfter } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    private jwtService: JwtService,

    private mailService: MailService,
  ) {}

  // Register user
  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { password, email } = signUpDto;
    const emailCode = generateCode();

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.mailService.accountConfirmation({ code: emailCode, to: email });
    try {
      const user = await this.userModel.create({
        ...signUpDto,
        password: hashedPassword,
        emailCode,
      });

      return user;
    } catch (error) {
      // Handle duplicate email
      if (error.code === 11000) {
        throw new ConflictException('Duplicate Email entered');
      }
    }
  }

  async confirmEmailCode(
    confirmEmailCodeDto: ConfirmEmailCodeDto,
  ): Promise<{ user: User; token: string }> {
    const user: any = await this.userModel
      .findOne({
        email: confirmEmailCodeDto.email,
      })
      .select('+emailCode');

    if (!user || user.isActive) {
      throw new NotFoundException('User not found or already is active');
    }

    if (user.emailCode !== confirmEmailCodeDto.code) {
      throw new BadRequestException('Invalid code');
    }

    const dateToCompare = addMinutes(user.updatedAt, 10);

    if (isAfter(new Date(), dateToCompare)) {
      throw new BadRequestException('Expired code');
    }

    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        user._id,
        { isActive: true },
        { runValidators: true, new: true },
      );

      const token = await ApiFeatures.assignJwtToken(user._id, this.jwtService);

      return { user: updatedUser, token };
    } catch (error) {
      throw new ServerError();
    }
  }

  async resendEmailConfirmationCode(
    resendEmailCode: ResendEmailConfirmationCodeDto,
  ): Promise<void> {
    const user = await this.userModel.findOne({ email: resendEmailCode.email });

    if (!user || user.isActive) {
      throw new NotFoundException('User not found or already is active');
    }

    try {
      const emailCode = generateCode();

      const updatedUser = await this.userModel.findByIdAndUpdate(
        user._id,
        { emailCode },
        { new: true, runValidators: true },
      );

      await this.mailService.accountConfirmation({
        code: emailCode,
        to: updatedUser.email,
      });

      return;
    } catch (error) {
      throw new ServerError();
    }
  }

  // Login
  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid password');
    }

    user.password = undefined;
    if (!user.isActive) {
      throw new HttpException(
        {
          message: 'Pending email confirmation',
          user,
          statusCode: 300,
        },
        300,
      );
    }

    const token = await ApiFeatures.assignJwtToken(user._id, this.jwtService);

    return { user, token };
  }
}
