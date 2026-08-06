import fs from 'fs/promises';
import pdf from 'pdf-parse';
import { parse } from 'csv-parse/sync';
import { PDFDocument } from 'pdf-lib';

export interface ParsedDocument {
  fileName: string;
  fileType: string;
  extractedText: string;
}

/**
 * Parses an uploaded document and extracts its plain text content.
 * Supports PDF, TXT, and CSV formats.
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

  const isCsv =
    fileType === 'text/csv' ||
    fileType === 'application/csv' ||
    fileName.toLowerCase().endsWith('.csv');

  if (fileType === 'application/pdf') {
    const buffer = await fs.readFile(filePath);
    try {
      const parsedData = await pdf(buffer);
      // Clean up extracted text by trimming it
      return {
        fileName,
        fileType,
        extractedText: parsedData.text ? parsedData.text.trim() : '',
      };
    } catch (pdfError: any) {
      console.warn(`Initial PDF parse failed for ${fileName}, attempting structural repair...`);
      try {
        // Load the PDF using pdf-lib (which automatically reconstructs XRef tables)
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const repairedBytes = await pdfDoc.save();
        const repairedBuffer = Buffer.from(repairedBytes);

        // Attempt parsing again with repaired PDF buffer
        const parsedData = await pdf(repairedBuffer);
        console.log(`Successfully repaired and parsed PDF document: ${fileName}`);
        return {
          fileName,
          fileType,
          extractedText: parsedData.text ? parsedData.text.trim() : '',
        };
      } catch (repairError: any) {
        // Fall back to original parsing error if repair fails
        throw new Error(`Failed to parse PDF document (${fileName}): ${pdfError.message}`);
      }
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
  } else if (isCsv) {
    try {
      const text = await fs.readFile(filePath, 'utf-8');
      if (!text.trim()) {
        throw new Error('Empty CSV file: The uploaded file contains no data.');
      }

      let records: any[];
      try {
        records = parse(text, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } catch (err: any) {
        throw new Error(`Invalid or corrupted CSV format: ${err.message}`);
      }

      if (!records || records.length === 0) {
        throw new Error('Empty CSV file: No data records found.');
      }

      const headers = Object.keys(records[0]);
      if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
        throw new Error('Invalid CSV file: No column headers found.');
      }

      // Convert each row into a clean Header: Value string
      const formattedRows = records.map((record) => {
        return Object.entries(record)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      });

      // Separate rows with a clear boundary line
      const extractedText = formattedRows.join('\n\n-----------------------\n\n');

      return {
        fileName,
        fileType: 'text/csv',
        extractedText: extractedText.trim(),
      };
    } catch (error: any) {
      throw new Error(`Failed to parse CSV document (${fileName}): ${error.message}`);
    }
  } else {
    throw new Error(
      `Unsupported file type: ${fileType}. Only PDF, TXT, and CSV documents are supported.`
    );
  }
};
