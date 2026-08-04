import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const uploadDocuments = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded or files were rejected.',
      });
      return;
    }

    const documents = files.map((file) => ({
      id: crypto.randomUUID(),
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    }));

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    next(error);
  }
};
