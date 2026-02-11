import multer from 'multer';
import multerS3 from 'multer-s3';
import 'dotenv/config';

import { awsS3Client } from './aws';

import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

interface CustomRequest extends Request {
  fileValidationError?: string;
}

const documentFileFilter = (_req: CustomRequest, file: Express.Multer.File, callback: FileFilterCallback): void => {
  const allowedExtensions = /\.(jpg|jpeg|png|gif|svg|JPG|JPEG|webp|pdf|txt|docx)$/;

  if (!file.originalname.match(allowedExtensions)) {
    callback(null, false);
    return;
  }

  callback(null, true);
};

const fileUpload = multer({
  storage: multerS3({
    s3: awsS3Client,
    bucket: process.env.AWS_BUCKET_NAME || '',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (_req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (_req, file, cb) {
      let folder = 'general/';

      // Customize the folder based on your needs
      if (file.fieldname) {
        folder = `${file.fieldname}/`;
      }
      const fileName = `${folder}${file.originalname}-${Date.now().toString()}`;
      cb(null, fileName);
    },
  }),
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // limit 10mb
  },
});

export default fileUpload;
