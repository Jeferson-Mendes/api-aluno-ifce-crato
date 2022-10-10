import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from './schemas/user-schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

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
