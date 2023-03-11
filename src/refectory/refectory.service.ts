import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import ServerError from 'src/shared/errors/ServerError';
import { RefectoryAnswerType, RefectoryStatusEnum } from 'src/ts/enums';
import { User } from '../users/schemas/user.schema';
import { CreateRefectoryAnswerDto } from './dto/create-refectory-answer.dto';
import { CreateRefectoryDto } from './dto/create-refectory.dto';
import { RefectoryAnswer } from './schemas/refectory-answer.schema';
import { Refectory } from './schemas/refectory.schema';

@Injectable()
export class RefectoryService {
  constructor(
    @InjectModel(Refectory.name)
    private refectoryModel: mongoose.Model<Refectory>,

    @InjectModel(RefectoryAnswer.name)
    private refectoryAnswerModel: mongoose.Model<RefectoryAnswer>,
  ) {}

  // Get current refectory
  async getCurrentRefectory(): Promise<Refectory> {
    try {
      return await this.refectoryModel.findOne({ status: 'open' });
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  async getAnswers(): Promise<RefectoryAnswerType> {
    try {
      const answers = await this.refectoryAnswerModel.aggregate([
        {
          $lookup: {
            from: 'refectories',
            localField: 'refectory',
            foreignField: '_id',
            as: 'refectory',
          },
        },
        {
          $unwind: {
            path: '$refectory',
          },
        },
        {
          $match: {
            'refectory.status': 'open',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
          },
        },
        {
          $group: {
            _id: '$refectory._id',
            totalBreakfast: {
              $sum: '$breakfast',
            },
            totalLunch: {
              $sum: '$lunch',
            },
            totalAfternoonSnack: {
              $sum: '$afternoonSnack',
            },
            totalDinner: {
              $sum: '$dinner',
            },
            totalNightSnack: {
              $sum: '$nightSnack',
            },
            status: {
              $first: '$refectory.status',
            },
            vigencyDate: {
              $first: '$refectory.vigencyDate',
            },
            closingDate: {
              $first: '$refectory.closingDate',
            },
            startAnswersDate: {
              $first: '$refectory.startAnswersDate',
            },
            users: {
              $push: {
                name: '$user.name',
                breakfast: {
                  $sum: '$breakfast',
                },
                lunch: '$lunch',
                afternoonSnack: '$afternoonSnack',
                dinner: '$dinner',
                nightSnack: '$nightSnack',
              },
            },
          },
        },
      ]);

      return answers[0] as unknown as RefectoryAnswerType;
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  // Create
  async createRefectory(
    createRefectoryDto: CreateRefectoryDto,
  ): Promise<Refectory> {
    // check already has open refectory
    const hasRefectory = await this.refectoryModel.findOne({
      vigencyDate: { $gte: createRefectoryDto.vigencyDate },
    });

    if (hasRefectory) {
      throw new BadRequestException('The provided vigency date is invalid');
    }

    if (
      createRefectoryDto.closingDate < new Date() ||
      createRefectoryDto.closingDate > createRefectoryDto.vigencyDate
    ) {
      throw new BadRequestException('Invalid dates');
    }

    try {
      const createdRefectory = await this.refectoryModel.create(
        createRefectoryDto,
      );
      return createdRefectory;
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  // Create refectory answer
  async createRefectoryAnswer(
    createRefectoryAnswerDto: CreateRefectoryAnswerDto,
    user: User,
  ): Promise<RefectoryAnswer> {
    const isValidRefectory = await this.refectoryModel.findOne({
      _id: createRefectoryAnswerDto.refectory,
      status: RefectoryStatusEnum.OPEN,
    });

    if (!isValidRefectory) {
      throw new BadRequestException('This refectory do not acept answers.');
    }

    const userAlreadyAnswered = await this.refectoryAnswerModel.findOne({
      user: user.id,
      refectory: createRefectoryAnswerDto.refectory,
    });

    if (userAlreadyAnswered) {
      throw new BadRequestException('Answer already provided.');
    }

    try {
      const answer = await this.refectoryAnswerModel.create({
        ...createRefectoryAnswerDto,
        user: user.id,
      });

      return answer;
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }
}
