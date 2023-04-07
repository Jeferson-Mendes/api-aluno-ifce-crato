import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { mountPaginationAttribute } from 'src/helpers';
import ServerError from 'src/shared/errors/ServerError';
import {
  PaginationResponseType,
  RefectoryAnswerType,
  RefectoryStatusEnum,
} from 'src/ts/enums';
import { User } from '../users/schemas/user.schema';
import {
  CreateRefectoryDto,
  CreateRefectoryAnswerDto,
  UpdateRefectoryDto,
} from './dto';
import { RefectoryAnswer } from './schemas/refectory-answer.schema';
import { Refectory } from './schemas/refectory.schema';
import { Query } from 'express-serve-static-core';
import { isAfter, isBefore } from 'date-fns';

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

  async listRefectory(query: Query): Promise<PaginationResponseType> {
    const { currentPage, resPerPage, skip } = mountPaginationAttribute(query);
    const { vigencyDate, status } = query;

    const refectoryDateSearch = vigencyDate
      ? vigencyDate.toString().replace(/\s/g, '')
      : undefined;

    const statusToSearch = status
      ? status.toString().replace(/\s/g, '')
      : undefined;

    const queryParams = {
      vigencyDate: refectoryDateSearch
        ? { vigencyDate: refectoryDateSearch }
        : {},
      status: statusToSearch
        ? { status: { $in: [statusToSearch] } }
        : { status: { $ne: RefectoryStatusEnum.CLOSED } },
    };

    try {
      const refectories = await this.refectoryModel
        .find({
          ...queryParams.vigencyDate,
          ...queryParams.status,
        })
        .limit(resPerPage)
        .skip(skip);

      const totalRefectories = await this.refectoryModel
        .find({
          ...queryParams.vigencyDate,
          ...queryParams.status,
        })
        .count();

      const totalPages = Math.ceil(totalRefectories / resPerPage);

      return {
        list: refectories,
        currentPage,
        resPerPage,
        totalPages,
        totalItems: totalRefectories,
      };
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

  convert(originalValue: any, newValue: any): any {
    if (newValue === undefined) return originalValue;
    if (newValue === null) return null;
    if (newValue.trim() === '') return null;
    return newValue;
  }

  handleDates(
    closingDate: Date,
    vigencyDate: Date,
    startAnswersDate: Date,
  ): boolean {
    const closing =
      isBefore(new Date(closingDate), new Date()) ||
      isAfter(new Date(closingDate), new Date(vigencyDate));
    const startAnswer = isAfter(new Date(startAnswersDate), new Date());

    if (closing || startAnswer) return false;
    return true;
  }

  async update(
    refectoryId: string,
    updateRefectoryDto: UpdateRefectoryDto,
  ): Promise<{ refectoryId: string }> {
    const refectoryRecord = await this.refectoryModel.findOne({
      _id: refectoryId,
    });

    if (!refectoryRecord) {
      throw new NotFoundException('Refectory not found.');
    }

    if (refectoryRecord.status === RefectoryStatusEnum.OPEN) {
      throw new ForbiddenException('This refectory already is open.');
    }

    const refectoryWithVigencyDate = await this.refectoryModel.findOne({
      vigencyDate: { $eq: updateRefectoryDto.vigencyDate },
    });

    if (refectoryWithVigencyDate) {
      throw new BadRequestException('The provided vigency date is invalid.');
    }

    if (
      !this.handleDates(
        this.convert(
          refectoryRecord.closingDate,
          updateRefectoryDto.closingDate,
        ),
        this.convert(
          refectoryRecord.vigencyDate,
          updateRefectoryDto.vigencyDate,
        ),
        this.convert(
          refectoryRecord.startAnswersDate,
          updateRefectoryDto.startAnswersDate,
        ),
      )
    ) {
      throw new BadRequestException('Invalid dates');
    }

    const data = {
      vigencyDate: this.convert(
        refectoryRecord.vigencyDate,
        updateRefectoryDto.vigencyDate,
      ),
      closingDate: this.convert(
        refectoryRecord.closingDate,
        updateRefectoryDto.closingDate,
      ),
      startAnswersDate: this.convert(
        refectoryRecord.startAnswersDate,
        updateRefectoryDto.startAnswersDate,
      ),
      menu: {
        breakfast: this.convert(
          refectoryRecord.menu?.breakfast,
          updateRefectoryDto?.menu?.breakfast,
        ),
        lunch: this.convert(
          refectoryRecord.menu?.lunch,
          updateRefectoryDto?.menu?.lunch,
        ),
        afternoonSnack: this.convert(
          refectoryRecord.menu.afternoonSnack,
          updateRefectoryDto?.menu?.afternoonSnack,
        ),
        dinner: this.convert(
          refectoryRecord.menu?.dinner,
          updateRefectoryDto?.menu?.dinner,
        ),
        nightSnack: this.convert(
          refectoryRecord.menu?.nightSnack,
          updateRefectoryDto?.menu?.nightSnack,
        ),
      },
    };

    try {
      await this.refectoryModel.updateOne({ _id: refectoryId }, data, {
        new: true,
        runValidators: true,
      });

      return { refectoryId: refectoryId };
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }
}
