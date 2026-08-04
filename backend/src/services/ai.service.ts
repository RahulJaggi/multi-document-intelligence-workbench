import { GoogleGenAI } from '@google/genai';
import { buildPrompt, PromptDocument } from './prompt.service';

/**
 * Sends formatted documents and query instructions to the Gemini model
 * and returns the parsed structured JSON analysis results.
 *
 * @param documents The list of documents containing filename, type, and text content.
 * @param userInstruction The analytical instruction details from the user.
 * @returns Promise<any> The parsed structured JSON analysis object.
 */
export const analyzeDocuments = async (
  documents: PromptDocument[],
  userInstruction: string
): Promise<any> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not defined. Please set it in your environment variables (.env).'
    );
  }

  // Initialize official unified Google Gen AI client
  const ai = new GoogleGenAI({ apiKey });

  // Generate structured prompt using prompt service
  const prompt = buildPrompt(documents, userInstruction);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error('Received an empty response from the AI model.');
    }

    // Parse and return the generated JSON
    return JSON.parse(text);
  } catch (error: any) {
    throw new Error(`AI Analysis failed: ${error.message}`);
  }
};
