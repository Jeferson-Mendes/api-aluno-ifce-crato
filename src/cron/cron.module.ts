import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronService } from 'src/cron/cron.service';
import { RefectorySchema } from '../refectory/schemas/refectory.schema';
import { RefectoryModule } from '../refectory/refectory.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Refectory', schema: RefectorySchema }]),
    RefectoryModule,
    MailModule,
  ],
  providers: [CronService],
})
export class CronModule {}
