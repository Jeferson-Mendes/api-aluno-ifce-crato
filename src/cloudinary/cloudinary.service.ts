import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
// import { CloudinaryProvider } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | BadRequestException> {
    const tempDir = mkdtempSync('./');
    const fileDir = tempDir + '/' + file.originalname;
    writeFileSync(fileDir, file.buffer);

    const uploadResut = await v2.uploader.upload(
      fileDir,
      { folder: 'API_ALUNO_IFCE_CRATO' },
      (err) => {
        rmSync(fileDir, { recursive: true }); // Remove file after upload
        rmSync(tempDir, { recursive: true }); // Remove folder after upload
        if (err) {
          rmSync(fileDir, { recursive: true }); // Remove file when there are error
          rmSync(tempDir, { recursive: true }); // Remove folder when there are error
          console.log(err);
          throw new BadRequestException(
            `Something wrong when upload file. ${err}`,
          );
        }
      },
    );
    return uploadResut;
  }
}
