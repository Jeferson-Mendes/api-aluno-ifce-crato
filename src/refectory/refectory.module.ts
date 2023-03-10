import { Module } from '@nestjs/common';
import { RefectoryService } from './refectory.service';
import { RefectoryController } from './refectory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RefectorySchema } from './schemas/refectory.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Refectory', schema: RefectorySchema }]),
    AuthModule,
  ],
  providers: [RefectoryService],
  controllers: [RefectoryController],
})
export class RefectoryModule {}
