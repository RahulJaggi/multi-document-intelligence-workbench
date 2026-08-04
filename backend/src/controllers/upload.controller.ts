import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { parseDocument } from '../services/parser.service';

/**
 * Handles document uploads and triggers text extraction.
 * Returns file metadata and parsed plain text.
 */
export const uploadDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded or files were rejected.',
      });
      return;
    }

    // Process and parse each file asynchronously in parallel
    const documents = await Promise.all(
      files.map(async (file) => {
        const parsed = await parseDocument(file);
        return {
          id: crypto.randomUUID(),
          fileName: parsed.fileName,
          fileType: parsed.fileType,
          extractedText: parsed.extractedText,
        };
      })
    );

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error: any) {
    // Gracefully handle parsing/reading failures as bad request error messages
    res.status(400).json({
      success: false,
      message: error.message || 'Error occurred while processing documents.',
    });
  }
};
