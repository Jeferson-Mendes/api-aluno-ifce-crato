import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class UserResetPassToken {
  @Prop()
  public code: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  public user: User;
}

export const UserResetPassTokenSchema =
  SchemaFactory.createForClass(UserResetPassToken);
