import { Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements
    PipeTransform<Express.Multer.File, Promise<Partial<Express.Multer.File>>>
{
  async transform(
    image?: Express.Multer.File,
  ): Promise<Partial<Express.Multer.File>> {
    if (image) {
      const originalname = path.parse(image.originalname).name;
      const buffer = await sharp(image.buffer)
        .resize(800)
        .withMetadata()
        .toBuffer();
      return {
        originalname,
        buffer,
      };
    }
  }
}
