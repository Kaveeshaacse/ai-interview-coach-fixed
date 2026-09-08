import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts raw text from PDF or DOCX file path
 * @param {string} filePath - Absolute or relative path to file
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromFile = async (filePath, mimeType) => {
  try {
    const fileBuffer = await fs.readFile(filePath);

    if (mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text || '';
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      filePath.toLowerCase().endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value || '';
    }

    // Default: try utf-8 text read
    return fileBuffer.toString('utf-8');
  } catch (error) {
    console.error(`Text extraction failed for ${filePath}:`, error.message);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  }
};

export default {
  extractTextFromFile,
};
