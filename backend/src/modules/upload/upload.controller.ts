import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const qrStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'qr');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `qr-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const screenshotStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'screenshots');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `dep-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const imageFileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new BadRequestException('Only PNG, JPG, JPEG, and WEBP images are supported'), false);
  }
  cb(null, true);
};

@Controller('api/upload')
export class UploadController {
  @Post('qr')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: qrStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  uploadQrCode(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No image file provided or file exceeds 5MB size limit.');
    }
    const fileUrl = `/uploads/qr/${file.filename}`;
    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
    };
  }

  @Post('screenshot')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: screenshotStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  uploadScreenshot(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No screenshot image file provided or file exceeds 5MB limit.');
    }
    const fileUrl = `/uploads/screenshots/${file.filename}`;
    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
    };
  }
}
