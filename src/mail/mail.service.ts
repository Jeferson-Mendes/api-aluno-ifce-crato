import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import ServerError from '../shared/errors/ServerError';

interface ISendEmailInput {
  code: string;
  to: string;
}

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
}
