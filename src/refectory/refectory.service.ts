import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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
  UpdateMenuUrlDto,
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
  async getCurrentRefectory(user: User): Promise<any> {
    try {
      const result = await this.refectoryModel.findOne({
        status: { $in: ['open', 'openToAnswer'] },
      });

      if (result) {
        const answer = await this.loadUserAnswer(user, result.id);

        return {
          id: result.id,
          status: result.status,
          vigencyDate: result.vigencyDate,
          startAnswersDate: result.startAnswersDate,
          menuUrl: result.menuUrl,
          hasAnswered: !!answer,
        };
      }
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  async loadUserAnswer(
    user: User,
    refectoryId: string,
  ): Promise<RefectoryAnswer> {
    try {
      return await this.refectoryAnswerModel.findOne({
        user: user._id,
        refectory: refectoryId,
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

    let vigencyDateMilliseconds = null;

    if (vigencyDate) {
      vigencyDateMilliseconds = new Date(
        vigencyDate.toString().replace(/\s/g, ''),
      ).getTime();
    }

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
  async createRefectory(createRefectoryDto: CreateRefectoryDto): Promise<void> {
    const data = [];

    const millisecondsDate = createRefectoryDto.vigencyDates.map(
      (form) => form.vigencyDate,
    );
    const recordRefectory = await this.refectoryModel.findOne({
      vigencyDate: {
        $in: [...millisecondsDate],
      },
    });

    if (recordRefectory) {
      throw new BadRequestException(
        'Some provided vigency date already exists',
      );
    }

    for (
      let index = 0;
      index < createRefectoryDto.vigencyDates.length;
      index++
    ) {
      const form = createRefectoryDto.vigencyDates[index];
      const formObj: any = {
        menuUrl: createRefectoryDto.menuUrl,
        vigencyDate: form.vigencyDate,
        startAnswersDate: subDays(form.vigencyDate, 1).getTime(),
      };

      const vigencyDateRecord = data.find(
        (item) => item.vigencyDate === form.vigencyDate,
      );

      if (vigencyDateRecord) {
        throw new BadRequestException('Duplicated vigency date provided');
      }

      const compareDate = isAfter(new Date().getTime(), formObj.vigencyDate);
      const compareStartAnswerDate = isAfter(
        new Date().getTime(),
        formObj.startAnswersDate,
      );

      if (compareDate) {
        throw new BadRequestException('Some provided vigency date is invalid');
      }

      if (compareStartAnswerDate) {
        formObj.status = RefectoryStatusEnum.openToAnswer;
      }

      data.push(formObj);
    }

    try {
      await this.refectoryModel.insertMany(data);
      return;
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
      status: RefectoryStatusEnum.openToAnswer,
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
        refectory: refectoryId,
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
    const updateData: {
      vigencyDate?: number;
      startAnswersDate?: number;
      status?: string;
    } = {};

    const refectoryRecord = await this.refectoryModel.findOne({
      _id: refectoryId,
    });

    const vigencyDateAlreadyExists = await this.refectoryModel.findOne({
      vigencyDate: {
        $eq: updateRefectoryDto.vigencyDate,
      },
    });

    if (!refectoryRecord || vigencyDateAlreadyExists) {
      throw new BadRequestException(
        'Refectory not found or vigency date already exists.',
      );
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

    updateData.vigencyDate = updateRefectoryDto.vigencyDate;

    updateData.startAnswersDate = updateData.vigencyDate
      ? subDays(updateData.vigencyDate, 1).getTime()
      : refectoryRecord.startAnswersDate;

    if (isAfter(new Date().getTime(), updateData.startAnswersDate)) {
      updateData.status = RefectoryStatusEnum.openToAnswer;
    }

    try {
      await this.refectoryModel.updateOne({ _id: refectoryId }, updateData, {
        new: true,
        runValidators: true,
      });

      return { refectoryId: refectoryId };
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  async updateMenuUrl(menuUrlDto: UpdateMenuUrlDto): Promise<void> {
    const { menuUrl } = menuUrlDto;

    try {
      await this.refectoryModel.updateMany({}, { menuUrl });
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }
}
