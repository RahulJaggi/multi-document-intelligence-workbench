import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { upload } from '../middleware/upload.middleware';
import { uploadDocuments } from '../controllers/upload.controller';

const router = Router();

// Wrapper middleware to intercept Multer limits and validation errors
const handleUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Allow maximum 10 files uploaded under form field key "files"
  const uploadArray = upload.array('files', 10);

  uploadArray(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Custom mapping for Multer limits errors
      let message = 'File upload error.';
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File size limit exceeded. Maximum file size is 10 MB.';
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        message = 'Too many files. Maximum allowed is 10 files.';
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file field. Please upload files under the "files" key.';
      }
      res.status(400).json({
        success: false,
        message,
      });
      return;
    } else if (err) {
      // Capture custom filter exceptions (e.g. invalid file types)
      res.status(400).json({
        success: false,
        message: err.message,
      });
      return;
    }
    next();
  });
};

router.post('/', handleUploadMiddleware, uploadDocuments);

export default router;
