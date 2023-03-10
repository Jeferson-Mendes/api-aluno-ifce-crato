import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Menu } from './menu.schema';

export enum RefectoryStatusEnum {
  OPEN = 'open',
  CREATED = 'created',
  CLOSED = 'closed',
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
export class Refectory extends Document {
  @Prop({ default: RefectoryStatusEnum.CREATED })
  @ApiProperty({ enum: RefectoryStatusEnum })
  status: RefectoryStatusEnum;

  @Prop()
  @ApiProperty()
  vigencyDate: Date;

  @Prop()
  @ApiProperty()
  closingDate: Date;

  @Prop()
  @ApiProperty()
  startAnswersDate: Date;

  @Prop({ type: Object })
  @ApiProperty()
  menu: Menu;
}

export const RefectorySchema = SchemaFactory.createForClass(Refectory);
