import axios from 'axios';
import { buildPrompt, PromptDocument } from './prompt.service';

/**
 * Sends formatted documents and query instructions to the local Ollama instance
 * and returns the parsed structured JSON analysis results.
 * Handles timeouts and service unavailable states.
 *
 * @param documents The list of documents containing filename, type, and text content.
 * @param userInstruction The analytical instruction details from the user.
 * @returns Promise<any> The parsed structured JSON analysis results.
 */
export const analyzeDocuments = async (
  documents: PromptDocument[],
  userInstruction: string
): Promise<any> => {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

  // Generate prompt using the prompt service
  const prompt = buildPrompt(documents, userInstruction);

  try {
    // Call local Ollama generate API with timeout (120 seconds) and low temperature options
    const response = await axios.post(
      `${ollamaBaseUrl}/api/generate`,
      {
        model: ollamaModel,
        prompt: prompt,
        stream: false,
        format: 'json', // Enforce JSON formatting output from local model
        options: {
          temperature: 0.0, // Low temperature to maximize determinism
          top_p: 0.1,       // Strict token selection
          num_predict: 4096, // High token limit to avoid response truncation
        },
      },
      {
        timeout: 120000, // 120 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const generatedText = response.data?.response;

    if (!generatedText) {
      throw new Error('Received an empty response from local Ollama model.');
    }

    // Clean up code fences if present (e.g. ```json ... ```)
    let cleanedText = generatedText.trim();
    const fenceMatch = cleanedText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenceMatch) {
      cleanedText = fenceMatch[1].trim();
    }

    try {
      // Attempt JSON parsing
      return JSON.parse(cleanedText);
    } catch (parseError: any) {
      // Log raw response and error without throwing/crashing the app
      console.error('Failed to parse raw Ollama response as JSON.');
      console.error('Raw AI Response:', generatedText);
      console.error('Parsing Error:', parseError.message);

      // Return a graceful structured error response
      return {
        summary: 'Unable to parse AI response.',
        findings: [],
        comparison: [],
        missingInformation: [],
        sources: [],
      };
    }
  } catch (error: any) {
    // Intercept connection refused, host not found, or timeout errors
    const isConnectionError =
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error');

    if (isConnectionError) {
      const connError = new Error(
        `Ollama service is unavailable at ${ollamaBaseUrl}. Please ensure Ollama is running locally and the model '${ollamaModel}' is pulled.`
      );
      (connError as any).statusCode = 503;
      throw connError;
    }

    // Capture JSON parsing errors from poorly formatted LLM outputs
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
    }

    throw error;
  }
};
