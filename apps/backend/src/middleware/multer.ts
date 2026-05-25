import multer, { type FileFilterCallback } from 'multer';

const storage = multer.memoryStorage();
const maxFileSizeBytes = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const fileFilter = (_request: Express.Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
};

export const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeBytes
  },
  fileFilter
});
