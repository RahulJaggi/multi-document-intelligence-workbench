import fs from 'fs/promises';
import pdf from 'pdf-parse';

export interface ParsedDocument {
  fileName: string;
  fileType: string;
  extractedText: string;
}

/**
 * Parses an uploaded document and extracts its plain text content.
 * Supports PDF and TXT formats.
 *
 * @param file Express.Multer.File object containing the uploaded file path and type details.
 * @returns Promise<ParsedDocument> containing fileName, fileType, and extractedText.
 */
export const parseDocument = async (
  file: Express.Multer.File
): Promise<ParsedDocument> => {
  const filePath = file.path;
  const fileType = file.mimetype;
  const fileName = file.originalname;

  if (fileType === 'application/pdf') {
    try {
      const buffer = await fs.readFile(filePath);
      const parsedData = await pdf(buffer);
      // Clean up extracted text by trimming it
      return {
        fileName,
        fileType,
        extractedText: parsedData.text ? parsedData.text.trim() : '',
      };
    } catch (error: any) {
      throw new Error(`Failed to parse PDF document (${fileName}): ${error.message}`);
    }
  } else if (fileType === 'text/plain') {
    try {
      const text = await fs.readFile(filePath, 'utf-8');
      return {
        fileName,
        fileType,
        extractedText: text.trim(),
      };
    } catch (error: any) {
      throw new Error(`Failed to read text document (${fileName}): ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported file type: ${fileType}. Only PDF and TXT documents are supported.`);
  }
};
