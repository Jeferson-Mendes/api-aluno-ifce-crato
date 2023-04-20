import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../users/schemas/user.schema';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { UserResetPassTokenSchema } from '../users/schemas/user-reset-password.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          },
        };
      },
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserResetPassToken', schema: UserResetPassTokenSchema },
    ]),
    MailModule,
    CloudinaryModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
