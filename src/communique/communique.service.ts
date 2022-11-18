import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommuniqueDto } from './dto/create-communique.dto';
import { Communique, CommuniqueTypeEnum } from './schemas/communique.schema';
import { Query } from 'express-serve-static-core';

@Injectable()
export class CommuniqueService {
  constructor(
    @InjectModel(Communique.name)
    private communiqueModel: Model<Communique>,
  ) {}

  // List
  async list(query: Query): Promise<{
    communiqueList: Communique[];
    resPerPage: number;
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    const resPerPage = Number(query.resPerPage) || 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const communiqueCategory = query.categories
      ? (query.categories
          .toString()
          .replace(/\s/g, '')
          .split(',') as CommuniqueTypeEnum[])
      : undefined;

    const queryParams = {
      communiqueCategory: communiqueCategory
        ? { category: { $in: communiqueCategory } }
        : {},
    };

    try {
      const communiqueList = await this.communiqueModel
        .find({ ...queryParams.communiqueCategory })
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .limit(resPerPage)
        .skip(skip);

      const totalCommunique = await this.communiqueModel
        .find({ ...queryParams.communiqueCategory })
        .count();

      const totalPages = Math.ceil(totalCommunique / resPerPage);

      return {
        communiqueList,
        currentPage,
        resPerPage,
        totalPages,
        totalItems: totalCommunique,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro de servidor.');
    }
  }

  // Create
  async create(
    createCommuniqueDto: CreateCommuniqueDto,
    userId: string,
  ): Promise<Communique> {
    return await this.communiqueModel.create({
      ...createCommuniqueDto,
      author: userId,
    });
  }

  // Detail
  async detail(communiqueId: string): Promise<Communique> {
    return await this.communiqueModel.findById(communiqueId).populate('author');
  }
}
