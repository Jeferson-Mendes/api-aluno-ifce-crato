import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronService } from 'src/cron/cron.service';
import { RefectorySchema } from '../refectory/schemas/refectory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Refectory', schema: RefectorySchema }]),
  ],
  providers: [CronService],
})
export class CronModule {}
