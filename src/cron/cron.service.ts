import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Refectory } from 'src/refectory/schemas/refectory.schema';
import ServerError from '../shared/errors/ServerError';

@Injectable()
export class CronService {
  constructor(
    @InjectModel(Refectory.name)
    private refectoryModel: Model<Refectory>,
  ) {}
  private readonly logger = new Logger(CronService.name);

  // 00, 12h
  // scheduled -> openToAnswer
  // openToAnswer -> open

  @Cron('0 00 * * *')
  async handleDailyCron() {
    this.logger.debug('Job para lidar com status open/scheduled executando.');

    // open -> closed
    // 00 -> Checa se existe form 'open' para fechar
    // 00 -> Checa se existe form agendado, e passa a aceitar respostas

    const millissecondDate = new Date().getTime();
    try {
      await this.refectoryModel.updateOne(
        { status: 'open', vigencyDate: { $lte: millissecondDate } },
        { status: 'closed' },
      );

      await this.refectoryModel.updateOne(
        {
          status: 'scheduled',
          startAnswersDate: { $lte: millissecondDate },
        },
        { status: 'openToAnswer' },
      );
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  @Cron('0 12 * * *')
  async handleCron() {
    this.logger.debug('Job para lidar com status openToAnswer executando.');

    // 00, 12h
    // 12 -> Checa se há form com status 'openToAnswer' e muda para 'open'\

    const millissecondDate = new Date().getTime();
    try {
      await this.refectoryModel.updateOne(
        {
          status: 'openToAnswer',
          vigencyDate: { $lte: millissecondDate },
        },
        { status: 'open' },
      );
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }
}
