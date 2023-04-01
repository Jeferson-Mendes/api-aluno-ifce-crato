import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Resource } from './resource.schema';

export enum CommuniqueTypeEnum {
  LECTURE = 'Lecture',
  NEWS = 'News',
  EVENT = 'Event',
  NOTICE = 'Notice',
}

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
export class Communique extends Document {
  @Prop()
  @ApiProperty({ enum: CommuniqueTypeEnum })
  category: CommuniqueTypeEnum;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @ApiProperty()
  author: User;

  @Prop()
  @ApiProperty()
  title: string;

  @Prop()
  @ApiProperty()
  contents: string;

  @Prop()
  @ApiProperty({ required: false })
  referenceLinks?: string[];

  @Prop()
  @ApiProperty()
  resource: Resource;
}

export const CommuniqueSchema = SchemaFactory.createForClass(Communique);
