import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          secure: false,
          from: config.get('EMAIL_USER'),
          auth: {
            type: 'OAuth2',
            user: config.get('EMAIL_USER'),
            pass: config.get('EMAIL_PASSWORD'),
            clientId: config.get('EMAIL_CLIENT_ID'),
            clientSecret: config.get('EMAIL_CLIENT_SECRET'),
            refreshToken: config.get('EMAIL_REFRESH_TOKEN'),
          },
        },
        defaults: {
          from: config.get('EMAIL_USER'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
            async: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  controllers: [],
  exports: [MailService],
})
export class MailModule {}
