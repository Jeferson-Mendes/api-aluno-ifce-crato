import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Refectory } from 'src/refectory/schemas/refectory.schema';
import ServerError from '../shared/errors/ServerError';
import { RefectoryStatusEnum } from 'src/ts/enums';
import { RefectoryService } from '../refectory/refectory.service';
import { MailService } from '../mail/mail.service';
import { format } from 'date-fns';

@Injectable()
export class CronService {
  constructor(
    @InjectModel(Refectory.name)
    private refectoryModel: Model<Refectory>,

    private refectoryServices: RefectoryService,
    private mailServices: MailService,
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

    const date = new Date();
    try {
      await this.refectoryModel.updateOne(
        { status: 'open', vigencyDate: { $lte: date } },
        { status: 'closed' },
      );

      await this.refectoryModel.updateOne(
        {
          status: 'scheduled',
          startAnswersDate: { $lte: date },
        },
        { status: 'openToAnswer' },
      );
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  @Cron('0 19 * * *')
  async handleCron() {
    this.logger.debug('Job para lidar com status openToAnswer executando.');

    // 00, 12h
    // 12 -> Checa se há form com status 'openToAnswer' e muda para 'open'\

    try {
      await this.refectoryModel.updateOne(
        {
          status: 'openToAnswer',
        },
        { status: 'open' },
      );
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  @Cron('0 00 * * 1')
  async handleDeleteForm() {
    this.logger.debug('Rotina de expurgo de formulários sendo executada.');

    try {
      await this.refectoryModel.deleteMany({
        status: RefectoryStatusEnum.closed,
      });
    } catch (error) {
      console.log(error);
      throw new ServerError();
    }
  }

  @Cron('10 19 * * 0,1,2,3,4,5')
  async handleSendFormResult() {
    this.logger.debug('Rotina para envio de respostas aos gestores.');

    const data = await this.refectoryServices.generateAnswersPdf();

    if (data.answers && data.to.length) {
      const formatedDate = format(data.answers.vigencyDate, 'dd/MM/yyyy');
      await this.mailServices.sendFormAnswers(
        data.to,
        data.buffer,
        formatedDate,
        data.answers,
        data.answersPerUser,
      );
    }
  }
}
