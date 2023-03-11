import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Refectory } from './refectory.schema';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class RefectoryAnswer extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Refectory' })
  @ApiProperty({ type: Refectory })
  refectory: Refectory;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @ApiProperty({ type: User })
  user: User;

  @Prop()
  @ApiProperty()
  breakfast: number; // 0 | 1

  @Prop()
  @ApiProperty()
  lunch: number; // 0 | 1

  @Prop()
  @ApiProperty()
  afternoonSnack: number; // 0 | 1

  @Prop()
  @ApiProperty()
  dinner: number; // 0 | 1

  @Prop()
  @ApiProperty()
  nightSnack: number; // 0 | 1
}

export const RefectoryAnswerSchema =
  SchemaFactory.createForClass(RefectoryAnswer);
