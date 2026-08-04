import { Router, Request, Response, NextFunction } from 'express';
import { analyzeDocuments } from '../services/ai.service';

const router = Router();

// Validation middleware for analyze body
const validateAnalyzePayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { documents, instruction } = req.body;

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Missing or invalid "documents". It must be a non-empty array of documents.',
    });
    return;
  }

  // Validate each document item
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    if (!doc.fileName || !doc.fileType || typeof doc.extractedText !== 'string') {
      res.status(400).json({
        success: false,
        message: `Invalid document structure at index ${i}. Each document must have "fileName", "fileType", and "extractedText".`,
      });
      return;
    }
  }

  if (!instruction || typeof instruction !== 'string' || instruction.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'Missing or invalid "instruction". It must be a non-empty string.',
    });
    return;
  }

  next();
};

// POST /api/analyze
router.post(
  '/',
  validateAnalyzePayload,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documents, instruction } = req.body;
      const analysis = await analyzeDocuments(documents, instruction);
      
      // Return the raw AI analysis JSON response directly as specified
      res.status(200).json(analysis);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error occurred during AI analysis.',
      });
    }
  }
);

export default router;
