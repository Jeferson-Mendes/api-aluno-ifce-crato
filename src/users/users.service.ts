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
}
