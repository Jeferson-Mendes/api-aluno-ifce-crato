import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRolesEnum {
  ADM = 'Adm',
  STUDENT = 'Student',
  EMPLOYEE = 'employee',
  EXTERNAL = 'External',
  REFECTORY_MANAGER = 'Refectory_Manager',
  MURAL_MANAGER = 'Mural_Manager',
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
export class User extends Document {
  @Prop()
  @ApiProperty()
  name: string;

  @Prop({ unique: [true, 'Duplicate email entered'] })
  @ApiProperty()
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop()
  @ApiProperty()
  phoneNumber: string;

  @Prop()
  @ApiProperty({ enum: UserRolesEnum, default: UserRolesEnum.STUDENT })
  userRoles: UserRolesEnum[];

  @Prop()
  @ApiProperty({ required: false })
  registration?: string;

  @Prop()
  @ApiProperty({ required: false })
  siape?: string;

  @Prop({ default: true })
  @ApiProperty()
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
