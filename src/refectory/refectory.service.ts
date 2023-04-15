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
import { isAfter, isBefore, subDays } from 'date-fns';

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
      return await this.refectoryModel.findOne({
        status: { $in: ['open', 'openToAnswer'] },
      });
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  async findById(refectoryId: string): Promise<Refectory> {
    try {
      return await this.refectoryModel.findOne({ _id: refectoryId });
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  async listRefectory(query: Query): Promise<PaginationResponseType> {
    const { currentPage, resPerPage, skip } = mountPaginationAttribute(query);
    const { vigencyDate, status } = query;

    const vigencyDateMilliseconds = new Date(
      vigencyDate.toString().replace(/\s/g, ''),
    ).getTime();

    const refectoryDateSearch = vigencyDate
      ? vigencyDateMilliseconds
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
        : { status: { $ne: RefectoryStatusEnum.closed } },
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
    const data: any = {
      menu: createRefectoryDto.menu,
      vigencyDate: createRefectoryDto.vigencyDate,
      startAnswersDate: subDays(createRefectoryDto.vigencyDate, 1).getTime(),
    };

    const recordRefectory = await this.refectoryModel.findOne({
      vigencyDate: { $eq: createRefectoryDto.vigencyDate },
    });

    const compareDate = isAfter(new Date().getTime(), data.vigencyDate);

    const compareStartAnswerDate = isAfter(
      new Date().getTime(),
      data.startAnswersDate,
    );

    if (recordRefectory || compareDate) {
      throw new BadRequestException('The provided vigency date is invalid');
    }

    if (compareStartAnswerDate) {
      data.status = RefectoryStatusEnum.openToAnswer;
    }

    try {
      const createdRefectory = await this.refectoryModel.create(data);
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
    refectoryId: string,
  ): Promise<RefectoryAnswer> {
    const isValidRefectory = await this.refectoryModel.findOne({
      _id: refectoryId,
      status: RefectoryStatusEnum.open,
    });

    if (!isValidRefectory) {
      throw new BadRequestException('This refectory do not accept answers.');
    }

    const userAlreadyAnswered = await this.refectoryAnswerModel.findOne({
      user: user.id,
      refectory: refectoryId,
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
    const startAnswer =
      isBefore(new Date(startAnswersDate), new Date()) ||
      isAfter(new Date(startAnswersDate), new Date(closingDate));

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

    if (refectoryRecord.status === RefectoryStatusEnum.open) {
      throw new ForbiddenException('This refectory already is open.');
    }

    const refectoryWithVigencyDate = await this.refectoryModel.findOne({
      vigencyDate: { $eq: updateRefectoryDto.vigencyDate },
    });

    const compareDate = isAfter(
      new Date().getTime(),
      updateRefectoryDto.vigencyDate,
    );

    if (refectoryWithVigencyDate || compareDate) {
      throw new BadRequestException('The provided vigency date is invalid.');
    }

    const vigencyDate = this.convert(
      refectoryRecord.vigencyDate,
      updateRefectoryDto.vigencyDate,
    );

    const startAnswersDate = vigencyDate
      ? (updateRefectoryDto.startAnswersDate = subDays(
          vigencyDate,
          1,
        ).getTime())
      : null;

    const menuData = {
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
      await this.refectoryModel.updateOne(
        { _id: refectoryId },
        { ...menuData, vigencyDate, startAnswersDate },
        {
          new: true,
          runValidators: true,
        },
      );

      return { refectoryId: refectoryId };
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }
}
