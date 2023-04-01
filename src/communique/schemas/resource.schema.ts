import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Resource {
  @Prop()
  @ApiProperty()
  public secure_url!: string;

  @Prop({ select: false })
  public asset_id: string;

  @Prop({ select: false })
  public public_id: string;

  @Prop()
  @ApiProperty()
  public resource_type: string;

  @Prop()
  @ApiProperty()
  public etag: string;
}
