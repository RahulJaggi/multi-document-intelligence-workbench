import path from 'path';
import crypto from 'crypto';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Define the absolute path for uploads directory
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique name: uuid + original extension
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

// File validation filter: allow only PDF and TXT
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimeTypes = ['application/pdf', 'text/plain'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.txt'];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only PDF (.pdf) and TXT (.txt) files are allowed.'));
  }
};

// Configure limits: 10MB per file
const limits = {
  fileSize: 10 * 1024 * 1024, // 10 MB in bytes
};

// Configure Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits,
});
