export interface PromptDocument {
  fileName: string;
  fileType: string;
  extractedText: string;
}

/**
 * Builds the structured prompt for the LLM to analyze the documents.
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
  let prompt = 'You are an AI document analyst.\n\n';

  // Append each document with strict boundaries
  documents.forEach((doc, idx) => {
    prompt += `Document ${idx + 1}\n\n`;
    prompt += `Filename:\n${doc.fileName}\n\n`;
    prompt += `Content:\n${doc.extractedText}\n\n`;
    prompt += `-------------------------\n\n`;
  });

  // Append user instruction
  prompt += `User Instruction:\n${userInstruction}\n\n`;

  // Append rules and JSON schema instructions
  prompt += `Rules:
- Answer only using the uploaded documents.
- Mention which document supports each finding.
- If comparison is not possible, explain why.
- Do not make assumptions.
- Return structured JSON only.

Your output must follow this exact JSON schema:
{
  "summary": "A brief overall summary of the documents and analysis",
  "findings": [
    "Finding 1 (supported by Document X)",
    "Finding 2 (supported by Document Y)"
  ],
  "comparison": [
    "Comparison/contrast point 1",
    "Comparison/contrast point 2"
  ],
  "missingInformation": [
    "Any gaps, missing data, or why comparison might be impossible/limited"
  ],
  "sources": [
    "Filename of source documents referenced"
  ]
}

Respond ONLY with the JSON block. Do not wrap it in markdown code blocks like \`\`\`json.`;

  return prompt;
};
