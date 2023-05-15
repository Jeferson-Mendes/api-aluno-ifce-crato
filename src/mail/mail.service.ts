import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import ServerError from '../shared/errors/ServerError';
import { RefectoryAnswerType } from 'src/ts/enums';

interface ISendEmailInput {
  code: string;
  to: string;
}

type ResultForm = {
  type: string;
  total: number;
};

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async accountConfirmation({ code, to }: ISendEmailInput): Promise<void> {
    this.mailerService
      .sendMail({
        to,
        from: process.env.EMAIL_USER,
        subject: 'IFCE Crato - Confirmação de email',
        template: 'account-confirmation',
        context: {
          code,
        },
      })
      .then(() => {
        console.log('email has been sended');
      })
      .catch((error) => {
        console.log(error);
        throw new ServerError();
      });
  }

  async sendForgotPassword({ code, to }: ISendEmailInput): Promise<void> {
    this.mailerService
      .sendMail({
        to,
        from: process.env.EMAIL_USER,
        subject: 'IFCE Crato - Recuperação de senha',
        template: 'forgot-password',
        context: {
          code,
        },
      })
      .then(() => {
        console.log('forgot password email has been sended');
      })
      .catch((error) => {
        console.log(error);
        throw new ServerError();
      });
  }

  async sendFormAnswers(
    to: string[],
    buffer: Buffer,
    vigencyDate: string,
    resultRefectory: Partial<RefectoryAnswerType>,
    resultUsers: ResultForm[],
  ): Promise<any> {
    this.mailerService
      .sendMail({
        to,
        from: process.env.EMAIL_USER,
        subject: `O Relatório do Formulário para Refeições do dia ${vigencyDate} já está disponível`,
        template: 'form-result',
        context: {
          vigencyDate,
          resultRefectory,
          resultUsers,
        },
        attachments: [
          {
            filename: 'respostas.txt',
            content: buffer,
          },
        ],
      })
      .then(() => {
        console.log('Form result email has been sended');
      })
      .catch((error) => {
        console.log(error);
        throw new ServerError();
      });
  }
}
