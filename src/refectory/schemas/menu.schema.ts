import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

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
export class Menu extends Document {
  @Prop()
  @ApiProperty()
  breakfast: string;

  @Prop()
  @ApiProperty()
  lunch: string;

  @Prop()
  @ApiProperty()
  afternoonSnack: string;

  @Prop()
  @ApiProperty()
  dinner: string;

  @Prop()
  @ApiProperty()
  nightSnack: string;
}
