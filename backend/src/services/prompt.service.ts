export interface PromptDocument {
  fileName: string;
  fileType: string;
  extractedText: string;
}

/**
 * Builds the structured prompt for Ollama to analyze documents based on user instructions.
 * Keeps documents completely separate and instructs the model to return valid structured JSON.
 *
 * @param documents The list of documents containing filename, type, and text content.
 * @param userInstruction The analytical instruction details from the user.
 * @returns string The formatted prompt.
 */
export const buildPrompt = (
  documents: PromptDocument[],
  userInstruction: string
): string => {
  let prompt = `You are an AI document analyst.
Your responsibility is to analyze uploaded documents based only on their contents.

Guidelines:
1. Read every uploaded document completely.
2. Identify the document type.
3. Understand the information contained in every document.

If the user asks to compare documents:
- Compare only information that exists in multiple documents.
- Do not invent values.
- Do not guess.
- If comparison is impossible explain why.

If the user asks questions:
- Search every uploaded document.
- Answer only using the documents.
- Always mention the supporting document.

If the user asks "Find inconsistencies":
Check for:
- Name mismatches
- DOB mismatches
- PAN mismatches
- Aadhaar mismatches
- Mobile mismatches
- Address mismatches
- Missing information
- Conflicting values
Only report inconsistencies that actually exist. Never fabricate inconsistencies.

You MUST return ONLY a valid JSON object. Do NOT wrap the JSON response inside triple backticks (\`\`\`) or include any introductory text. Return ONLY the JSON object.
Return ONLY valid JSON. Do not include explanations. Do not include markdown. Do not include triple backticks. Do not include comments. Return exactly one valid JSON object.

The JSON schema MUST match this structure:
{
  "summary": "A concise human-readable summary explaining the analysis results, findings, and general details.",
  "findings": [
    {
      "finding": "Specific observation or insight detail.",
      "source": ["filename1.pdf"]
    }
  ],
  "comparison": [
    "Field | Document A | Document B | Status",
    "AspectName | Value in Doc A | Value in Doc B | Match/Mismatch/Not Found"
  ],
  "missingInformation": [
    {
      "info": "Specific missing detail description (e.g. Aadhaar number not found in resume.pdf)"
    }
  ],
  "sources": [
    {
      "name": "filename1.pdf"
    }
  ]
}

Note:
For the 'comparison' array, convert each compared field into the format: 'Field | Document A | Document B | Status'.
For example: 'Mobile | 9876543210 | 9999999999 | Mismatch' or 'Name | Rahul Jaggi | Rahul Jaggi | Match'.
All entries in findings, missingInformation, and sources MUST match the JSON schema format specified above. Do not output raw strings in findings/missingInformation/sources array.

UPLOADED DOCUMENTS:
`;

  documents.forEach((doc, index) => {
    prompt += `
---
Document Number: ${index + 1}
Filename: ${doc.fileName}
File Type: ${doc.fileType}
Content:
${doc.extractedText}
`;
  });

  prompt += `
---
User Instruction:
${userInstruction}

Remember: Follow the rules, analyze the documents separately, do not invent information, and return ONLY valid JSON matching the schema.
`;

  return prompt;
};
