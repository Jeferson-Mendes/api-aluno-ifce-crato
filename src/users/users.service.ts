import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { mountPaginationAttribute } from 'src/helpers';
import { PaginationResponseType } from 'src/ts/enums';
import { User } from './schemas/user.schema';
import { Query } from 'express-serve-static-core';
import { UpdateUserDto, UpdateUserRolesDto } from './dto';
import ServerError from '../shared/errors/ServerError';
import * as bcrypt from 'bcryptjs';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    private cloudinaryService: CloudinaryService,
  ) {}

  async find(query: Query): Promise<PaginationResponseType> {
    const { currentPage, resPerPage, skip } = mountPaginationAttribute(query);
    const keyword = query.keyword;

    const queryParams = {
      keyword: keyword
        ? {
            $or: [
              { name: { $regex: keyword, $options: 'i' } },
              { siape: { $regex: keyword, $options: 'i' } },
              { registration: { $regex: keyword, $options: 'i' } },
            ],
          }
        : {},
    };

    try {
      const list = await this.userModel
        .find({
          ...queryParams.keyword,
        })
        .sort({ name: 1 })
        .limit(resPerPage)
        .skip(skip);

      const total = await this.userModel
        .find({
          ...queryParams.keyword,
        })
        .count();

      const totalPages = Math.ceil(total / resPerPage);

      return {
        list,
        currentPage,
        resPerPage,
        totalPages,
        totalItems: total,
      };
    } catch (error) {}
  }

  // Detail
  async detail(userId: string): Promise<User> {
    const isValidId = isValidObjectId(userId);

    if (!isValidId) {
      throw new BadRequestException('Invalid Id');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    return user;
  }

  async update(
    user: User,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<{ userId: string }> {
    let fileToStorage = null;
    const userData: {
      name?: string;
      phoneNumber?: string;
      avatarUrl?: string;
      avatarPublicId?: string;
    } = {
      ...updateUserDto,
    };

    const recordUser = await this.userModel
      .findById(user._id)
      .select('+avatarPublicId');
    if (!recordUser) {
      throw new NotFoundException('User not found.');
    }

    if (file) {
      if (recordUser.avatarPublicId) {
        await this.cloudinaryService.deleteImage(recordUser.avatarPublicId);
      }
      fileToStorage = await this.cloudinaryService.uploadImage(file);

      userData.avatarUrl = fileToStorage.secure_url;
      userData.avatarPublicId = fileToStorage.public_id;
    }

    try {
      await this.userModel.updateOne({ _id: user._id }, userData);

      return { userId: user._id };
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  async updateRoles(
    userId: string,
    updateUserRolesDto: UpdateUserRolesDto,
  ): Promise<{ userId: string }> {
    const { roles } = updateUserRolesDto;
    const recordUser = await this.userModel.findOne({ _id: userId });
    if (!recordUser) {
      throw new NotFoundException('User not found.');
    }

    try {
      await this.userModel.updateOne({ _id: userId }, { roles });
      return { userId };
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string,
    userId: string,
  ): Promise<User> {
    const isValidId = isValidObjectId(userId);

    if (!isValidId) {
      throw new BadRequestException('Invalid userId');
    }

    const userExists = await this.userModel
      .findById(userId)
      .select('+password');

    if (!userExists) {
      throw new NotFoundException('User not found.');
    }

    const confirmPassword = await bcrypt.compare(
      currentPassword,
      userExists.password,
    );

    if (!confirmPassword) {
      throw new UnauthorizedException('Invalid current password');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    return await this.userModel.findByIdAndUpdate(
      userId,
      {
        password: passwordHash,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}
