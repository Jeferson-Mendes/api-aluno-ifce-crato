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
  ResetPassDto,
} from './dto';
import ServerError from '../shared/errors/ServerError';
import { addMinutes, isAfter } from 'date-fns';
import { UserResetPassToken } from '../users/schemas/user-reset-password.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    @InjectModel(UserResetPassToken.name)
    private userResetPassModel: Model<UserResetPassToken>,

    private cloudinaryService: CloudinaryService,

    private jwtService: JwtService,

    private mailService: MailService,
  ) {}

  // Register user
  async signUp(
    signUpDto: SignUpDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    const { password, email } = signUpDto;
    let fileToStorage = null;
    const resourceData = {
      avatarUrl: '',
      avatarPublicId: '',
    };

    const emailCode = generateCode();

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await this.mailService.accountConfirmation({
        code: emailCode,
        to: email,
      });

      if (file) {
        fileToStorage = await this.cloudinaryService.uploadImage(file);
        resourceData.avatarUrl = fileToStorage.secure_url;
        resourceData.avatarPublicId = fileToStorage.public_id;
      }
      const user = await this.userModel.create({
        ...signUpDto,
        password: hashedPassword,
        emailCode,
        ...resourceData,
      });

      return user;
    } catch (error) {
      if (file) {
        await this.cloudinaryService.deleteImage(resourceData.avatarPublicId);
      }
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

  async sendForgotPasswordEmail(email: string): Promise<void> {
    const userEmailExists = await this.userModel.findOne({ email });

    if (!userEmailExists) {
      throw new NotFoundException('User not found.');
    }

    const code = generateCode();

    await this.userResetPassModel.deleteMany({ user: userEmailExists._id });
    await this.userResetPassModel.create({ code, user: userEmailExists._id });

    return await this.mailService.sendForgotPassword({ code, to: email });
  }

  async resetPassword(resetPassDto: ResetPassDto): Promise<User> {
    const userCodeExists: any = await this.userResetPassModel.findOne({
      code: resetPassDto.code,
    });

    if (!userCodeExists) {
      throw new NotFoundException('Invalid code');
    }

    const recordUserCode = await this.userModel.findById(userCodeExists.user);

    if (!recordUserCode) {
      throw new BadRequestException('Code do not match with your user');
    }

    const compareDate = addMinutes(
      new Date(userCodeExists.createdAt).getTime(),
      10,
    );

    if (isAfter(Date.now(), compareDate)) {
      throw new UnauthorizedException('Expired code');
    }

    const hashedPassword = await bcrypt.hash(resetPassDto.newPassword, 10);

    return await this.userModel.findByIdAndUpdate(
      recordUserCode._id,
      {
        password: hashedPassword,
      },
      { new: true, runValidators: true },
    );
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
