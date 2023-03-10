import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import ServerError from 'src/shared/errors/ServerError';
import { CreateRefectoryDto } from './dto/create-refectory.dto';
import { Refectory } from './schemas/refectory.schema';

@Injectable()
export class RefectoryService {
  constructor(
    @InjectModel(Refectory.name)
    private refectoryModel: mongoose.Model<Refectory>,
  ) {}

  // Get current refectory
  async getCurrentRefectory(): Promise<Refectory> {
    try {
      return await this.refectoryModel.findOne({ status: 'OPEN' });
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
}
