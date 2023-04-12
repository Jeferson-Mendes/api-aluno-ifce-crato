import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { mountPaginationAttribute } from 'src/helpers';
import { PaginationResponseType } from 'src/ts/enums';
import { User } from './schemas/user.schema';
import { Query } from 'express-serve-static-core';
import { UpdateUserDto } from './dto';
import ServerError from '../shared/errors/ServerError';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
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
  ): Promise<{ userId: string }> {
    const recordUser = await this.userModel.findById(user._id);
    if (!recordUser) {
      throw new NotFoundException('User not found.');
    }

    try {
      await this.userModel.updateOne({ _id: user._id }, updateUserDto);

      return { userId: user._id };
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }
}
