import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CommuniqueController } from './communique.controller';
import { CommuniqueService } from './communique.service';
import { CommuniqueSchema } from './schemas/communique.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Communique', schema: CommuniqueSchema },
    ]),
    AuthModule,
    CloudinaryModule,
  ],
  controllers: [CommuniqueController],
  providers: [CommuniqueService],
})
export class CommuniqueModule {}
