export interface PromptDocument {
  fileName: string;
  fileType: string;
  extractedText: string;
}

/**
 * Generates a clean, structured analysis prompt for a local Ollama model.
 * Preserves boundaries and formats the context and rules clearly.
 *
 * @param documents List of parsed documents with extracted text.
 * @param userInstruction The user's query or specific instructions.
 * @returns string The fully formatted prompt.
 */
export const buildPrompt = (
  documents: PromptDocument[],
  userInstruction: string
): string => {
  let prompt = `You are an AI document analyst.

Your task is to analyze one or more uploaded documents.

Rules:

- Answer ONLY using information found in the uploaded documents.
- Never invent information.
- If information is missing, clearly state that it was not found.
- If documents cannot be meaningfully compared, explain why.
- Always mention which document supports each finding.
- Clearly separate extracted facts from interpretations.
- Return ONLY valid JSON.
- Do NOT return Markdown.
- Do NOT wrap JSON inside triple backticks.

The JSON format should be:

{
  "summary": "...",
  "findings": [],
  "comparison": [],
  "missingInformation": [],
  "sources": []
}

`;

  // Append each document preserving boundaries
  documents.forEach((doc, idx) => {
    prompt += `------------------------------------

Document ${idx + 1}

Filename:
${doc.fileName}

File Type:
${doc.fileType}

Content:

${doc.extractedText}

`;
  });

  // Closing boundary of the last document
  prompt += `------------------------------------

User Instruction:

${userInstruction}`;

  return prompt;
};
